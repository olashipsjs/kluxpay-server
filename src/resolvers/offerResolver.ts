import bearerAuthorization from '../middlewares/bearerAuthorization';
import Offer, { OfferDocument } from '../models/offer';
import Payment from '../models/payment';
import User from '../models/user';
import Wallet from '../models/wallet';
import ethereumService from '../services/ethereumService';

const offerResolver = {
  Query: {
    getOffer: async (_: any, { id }: { id: string }) => {
      try {
        const offer = await Offer.findById(id);

        if (!offer) {
          throw new Error('Unable to find offer');
        }

        return offer;
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },

    getOffers: async (
      _: any,
      {
        payload,
      }: {
        payload: {
          page: number;
          limit: number;
          type: string;
          assets: string;
        };
      }
    ) => {
      let { page, limit, assets, type } = payload;

      try {
        const defaultAssets = ['tether', 'bitcoin', 'ethereum', 'usd-coin'];

        // Ensure page and limit are non-negative integers
        const pageNumber = Math.max(0, page - 1);
        const limitNumber = Math.max(1, limit);

        // Normalize the "type" and "assets" fields to arrays
        const types =
          type === 'all'
            ? ['buy', 'sell']
            : Array.isArray(type)
            ? type
            : type.split(',');

        const assetList =
          assets === 'all'
            ? defaultAssets
            : Array.isArray(assets)
            ? assets
            : assets.split(',');

        // Fetch matching offers with pagination
        const offers = await Offer.find({
          coinId: { $in: assetList },
          type: { $in: types },
        })
          .skip(pageNumber * limitNumber)
          .limit(limitNumber);

        // Get total count for pagination
        const total = await Offer.countDocuments({
          coinId: { $in: assetList },
          type: { $in: types },
        });

        return {
          total,
          limit: limitNumber,
          page: pageNumber + 1,
          assets: defaultAssets,
          offers: offers || [],
        };
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },

    getUserOffers: async (_: any, __: any, { req }: any) => {
      try {
        const { id } = await bearerAuthorization(req);

        const offers = await Offer.find({ createdBy: id });

        return offers ? offers : [];
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },

  Offer: {
    createdBy: async ({
      createdBy,
    }: {
      createdBy: OfferDocument['createdBy'];
    }) => {
      try {
        const user = await User.findById(createdBy);
        return user;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },

    payment: async ({ payment }: { payment: string }) => {
      try {
        const document = await Payment.findOne({ _id: payment });

        return document;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    activateOffer: async (_: any, { payload }: any) => {
      try {
        const offer = await Offer.findById(payload.id).populate('createdBy');

        if (!offer) {
          throw new Error('Offer not found');
        }

        const createdBy = offer.createdBy;

        const wallet = await Wallet.findOne({
          platform: payload.platform,
          user: createdBy._id,
        });

        if (!wallet) throw new Error('Wallet not found');

        let balance: undefined | number = undefined;

        switch (wallet.platform) {
          case 'ethereum':
            balance = await ethereumService.getAssetBalance({
              tokenAddress: payload.tokenAddress,
              walletAddress: wallet.publicKey,
            });
            break;

          default:
            throw new Error('Invalid blockchain platform');
        }

        if (!balance) {
          throw new Error('Error fetching asset balance');
        }

        if (balance < Number(offer.amount)) {
          throw new Error('Insufficient balance');
        }

        offer.isActive = true;
        await offer.save();

        return offer;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },

    createOffer: async (
      _: any,
      { payload }: { payload: Omit<OfferDocument, '_id'> },
      { req }: any
    ) => {
      try {
        const { id } = await bearerAuthorization(req);
        const user = await User.findById(id);

        if (!user) {
          throw new Error('Authorized request.');
        }

        if (!user.isEmailVerified) {
          throw new Error('Only verified users are allowed to post offers.');
        }

        const offer = await Offer.create({ ...payload, createdBy: id });

        return offer;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },

    updateOffer: async (
      _: any,
      {
        id,
        payload,
      }: {
        id: string;
        payload: Omit<OfferDocument, '_id' | 'createdBy' | 'type'>;
      },
      { req }: any
    ) => {
      try {
        const user = await bearerAuthorization(req);

        const newOffer = await Offer.findOneAndUpdate(
          { _id: id, createdBy: user.id },
          { ...payload },
          { new: true }
        );

        if (!newOffer) {
          throw new Error('Unable to update offer');
        }

        return newOffer;
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },

    deleteOffer: async (_: any, { id }: { id: string }, { req }: any) => {
      try {
        const user = await bearerAuthorization(req);

        const deletedOffer = await Offer.findOneAndDelete(
          { _id: id, createdBy: user.id },
          { new: true }
        );

        if (!deletedOffer) {
          throw new Error('Unable to delete offer');
        }

        return deletedOffer;
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default offerResolver;
