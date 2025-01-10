import User from '../../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import bearerAuthorization from '../../middlewares/bearerAuthorization';
import handleError from '../../utils/handleError';

const authResolver = {
  Query: {
    refreshAccessToken: async (_: any, __: any, { req }: any) => {
      try {
        const cookieRefreshToken = req.cookies?.refreshToken;

        if (!cookieRefreshToken) {
          throw new Error('Invalid request. Token not set.');
        }

        const refreshTokenPayload = jwt.verify(
          cookieRefreshToken,
          process.env.REFRESH_TOKEN_KEY!
        ) as { id: string };

        if (!refreshTokenPayload || !refreshTokenPayload.id) {
          throw new Error('Session expired. Please sign in again.');
        }

        const user = await User.findById(refreshTokenPayload.id);

        if (!user) {
          throw new Error('Invalid request. Please try again.');
        }

        const newAccessToken = jwt.sign(
          { id: user.id },
          process.env.ACCESS_TOKEN_KEY!,
          { expiresIn: '15m' }
        );

        return { accessToken: newAccessToken };
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    login: async (
      _: any,
      variables: { email: string; password: string },
      { res }: { res: Response }
    ) => {
      try {
        // find a user using their email address
        const user = await User.findOne({ email: variables.email });

        // check user is not found
        if (!user) {
          throw new Error(
            'We couldn’t find a match for that user. Please review your details and try once more.'
          );
        }

        // compare user provided password and the stored password
        const isPasswordCorrect = await bcrypt.compare(
          variables.password,
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
          { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
          { id: user.id },
          process.env.REFRESH_TOKEN_KEY || '',
          { expiresIn: '30d' }
        );

        if (!accessToken || !refreshToken) {
          throw new Error('Failed to generate tokens');
        }

        const COOKIE_MAX_AGE = 60 * 60 * 1000 * 24 * 30;

        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.ENVIRONMENT === 'production',
          sameSite: process.env.ENVIRONMENT === 'production' ? 'none' : 'lax',
          maxAge: COOKIE_MAX_AGE,
        });

        return { accessToken };
      } catch (error) {
        handleError(error);
      }
    },

    verifyEmail: async (_: any, __: any, { req }: any) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const user = await User.findByIdAndUpdate(loggedInUser.id, {
          isEmailVerified: true,
        });

        if (!user) {
          throw new Error('Unable to verify user email address.');
        }

        return { isSuccess: true };
      } catch (error) {
        handleError(error);
      }
    },

    changeEmail: async (
      _: any,
      variables: { newEmail: string },
      { req }: any
    ) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const existingUser = await User.findById(loggedInUser.id);

        if (!existingUser) {
          throw new Error('Unable to find user');
        }

        const isPreviousEmail = existingUser.email === variables.newEmail;

        if (isPreviousEmail) {
          throw new Error('You cannot use your current email address twice.');
        }

        const anotherUser = await User.findOne({ email: variables.newEmail });

        if (anotherUser) {
          throw new Error('Email already associated with another user');
        }

        const updatedUser = await User.findByIdAndUpdate(
          existingUser._id,
          { email: variables.newEmail },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error('Unable to update user email');
        }

        return { newEmail: updatedUser.email };
      } catch (error) {
        handleError(error);
      }
    },

    changePassword: async (
      _: any,
      variables: { newPassword: string; oldPassword: string },
      { req }: any
    ) => {
      try {
        const loggedInUser = await bearerAuthorization(req);

        const existingUser = await User.findById(loggedInUser.id);

        if (!existingUser) {
          throw new Error('Unable to find user');
        }

        const isOldPasswordSame = await bcrypt.compare(
          variables.oldPassword,
          existingUser.password
        );

        if (!isOldPasswordSame) {
          throw new Error(
            "Your old password does not match. Try resetting your password if you've forgotten your password."
          );
        }

        const isNewPasswordSame = await bcrypt.compare(
          variables.newPassword,
          existingUser.password
        );

        if (isNewPasswordSame) {
          throw new Error('You cannot use your previous password.');
        }

        const SALT_ROUNDS = 12;
        const encryptedPassword = await bcrypt.hash(
          variables.newPassword,
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
        handleError(error);
      }
    },

    resetPassword: async (
      _: any,
      variables: { email: string; newPassword: string }
    ) => {
      try {
        const existingUser = await User.findOne({ email: variables.email });

        if (!existingUser) {
          throw new Error(
            'Sorry, we couldn’t locate your account. Please check the details and try again.'
          );
        }

        const isUsingOldPassword = await bcrypt.compare(
          variables.newPassword,
          existingUser.password
        );

        if (isUsingOldPassword) {
          throw new Error('You cannot use your previous password');
        }

        const SALT_ROUNDS = 10;

        const encryptedPassword = await bcrypt.hash(
          variables.newPassword,
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
      variables: { password: string },
      { req }: any
    ) => {
      const { password } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

        const user = await User.findById(loggedInUser.id);

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

    changeUsername: async (
      _: any,
      variables: { username: string },
      { req }: any
    ) => {
      const { username } = variables;

      try {
        const loggedInUser = await bearerAuthorization(req);

        const user = await User.findOne({ _id: loggedInUser.id });

        if (!user) {
          throw new Error('User account was not found');
        }

        const existingUsername = await User.findOne({ username });

        if (existingUsername) {
          throw new Error('Username is already taken.');
        }

        user.username = username;
        await user.save();

        return { username };
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default authResolver;
