import bearerAuthorization from '../../middlewares/bearerAuthorization';
import Payment, { PaymentDocument } from '../../models/payment';
import User from '../../models/user';

const paymentResolver = {
  Query: {
    getPaymentById: async (
      _: any,
      { paymentId }: { paymentId: string },
      { req }: any
    ) => {
      try {
        const user = await bearerAuthorization(req);

        const payment = await Payment.findOne({
          _id: paymentId,
          createdBy: user.id,
        });

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
    createdBy: async (parent: PaymentDocument) => {
      try {
        const payment = await Payment.findById(parent._id).populate({
          path: 'createdBy',
          select: '-password',
        });
        return payment?.createdBy;
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    createPayment: async (
      _: any,
      variables: { payload: Omit<PaymentDocument, 'createdBy'> },
      { req }: any
    ) => {
      try {
        const { id } = await bearerAuthorization(req);

        const payment = await Payment.create({ ...variables, createdBy: id });

        return payment;
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },

    updatePayment: async (
      _: any,
      variables: { paymentId: string } & Omit<
        PaymentDocument,
        '_id' | 'createdBy'
      >,
      { req }: any
    ) => {
      const { paymentId, ...rest } = variables;

      try {
        const user = await bearerAuthorization(req);

        const newOffer = await Payment.findOneAndUpdate(
          { _id: paymentId, createdBy: user.id },
          { ...rest },
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

    deletePayment: async (
      _: any,
      { paymentId }: { paymentId: string },
      { req }: any
    ) => {
      try {
        const user = await bearerAuthorization(req);

        const deletedOffer = await Payment.findOneAndDelete(
          { _id: paymentId, createdBy: user.id },
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
