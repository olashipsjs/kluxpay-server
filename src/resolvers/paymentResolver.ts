import bearerAuthorization from '../middlewares/bearerAuthorization';
import Payment, { PaymentDocument } from '../models/payment';
import User from '../models/user';

const paymentResolver = {
  Query: {
    getPayment: async (_: any, { id }: { id: string }, { req }: any) => {
      try {
        const user = await bearerAuthorization(req);

        const payment = await Payment.findOne({ _id: id, createdBy: user.id });

        if (!payment) {
          throw new Error('Unable to find payment method');
        }

        return payment;
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },
    getUserPayments: async (_: any, __: any, { req }: any) => {
      try {
        const { id } = await bearerAuthorization(req);

        const offers = await Payment.find({ createdBy: id });

        return offers ? offers : [];
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },
  },

  Payment: {
    createdBy: async ({
      createdBy,
    }: {
      createdBy: PaymentDocument['createdBy'];
    }) => {
      try {
        const user = await User.findById(createdBy);
        return user;
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    createPayment: async (
      _: any,
      { payload }: { payload: Omit<PaymentDocument, '_id'> },
      { req }: any
    ) => {
      try {
        const { id } = await bearerAuthorization(req);

        const payment = await Payment.create({ ...payload, createdBy: id });

        return payment;
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },

    updatePayment: async (
      _: any,
      {
        id,
        payload,
      }: {
        id: string;
        payload: Omit<PaymentDocument, '_id' | 'createdBy'>;
      },
      { req }: any
    ) => {
      try {
        const user = await bearerAuthorization(req);

        const newOffer = await Payment.findOneAndUpdate(
          { _id: id, createdBy: user.id },
          { ...payload },
          { new: true }
        );

        if (!newOffer) {
          throw new Error('Unable to update payment method information.');
        }

        return newOffer;
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },

    deletePayment: async (_: any, { id }: { id: string }, { req }: any) => {
      try {
        const user = await bearerAuthorization(req);

        const deletedOffer = await Payment.findOneAndDelete(
          { _id: id, createdBy: user.id },
          { new: true }
        );

        if (!deletedOffer) {
          throw new Error('Unable to delete payment method');
        }

        return deletedOffer;
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default paymentResolver;
