import bcrypt from 'bcrypt';
import validator from 'validator';
import random from '../utils/random';
import userSchema from '../schemas/userSchema';
import User, { UserType } from '../models/user';
import bearerAuthorization from '../middlewares/bearerAuthorization';
import Wallet from '../models/wallet';

const userResolver = {
  Query: {
    getUsers: async (_: any, __: any, { req }: any) => {
      try {
        await bearerAuthorization(req);

        const users = await User.find();

        if (!users || users.length === 0) {
          throw new Error('No users found.');
        }

        return users;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },

    getUser: async (_: any, __: any, { req }: any) => {
      try {
        const { id } = await bearerAuthorization(req, true);

        const user = await User.findById(id);

        if (!user) {
          throw new Error('User not found');
        }

        return user;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },

  User: {
    activeWallet: async (parent: any) => {
      try {
        if (!parent.activeWallet) return null;

        const wallet = await Wallet.findById(parent.activeWallet);
        return wallet;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
  },

  Mutation: {
    createUser: async (
      _: any,
      {
        payload,
      }: {
        payload: Pick<
          UserType,
          | 'email'
          | 'password'
          | 'firstName'
          | 'lastName'
          | 'dateOfBirth'
          | 'activeWallet'
        >;
      }
    ) => {
      const {
        email,
        password,
        firstName,
        lastName,
        dateOfBirth,
        activeWallet,
      } = payload;

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

        const saltRounds = 12;
        const REFERRAL_CODE = random.string(8);
        const hashPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
          lastName,
          firstName,
          dateOfBirth,
          activeWallet,
          email: sanitizedEmail,
          password: hashPassword,
          referralCode: REFERRAL_CODE,
        });

        await newUser.save();

        return newUser;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },

    updateUser: async (
      _: any,
      {
        payload,
      }: {
        payload: Partial<
          Pick<
            UserType,
            'firstName' | 'lastName' | 'dateOfBirth' | 'activeWallet'
          >
        >;
      },
      { req }: any
    ) => {
      try {
        const { id } = await bearerAuthorization(req);

        const user = await User.findById(id);

        if (!user) {
          throw new Error('User not found');
        }

        const updatedUser = await User.findByIdAndUpdate(id, payload, {
          new: true,
        });

        return updatedUser;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default userResolver;
