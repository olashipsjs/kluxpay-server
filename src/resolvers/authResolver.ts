import User from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import bearerAuthorization from '../middlewares/bearerAuthorization';

const authResolver = {
  Query: {
    refreshAccessToken: async (_: any, { payload }: { payload: any }) => {
      try {
        const decoded = jwt.verify(
          payload.accessToken,
          process.env.ACCESS_TOKEN_KEY!
        ) as {
          id: string;
        };

        const user = await User.findById(decoded.id);

        if (!user) {
          throw new Error('Error performing request. Try again later.');
        }

        const accessToken = jwt.sign(
          { id: user._id },
          process.env.ACCESS_TOKEN_KEY || '',
          { expiresIn: 60 * 5 }
        );

        return { accessToken };
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    signIn: async (
      _: any,
      { payload }: { payload: { email: string; password: string } },
      { res }: { res: Response }
    ) => {
      try {
        // find a user using their email address
        const user = await User.findOne({ email: payload.email });

        // check user is not found
        if (!user) {
          throw new Error(
            'We couldn’t find a match for that user. Please review your details and try once more.'
          );
        }

        // compare user provided password and the stored password
        const isPasswordCorrect = await bcrypt.compare(
          payload.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error(
            'Incorrect password. Remember, passwords are case-sensitive and may include special characters.'
          );
        }

        // create accessToken and refreshToken using jsonwebtoken
        const accessToken = jwt.sign(
          { id: user.id },
          process.env.ACCESS_TOKEN_KEY || '',
          { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
          { id: user.id },
          process.env.REFRESH_TOKEN_KEY || '',
          { expiresIn: '30d' }
        );

        // ensure accessToken and refreshToken are valid
        if (!accessToken || !refreshToken) {
          throw new Error('Failed to generate tokens');
        }

        const COOKIE_MAX_AGE = 60 * 60 * 1000 * 24 * 30;

        // set cookie for certain days
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          maxAge: COOKIE_MAX_AGE,
        });

        return { accessToken };
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },

    verifyEmail: async (_: any, __: any, { req }: any) => {
      try {
        const { id } = await bearerAuthorization(req);

        const user = await User.findByIdAndUpdate(id, {
          isEmailVerified: true,
        });

        if (!user) {
          throw new Error('Unable to verify user email address.');
        }

        return { isSuccess: true };
      } catch (error) {
        console.log(
          'Unable to verify email address: ' + (error as Error).message
        );
        throw new Error((error as Error).message);
      }
    },

    changeEmail: async (
      _: any,
      { payload }: { payload: { newEmail: string } },
      { req }: any
    ) => {
      try {
        const user = await bearerAuthorization(req);

        const existingUser = await User.findById(user.id);

        if (!existingUser) {
          throw new Error('Unable to find user');
        }

        const isPreviousEmail = existingUser.email === payload.newEmail;

        if (isPreviousEmail) {
          throw new Error('You cannot use the same email address twice.');
        }

        const updatedUser = await User.findByIdAndUpdate(
          existingUser._id,
          { email: payload.newEmail },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error('Unable to update user email');
        }

        return { newEmail: updatedUser.email };
      } catch (error) {
        console.log(`Unable to complete request: ${(error as Error).message}`);
        throw new Error((error as Error).message);
      }
    },

    changePassword: async (
      _: any,
      { payload }: { payload: { newPassword: string; oldPassword: string } },
      { req }: any
    ) => {
      try {
        const user = await bearerAuthorization(req);

        const existingUser = await User.findById(user.id);

        if (!existingUser) {
          throw new Error('Unable to find user');
        }

        const isOldPasswordSame = await bcrypt.compare(
          payload.oldPassword,
          existingUser.password
        );

        if (!isOldPasswordSame) {
          throw new Error(
            "Your old password does not match. Try resetting your password if you've forgotten your password."
          );
        }

        const isNewPasswordSame = await bcrypt.compare(
          payload.newPassword,
          existingUser.password
        );

        if (isNewPasswordSame) {
          throw new Error('You cannot use your previous password.');
        }

        const SALT_ROUNDS = 12;
        const encryptedPassword = await bcrypt.hash(
          payload.newPassword,
          SALT_ROUNDS
        );

        const updatedUser = await User.findByIdAndUpdate(existingUser._id, {
          password: encryptedPassword,
        });

        if (!updatedUser) {
          throw new Error('Unable to change user password.');
        }

        return { isSuccess: true };
      } catch (error) {
        console.log(`Unable to complete request: ${(error as Error).message}`);
        throw new Error((error as Error).message);
      }
    },

    resetPassword: async (
      _: any,
      { payload }: { payload: { email: string; newPassword: string } }
    ) => {
      try {
        const existingUser = await User.findOne({ email: payload.email });

        if (!existingUser) {
          throw new Error(
            'Sorry, we couldn’t locate your account. Please check the details and try again.'
          );
        }

        const isUsingOldPassword = await bcrypt.compare(
          payload.newPassword,
          existingUser.password
        );

        if (isUsingOldPassword) {
          throw new Error('You cannot use your previous password');
        }

        const SALT_ROUNDS = 10;

        const encryptedPassword = await bcrypt.hash(
          payload.newPassword,
          SALT_ROUNDS
        );

        const updatedUser = await User.findByIdAndUpdate(existingUser._id, {
          password: encryptedPassword,
        });

        if (!updatedUser) {
          throw new Error('Unable to reset user password. Try again later.');
        }

        return { isSuccess: true };
      } catch (error) {
        console.log(`Unable to complete request: ${(error as Error).message}`);
        throw new Error((error as Error).message);
      }
    },

    lockAccount: async (
      _: any,
      { payload }: { payload: { password: string } },
      { req }: any
    ) => {
      const { password } = payload;

      try {
        const { id } = await bearerAuthorization(req);

        const user = await User.findById(id);

        if (!user) {
          throw new Error('Unable to find user account');
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
          throw new Error('Incorrect password. Please try again.');
        }

        user.isLocked = true;

        await user.save();

        return { isLocked: true };
      } catch (error) {
        console.error(error);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default authResolver;
