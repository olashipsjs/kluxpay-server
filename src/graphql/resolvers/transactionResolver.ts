import bearerAuthorization from '../../middlewares/bearerAuthorization';
import Transaction, { TransactionDocument } from '../../models/transaction';
import handleError from '../../utils/handleError';

const transactionResolver = {
  Query: {
    getAllTransactions: async (_: any, __: any, { req }: any) => {
      try {
        await bearerAuthorization(req);

        const transactions = await Transaction.find();

        return transactions;
      } catch (error) {
        handleError(error);
      }
    },

    getUserTransactions: async (_: any, __: any, { req }: any) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const userTransactions = await Transaction.find({
          user: loggedInUser.id,
        });

        return userTransactions;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Transaction: {
    user: async (parent: TransactionDocument) => {
      try {
        const transaction = await Transaction.findById(parent._id).populate({
          path: 'user',
          select: '-password',
        });

        return transaction?.user;
      } catch (error) {
        handleError(error);
      }
    },

    trade: async (parent: TransactionDocument) => {
      try {
        const transaction = await Transaction.findById(parent._id).populate({
          path: 'trade',
        });

        return transaction?.trade;
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default transactionResolver;
