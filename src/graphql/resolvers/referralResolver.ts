import User from '../../models/user';
import handleError from '../../utils/handleError';
import Referral, { ReferralDocument } from '../../models/referral';
import bearerAuthorization from '../../middlewares/bearerAuthorization';
import Wallet from '../../models/wallet';
import ethereumService from '../../services/ethereumService';
// import aws256gsm from '../../utils/aws256gsm';
import Transaction from '../../models/transaction';

const referralResolver = {
  Query: {
    getUserReferrals: async (_: any, __: any, { req }: any) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const referrals = await Referral.find({ referrer: loggedInUser.id });

        return referrals;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Referral: {
    referrer: async (parent: ReferralDocument) => {
      try {
        const referral = await Referral.findById(parent.id).populate({
          path: 'referrer',
          select: '-password',
        });

        return referral?.referrer;
      } catch (error) {
        handleError(error);
      }
    },

    referee: async (parent: ReferralDocument) => {
      try {
        const referral = await Referral.findById(parent.id).populate({
          path: 'referee',
          select: '-password',
        });

        return referral?.referee;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    createReferral: async (
      _: any,
      variables: { referralCode: string },
      { req }: any
    ) => {
      const { referralCode } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

        const referrer = await User.findOne({
          referralCode,
        });

        if (!referrer) {
          throw new Error('Invalid referral code: ' + referralCode);
        }

        const existingReferral = await Referral.findOne({
          referee: loggedInUser.id,
        });

        if (loggedInUser.id.equals(referrer.id)) {
          throw new Error('Request aborted. Cannot refer yourself');
        }

        if (existingReferral) {
          throw new Error('Already referred by another user');
        }

        const referral = await Referral.create({
          referrer: referrer._id,
          referee: loggedInUser.id,
        });

        return referral;
      } catch (error) {
        handleError(error);
      }
    },

    redeemReferral: async (
      _: any,
      variables: { referralId: string },
      { req }: any
    ) => {
      const { referralId } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

        const referralCount = await Referral.countDocuments({
          referrer: loggedInUser.id,
        });

        if (referralCount < 5) {
          throw new Error(
            `You cannot redeem yet. Refer ${5 - referralCount} more users.`
          );
        }

        const user = await User.findById(loggedInUser.id);

        if (!user) {
          throw new Error('We could not find user account');
        }

        const wallet = await Wallet.findOne({
          user: user?._id,
          network: 'ethereum',
        });

        if (!wallet) {
          throw new Error('No Ethereum wallet found for user');
        }

        const TO = wallet.publicKey;
        const USDT_CONTRACT_ADDRESS =
          '0xCac27746A1FA49760D19b95723933bE2824576E6';
        const PRIVATE_KEY =
          '64441d54b88355051144967b2df48160ca578abdeddb8203d7bf054e01d6215c';
        const AMOUNT = '0.2';

        const tx = await ethereumService.send({
          to: TO,
          amount: AMOUNT,
          contractAddress: USDT_CONTRACT_ADDRESS,
          signingKey: PRIVATE_KEY,
        });

        if (!tx) {
          throw new Error('Transaction error: Unable to create transaction.');
        }

        await Transaction.create({
          to: tx.to,
          type: 'gift',
          from: tx.from,
          txHash: tx.hash,
          amount: AMOUNT,
          network: 'ethereum',
          confirmations: tx.confirmations,
          user: loggedInUser.id,
        });

        const referral = await Referral.findByIdAndUpdate(
          referralId,
          { status: 'redeemed' },
          { new: true }
        );

        return referral;
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default referralResolver;
