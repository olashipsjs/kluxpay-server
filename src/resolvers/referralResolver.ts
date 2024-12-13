import Referral, { ReferralDocument } from '../models/referral';
import User from '../models/user';

type ReferPayload = {
  payload: Omit<ReferralDocument, '_id' | 'code'>;
};

const referralResolver = {
  Query: {
    referral: async (_: any, { id }: { id: string }) => {
      try {
        const referral = await Referral.findById(id);

        if (!referral) {
          throw new Error('Unable to find referral');
        }

        return referral;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
    referrals: async () => {
      try {
        const referrals = await Referral.find();

        if (!referrals || referrals.length === 0) {
          throw new Error('No existing referrals found');
        }

        return referrals;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },

  Referral: {
    referrer: async ({ referrer }: any) => {
      try {
        const user = await User.findById(referrer);
        return user;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
    referee: async ({ referee }: any) => {
      try {
        const user = await User.findById(referee);
        return user;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    refer: async (_: any, { payload }: ReferPayload) => {
      const { referee, referrer, status, reward } = payload;
      try {
        const existingReferral = await Referral.findOne({
          referee,
          referrer,
        });

        if (existingReferral) {
          return existingReferral;
        }

        const referrerUser = await User.findById(referrer);

        if (!referrerUser) {
          throw new Error('Unable to find referrer user');
        }

        const newReferral = new Referral({
          referee,
          referrer,
          status,
          reward,
          code: referrerUser.referralCode,
        });

        await newReferral.save();

        return newReferral;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default referralResolver;
