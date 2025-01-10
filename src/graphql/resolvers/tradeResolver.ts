import User from '../../models/user';
import Offer from '../../models/offer';
import Wallet from '../../models/wallet';
import aws256gsm from '../../utils/aws256gsm';
import handleError from '../../utils/handleError';
import Trade, { TradeDocument } from '../../models/trade';
import ethereumService from '../../services/ethereumService';
import bearerAuthorization from '../../middlewares/bearerAuthorization';
import Network from '../../models/network';
import Transaction from '../../models/transaction';
import rateLimit from 'express-rate-limit';

const getWallet = async (userId: TradeDocument['_id']) => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    throw new Error('Wallet not found.');
  }
  return wallet;
};

const tradeResolver = {
  Query: {
    getTradeById: async (
      _: any,
      { tradeId }: { tradeId: string },
      { req }: any
    ) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const trade = await Trade.findOne({
          _id: tradeId,
          createdBy: loggedInUser.id,
        });

        if (!trade) {
          throw new Error('Could not find trade');
        }

        const currentTime = Date.now();
        const tradeTimestamp = new Date((trade as any).createdAt).getTime();
        const offerDurationInMs = (trade as any).offer.timeout * 36000;

        if (currentTime > tradeTimestamp + offerDurationInMs) {
          trade.status = 'cancelled';
          await trade.save();
        }

        return trade;
      } catch (error) {
        handleError(error);
      }
    },

    getAllTrades: async (_: any) => {
      try {
        const trades = await Trade.find();

        if (!trades || trades.length === 0) {
          throw new Error('No trades found');
        }

        return trades;
      } catch (error) {
        handleError(error);
      }
    },

    getUserTrades: async (_: any, __: any, { req }: any) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const trades = await Trade.find()
          .lean()
          .populate([{ path: 'offer' }, { path: 'createdBy' }]);

        const userTrades = trades.filter((trade: any) => {
          return (
            trade.offer.createdBy._id.toString() ===
              loggedInUser.id.toString() ||
            trade.createdBy._id.toString() === loggedInUser.id.toString()
          );
        });

        return userTrades;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Trade: {
    offer: async (parent: TradeDocument) => {
      try {
        const trade = await Trade.findById(parent._id).populate({
          path: 'offer',
        });
        return trade?.offer;
      } catch (error) {
        handleError(error);
      }
    },

    createdBy: async (parent: TradeDocument) => {
      try {
        const trade = await Trade.findById(parent._id).populate({
          path: 'createdBy',
          select: '-password',
        });
        return trade?.createdBy;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    createTrade: async (
      _: any,
      variables: { offerId: string; rate: number; amount: number },
      { req }: any
    ) => {
      const { offerId, rate, amount } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

        const user = await User.findById(loggedInUser.id);

        if (!user) {
          throw new Error('User account was not found');
        }

        if (!user.isEmailVerified) {
          throw new Error('Email verification required');
        }

        const offer = await Offer.findById(offerId).populate([
          { path: 'coin' },
          { path: 'createdBy' },
        ]);

        if (!offer) throw new Error('Offer not found');

        if (offer.createdBy.equals(loggedInUser.id)) {
          throw new Error('Cannot trade with your own offer');
        }

        if (amount < offer.minLimit) {
          throw new Error(`Amount cannot be less than ${offer.minLimit}`);
        }

        if (amount > offer.maxLimit) {
          throw new Error(`Amount cannot be greater than ${offer.maxLimit}`);
        }

        const COIN = (offer as any).coin;

        const wallet = await getWallet(
          offer.type === 'buy' ? offer.createdBy._id : loggedInUser.id
        );

        const network = await Network.findOne({ name: wallet.network });
        if (!network) {
          throw new Error('Wallet network not found');
        }

        let tx;

        const AMOUNT = amount / rate;
        const FEE = AMOUNT * (2 / 100);

        if (network.name === 'ethereum') {
          tx = await ethereumService.send({
            contractAddress: COIN.contractAddress,
            amount: String((AMOUNT + FEE).toFixed(4)),
            to: process.env.ESCROW_ETHEREUM_PUBLIC_KEY!,
            signingKey: aws256gsm.decrypt(wallet.privateKey),
          });
        }

        if (!tx) {
          throw new Error('Transaction error, cannot complete trading.');
        }

        const trade = new Trade({
          rate,
          amount,
          offer: offerId,
          createdBy: loggedInUser.id,
        });

        await trade.save();

        await Transaction.create({
          to: tx.to,
          from: tx.from,
          txHash: tx.hash,
          trade: trade._id,
          amount: amount + FEE,
          network: network.name,
          type: 'escrow reserve',
          confirmations: await tx.confirmations(),
          user: offer.type === 'buy' ? offer.createdBy._id : loggedInUser.id,
        });

        return trade;
      } catch (error) {
        handleError(error);
      }
    },

    completeTrade: async (
      _: any,
      { tradeId }: { tradeId: string },
      { req }: any
    ) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const trade = await Trade.findOne({
          _id: tradeId,
          createdBy: loggedInUser.id,
          status: { $or: ['pending', 'paid'] },
        }).populate([{ path: 'offer' }, { path: 'createdBy' }]);

        if (!trade) {
          throw new Error('We could not find your trade');
        }

        const offer = await Offer.findById(trade.offer._id).populate({
          path: 'coin',
        });

        if (!offer) {
          throw new Error('Trade offer was not found.');
        }

        const COIN = (offer as any).coin;

        const wallet = await getWallet(
          offer.type === 'buy' ? trade.createdBy._id : offer.createdBy._id
        );

        const network = await Network.findOne({ name: wallet.network });

        if (!network) {
          throw new Error('Wallet network not found');
        }

        let tx;

        const AMOUNT = trade.amount / trade.rate;

        if (network.name === 'ethereum') {
          tx = await ethereumService.send({
            amount: String(AMOUNT),
            contractAddress: COIN.contractAddress,
            to: wallet.publicKey,
            signingKey: aws256gsm.decrypt(
              process.env.ESCROW_ETHEREUM_PRIVATE_KEY!
            ),
          });
        }

        if (!tx) {
          throw new Error('Unable to complete transaction. Try again later.');
        }

        await Transaction.create({
          to: tx.to,
          from: tx.from,
          txHash: tx.hash,
          trade: trade._id,
          amount: trade.amount,
          network: network.name,
          type: 'escrow release',
          confirmations: await tx.confirmations(),
          user: offer.type === 'buy' ? offer.createdBy._id : loggedInUser.id,
        });

        trade.status = 'completed';
        await trade.save();

        return trade;
      } catch (error) {
        handleError(error);
      }
    },

    cancelTrade: async (
      _: any,
      { tradeId }: { tradeId: string },
      { req }: any
    ) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const trade = await Trade.findOne({
          _id: tradeId,
          createdBy: loggedInUser.id,
          status: { $or: ['pending', 'paid'] },
        }).populate([{ path: 'offer' }, { path: 'createdBy' }]);

        if (!trade) {
          throw new Error('Trade not found');
        }

        const offer = await Offer.findById(trade.offer._id).populate({
          path: 'coin',
        });

        if (!offer) {
          throw new Error('Trade offer was not found.');
        }

        const COIN = (offer as any).coin;

        const wallet = await getWallet(
          offer.type === 'buy' ? offer.createdBy._id : trade.createdBy._id
        );

        const network = await Network.findOne({ name: wallet.network });
        if (!network) {
          throw new Error('Wallet network not found');
        }

        let tx;

        const AMOUNT = trade.amount / trade.rate;
        const FEE = AMOUNT * (2 / 100);

        if (network.name === 'ethereum') {
          tx = await ethereumService.send({
            contractAddress: COIN.contractAddress,
            amount: String((AMOUNT + FEE).toFixed(2)),
            to: wallet.publicKey,
            signingKey: aws256gsm.decrypt(
              process.env.ESCROW_ETHEREUM_PRIVATE_KEY!
            ),
          });
        }

        if (!tx) {
          throw new Error('Unable to complete transaction. Try again later.');
        }

        await Transaction.create({
          to: tx.to,
          from: tx.from,
          txHash: tx.hash,
          trade: trade._id,
          amount: trade.amount,
          network: network.name,
          type: 'escrow release',
          confirmations: await tx.confirmations(),
          user:
            offer.type === 'buy' ? offer.createdBy._id : trade.createdBy._id,
        });

        trade.status = 'cancelled';
        await trade.save();

        return trade;
      } catch (error) {
        handleError(error);
      }
    },

    paidTrade: async (_: any, variables: { tradeId: string }) => {
      const { tradeId } = variables;

      try {
        const trade = await Trade.findById(tradeId);

        if (!trade) {
          throw new Error('Trade was not found');
        }

        trade.status = 'paid';
        await trade.save();

        return trade;
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default tradeResolver;
