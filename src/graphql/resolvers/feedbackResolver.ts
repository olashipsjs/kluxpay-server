import bearerAuthorization from '../../middlewares/bearerAuthorization';
import Feedback, { FeedbackDocument } from '../../models/feedback';
import handleError from '../../utils/handleError';

const feedbackResolver = {
  Query: {
    getUserFeedbacks: async (_: any, __: any, { req }: any) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const feedbacks = await Feedback.find().populate([
          { path: 'trade' },
          { path: 'user', select: '-password' },
        ]);

        const userFeedbacks = feedbacks.filter((feedback) => {
          return (
            (feedback as any).trade?.user?._id.toString() ===
            loggedInUser.id.toString()
          );
        });

        return userFeedbacks;
      } catch (error) {
        handleError(error);
      }
    },

    getFeedbackById: async (_: any, { feedbackId }: { feedbackId: string }) => {
      try {
        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
          throw new Error('Feedback was not found');
        }

        return feedback;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Feedback: {
    trade: async (parent: FeedbackDocument) => {
      try {
        const feedback = await Feedback.findById(parent._id).populate({
          path: 'trade',
        });

        return feedback?.trade;
      } catch (error) {
        handleError(error);
      }
    },

    user: async (parent: FeedbackDocument) => {
      try {
        const feedback = await Feedback.findById(parent._id).populate({
          path: 'user',
          select: '-password',
        });

        return feedback?.user;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    createFeedback: async (
      _: any,
      variables: Pick<FeedbackDocument, 'rating' | 'description'> & {
        tradeId: string;
      },
      { req }: any
    ) => {
      const { rating, description, tradeId } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

        const feedback = await Feedback.create({
          rating,
          description,
          trade: tradeId,
          user: loggedInUser.id,
        });

        return feedback;
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default feedbackResolver;
