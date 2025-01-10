import bcrypt from 'bcrypt';
import validator from 'validator';
import cache from '../../utils/cache';
import Trade from '../../models/trade';
import Offer from '../../models/offer';
import random from '../../utils/random';
import { getFiats } from '../../apis/fiat';
import Payment from '../../models/payment';
import Referral from '../../models/referral';
import userSchema from '../../schemas/userSchema';
import handleError from '../../utils/handleError';
import User, { UserDocument } from '../../models/user';
import bearerAuthorization from '../../middlewares/bearerAuthorization';
import File from '../../models/file';
import Wallet from '../../models/wallet';
import ethereumService from '../../services/ethereumService';
import Network from '../../models/network';

const userResolver = {
  Query: {
    getAllUsers: async (_: any, __: any, { req }: any) => {
      try {
        await bearerAuthorization(req);

        const users = await User.find().select('-password');

        if (!users || users.length === 0) {
          throw new Error('No users found.');
        }

        return users;
      } catch (error) {
        handleError(error);
      }
    },

    getLoggedInUser: async (_: any, __: any, { req }: any) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const user = await User.findById(loggedInUser.id);

        if (!user) {
          throw new Error('User was not found');
        }

        return user;
      } catch (error) {
        handleError(error);
      }
    },

    getUserById: async (_: any, { userId }: any) => {
      try {
        const user = await User.findById(userId).select('-password');

        if (!user) {
          throw new Error('User not found');
        }

        return user;
      } catch (error) {
        handleError(error);
      }
    },

    getUserByUsername: async (_: any, variables: { username: string }) => {
      const { username } = variables;

      try {
        const user = await User.findOne({ username }).select('-password');

        if (!user) {
          throw new Error('User account was not found');
        }

        return user;
      } catch (error) {
        handleError(error);
      }
    },

    getUserBalance: async (_: any, __: any, { req }: any) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const wallets = await Wallet.find({ user: loggedInUser.id.toString() });

        let totalBalance = 0;

        for (const wallet of wallets) {
          const network = await Network.findOne({ name: wallet.network });

          if (network?.name === 'ethereum') {
            let balance = await ethereumService.getContractBalance({
              walletAddress: wallet.publicKey,
            });

            if (!balance) {
              balance = 0;
            }

            totalBalance += balance;
          }
        }

        return totalBalance;
      } catch (error) {
        handleError(error);
      }
    },
  },

  User: {
    trades: async (parent: UserDocument) => {
      try {
        const count = await Trade.countDocuments({ createdBy: parent._id });
        return count;
      } catch (error) {
        handleError(error);
      }
    },
    offers: async (parent: UserDocument) => {
      try {
        const count = await Offer.countDocuments({ createdBy: parent._id });
        return count;
      } catch (error) {
        handleError(error);
      }
    },
    referrals: async (parent: UserDocument) => {
      try {
        const count = await Referral.countDocuments({
          referrer: parent._id,
        });
        return count;
      } catch (error) {
        handleError(error);
      }
    },
    payments: async (parent: UserDocument) => {
      try {
        const count = await Payment.countDocuments({ createdBy: parent._id });
        return count;
      } catch (error) {
        handleError(error);
      }
    },
    fiat: async (parent: UserDocument) => {
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
    avatar: async (parent: UserDocument) => {
      try {
        const user = await User.findById(parent._id).populate({
          path: 'avatar',
        });

        return user?.avatar;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    createUser: async (
      _: any,
      variables: Pick<
        UserDocument,
        'email' | 'password' | 'firstName' | 'lastName' | 'username'
      >
    ) => {
      const { email, password, firstName, lastName, username } = variables;

      try {
        const validationResult = userSchema.validate({
          email: email,
          password: password,
        });

        if (validationResult.error) {
          throw new Error(validationResult.error.details[0].message);
        }

        const sanitizedEmail = validator.escape(email.trim().toLowerCase());

        const findEmail = await User.findOne({
          email: sanitizedEmail,
        });

        if (findEmail) {
          throw new Error(
            'Email already associated with an existing user account'
          );
        }

        const findUsername = await User.findOne({ username });

        if (findUsername) {
          throw new Error(
            'Username has been taken. Try again with a different username.'
          );
        }

        const SALT_ROUNDS = 12;
        const REFERRAL_CODE = random.string(7);
        const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = new User({
          lastName,
          firstName,
          username,
          email: sanitizedEmail,
          password: hashPassword,
          referralCode: REFERRAL_CODE,
        });

        await newUser.save();

        return newUser;
      } catch (error) {
        handleError(error);
      }
    },

    updateUser: async (
      _: any,
      variables: Partial<
        Pick<UserDocument, 'firstName' | 'lastName' | 'fiat' | 'bio'>
      >,
      { req }: any
    ) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const user = await User.findOne({ _id: loggedInUser.id });

        if (!user) {
          throw new Error('User not found');
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, variables, {
          new: true,
        });

        return updatedUser;
      } catch (error) {
        handleError(error);
      }
    },
    changeAvatar: async (
      _: any,
      variables: { fileId: string },
      { req }: any
    ) => {
      const { fileId } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);
        const user = await User.findById(loggedInUser.id);

        if (!user) {
          throw new Error('User not found.');
        }

        const file = await File.findById(fileId);

        if (!file) {
          throw new Error('File does not exist.');
        }

        const newUser = await User.findByIdAndUpdate(
          user._id,
          { avatar: file._id },
          { new: true }
        );

        return newUser;
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default userResolver;
