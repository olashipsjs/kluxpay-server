import { string } from 'joi';
import bearerAuthorization from '../middlewares/bearerAuthorization';
import Offer from '../models/offer';
import Trade, { TradeDocument } from '../models/trade';
import User from '../models/user';
import Wallet from '../models/wallet';

const tradeResolver = {
  Query: {
    getTrade: async (_: any, { id }: { id: string }) => {
      try {
        const trade = await Trade.findById(id);

        if (!trade) {
          throw new Error('Could not find trade');
        }

        return trade;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
    getTrades: async (_: any) => {
      try {
        const trades = await Trade.find();

        if (!trades || trades.length === 0) {
          throw new Error('No trades found');
        }

        return trades;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
    getUserTrades: async (_: any, __: any, { req }: any) => {
      try {
        const { id } = await bearerAuthorization(req);

        const trades = await Trade.find().populate([
          { path: 'offer' },
          { path: 'wallet', select: '-privateKey' },
        ]);

        if (!trades || trades.length === 0) {
          return [];
        }

        const userTrades = trades.filter((trade) => {
          return (
            (trade as any).offer.createdBy.toString() === id.toString() ||
            trade.createdBy.toString() === id.toString()
          );
        });

        console.log({ userTrades });

        return userTrades;
      } catch (error) {
        console.log((error as Error).message);

        throw new Error((error as Error).message);
      }
    },
  },

  Trade: {
    offer: async ({ offer }: any) => {
      try {
        const document = await Offer.findById(offer);
        return document;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },

    createdBy: async ({ createdBy }: { createdBy: string }) => {
      try {
        const user = await User.findById(createdBy);
        return user;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },

    wallet: async ({ wallet }: { wallet: string }) => {
      try {
        const doc = await Wallet.findById(wallet);
        return doc;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    createTrade: async (
      _: any,
      { payload }: { payload: Omit<TradeDocument, '_id' | 'createdBy'> },
      { req }: any
    ) => {
      try {
        const { id } = await bearerAuthorization(req);

        const user = await User.findById(id);
        const offer = await Offer.findById(payload.offer);

        if (!user || !offer) {
          throw new Error('Unable to complete request');
        }

        if (
          offer.minLimit / payload.rate > payload.amount ||
          payload.amount > offer.maxLimit / payload.rate
        ) {
          throw new Error(
            'Invalid trade amount. Either offer minimum or maximum offer limit is exceeded'
          );
        }

        if (!user.isEmailVerified) {
          throw new Error('Only verified users are allowed to post offers.');
        }

        if (user._id === offer.createdBy) {
          throw new Error('You cannot trade with yourself.');
        }

        const trade = new Trade({ createdBy: id, ...payload });
        await trade.save();

        return trade;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default tradeResolver;
