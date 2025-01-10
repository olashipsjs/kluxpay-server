import Otp from '../../models/otp';
import User from '../../models/user';
import date from '../../utils/date';
import handleError from '../../utils/handleError';
import random from '../../utils/random';

const otpResolver = {
  Otp: {
    createdBy: async (parent: any) => {
      try {
        const user = await User.findById(parent.createdBy);
        return user;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    generateOtp: async (_: any, variables: { email: string }) => {
      try {
        const user = await User.findOne({ email: variables.email });

        if (!user) {
          throw new Error(
            'Sorry, we couldn’t locate the user account. Please check your details and try again.'
          );
        }

        const existingOtp = await Otp.findOne({ createdBy: user._id });

        if (existingOtp) {
          await Otp.deleteOne({ _id: existingOtp._id });
        }

        const code = random.number();
        const expiresAt = date.addMinute(5);

        const otp = new Otp({
          code,
          expiresAt,
          user: user._id,
          createdBy: user._id,
        });

        await otp.save();

        return otp;
      } catch (error) {
        handleError(error);
      }
    },

    verifyOtp: async (_: any, variables: { code: string; email: string }) => {
      const { code, email } = variables;

      try {
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error(
            'Sorry, we couldn’t locate the user you’re searching for. Please check your details and try again.'
          );
        }

        const otp = await Otp.findOne({
          code,
          createdBy: user._id,
        });

        if (!otp) {
          throw new Error(
            'Invalid OTP. Make sure you entered the correct code or request a new one.'
          );
        }

        const hasExpired = date.compare(otp.expiresAt);

        if (hasExpired) {
          throw new Error('Your OTP has expired. Please request a new one.');
        }

        await Otp.deleteOne({ _id: otp._id });

        return { isSuccess: true };
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default otpResolver;
