import User from '../../models/user';
import cache from '../../utils/cache';
import Wallet from '../../models/wallet';
import Network from '../../models/network';
import { getCoinsList } from '../../apis/coins';
import handleError from '../../utils/handleError';
import Offer, { OfferDocument } from '../../models/offer';
import ethereumService from '../../services/ethereumService';
import bearerAuthorization from '../../middlewares/bearerAuthorization';
import { getFiats } from '../../apis/fiat';

const offerResolver = {
  Query: {
    getOfferById: async (_: any, { offerId }: { offerId: string }) => {
      try {
        const offer = await Offer.findOne({ _id: offerId });

        if (!offer) {
          throw new Error('Unable to find offer');
        }

        return offer;
      } catch (error) {
        handleError(error);
      }
    },

    getAllOffers: async (
      _: any,
      variables: {
        fiat: string;
        page: number;
        type: string;
        limit: number;
      },
      { req }: any
    ) => {
      let { page = 1, limit = 50, type = 'all', fiat = 'NGN' } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

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

        // Fetch matching offers with pagination
        const offers = await Offer.find({
          fiat,
          isActive: true,
          type: { $in: types },
          createdBy: { $nin: loggedInUser.id },
        })
          .skip(pageNumber * limitNumber)
          .limit(limitNumber);

        // Get total count for pagination
        const total = await Offer.countDocuments({
          fiat,
          isActive: true,
          type: { $in: types },
          createdBy: { $nin: loggedInUser.id },
        });

        return {
          total,
          limit: limitNumber,
          page: pageNumber + 1,
          offers: offers || [],
        };
      } catch (error) {
        handleError(error);
      }
    },

    getUserOffers: async (_: any, __: any, { req }: any) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const offers = await Offer.find({ createdBy: loggedInUser.id });

        return offers;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Offer: {
    createdBy: async (parent: OfferDocument) => {
      try {
        const offer = await Offer.findById(parent._id).populate({
          path: 'createdBy',
          select: '-password',
        });
        return offer?.createdBy;
      } catch (error) {
        handleError(error);
      }
    },

    coin: async (parent: OfferDocument) => {
      try {
        let coins: any = [];

        const cachedCoins = await cache.get(`${parent.fiat}-coins-${1}`);

        if (cachedCoins) {
          coins = JSON.parse(cachedCoins as string);
        } else {
          // Cache miss: Fetch data again
          console.log('Cache miss. Fetching data...');

          await getCoinsList(1, parent.fiat);
          coins = JSON.parse(
            (await cache.get(`${parent.fiat}-coins-${1}`)) || '[]'
          );
        }

        const coin = coins.find((coin: any) => coin.id === Number(parent.coin));

        return coin;
      } catch (error) {
        handleError(error);
      }
    },

    fiat: async (parent: OfferDocument) => {
      try {
        let fiats: any = [];
        const cacheFiats = await cache.get('fiats');

        if (cacheFiats) {
          fiats = JSON.parse(cacheFiats as string);
        } else {
          await getFiats();
          fiats = JSON.parse((await cache.get('fiats')) || '[]');
        }

        const fiat = fiats.find((fiat: any) => {
          return fiat.symbol === parent.fiat;
        });

        return fiat;
      } catch (error) {
        handleError(error);
      }
    },

    payment: async (parent: OfferDocument) => {
      try {
        const offer = await Offer.findById(parent._id).populate({
          path: 'payment',
        });

        return offer?.payment;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    activateOffer: async (
      _: any,
      { offerId, rate }: { offerId: string; rate: number },
      { req }: any
    ) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const offer = await Offer.findOne({
          _id: offerId,
          createdBy: loggedInUser.id,
        }).populate([{ path: 'createdBy' }, { path: 'coin' }]);

        if (!offer) {
          throw new Error('Offer not found');
        }

        const wallet = await Wallet.findOne({
          user: offer.createdBy._id,
        });

        if (!wallet) {
          throw new Error('Unable to activate the offer.');
        }

        const network = await Network.findOne({ name: wallet.network });
        if (!network) {
          throw new Error('Wallet network not found');
        }

        let coins: any[] = [];

        const cachedCoins = await cache.get(`${offer.fiat}-coins-${1}`);

        if (cachedCoins) {
          coins = JSON.parse(cachedCoins as string);
        } else {
          // Cache miss: Fetch data again
          console.log('Cache miss. Fetching data...');

          await getCoinsList(1, offer.fiat);
          coins = JSON.parse(
            (await cache.get(`${offer.fiat}-coins-${1}`)) || '[]'
          );
        }

        const coin = coins.find((coin: any) => coin.id === Number(offer.coin));

        let balance;

        switch (network.name) {
          case 'ethereum':
            balance = await ethereumService.getContractBalance({
              walletAddress: wallet.publicKey,
              contractAddress: coin?.platform?.token_address,
            });
            break;

          default:
            throw new Error('Invalid blockchain platform');
        }

        if (balance === undefined) {
          balance = 0;
        }

        const AMOUNT = offer.minLimit / rate;

        if (AMOUNT > balance) {
          throw new Error('Insufficient balance');
        }

        await Offer.findByIdAndUpdate(
          offer._id,
          { isActive: true },
          { new: true }
        );

        return { isSuccess: true };
      } catch (error) {
        handleError(error);
      }
    },

    createOffer: async (_: any, variables: any, { req }: any) => {
      const { coinId, paymentId, ...rest } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

        const user = await User.findById(loggedInUser.id);

        if (!user) {
          throw new Error('Unauthorized request.');
        }

        if (!user.isEmailVerified) {
          throw new Error('Email verification required to post offers.');
        }

        const offer = await Offer.create({
          coin: coinId,
          payment: paymentId,
          createdBy: loggedInUser.id,
          ...rest,
        });

        return offer;
      } catch (error) {
        handleError(error);
      }
    },

    updateOffer: async (_: any, variables: any, { req }: any) => {
      const { offerId, coinId, fiatId, paymentId, ...rest } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

        const newOffer = await Offer.findOneAndUpdate(
          { _id: offerId, createdBy: loggedInUser.id },
          { coin: coinId, fiat: fiatId, payment: paymentId, ...rest },
          { new: true }
        );

        if (!newOffer) {
          throw new Error('Unable to update offer');
        }

        return newOffer;
      } catch (error) {
        handleError(error);
      }
    },

    deleteOffer: async (
      _: any,
      { offerId }: { offerId: string },
      { req }: any
    ) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const deletedOffer = await Offer.findOneAndDelete({
          _id: offerId,
          createdBy: loggedInUser.id,
        });

        if (!deletedOffer) {
          throw new Error('Unable to delete offer');
        }

        return { isSuccess: true };
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default offerResolver;
