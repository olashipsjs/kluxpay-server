import Otp from '../models/otp';
import User from '../models/user';
import date from '../utils/date';
import random from '../utils/random';

const otpResolver = {
  Query: {
    otp: async (_: any, { id }: { id: string }) => {
      try {
        const otp = await Otp.findById(id);
        if (!otp) {
          throw new Error('otp not found');
        }
        return otp;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },

    otps: async (_: any) => {
      try {
        const otps = await Otp.find();
        if (!otps || otps.length === 0) {
          throw new Error('No otps found');
        }
        return otps;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },

  Otp: {
    createdBy: async (parent: any) => {
      try {
        const user = await User.findById(parent.createdBy);
        return user;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    generateOtp: async (
      _: any,
      {
        payload,
      }: {
        payload: {
          email: string;
        };
      }
    ) => {
      try {
        const user = await User.findOne({ email: payload.email });

        if (!user) {
          throw new Error(
            'Sorry, we couldn’t locate the user you’re searching for. Please check the details and try again.'
          );
        }

        // find existing otp and delete if found
        const existingOtp = await Otp.findOne({ createdBy: user._id });
        let record: any;

        if (existingOtp) {
          await Otp.deleteOne({ _id: existingOtp._id });
        }

        const code = random.number();
        const expiresAt = date.addMinute(5);

        record = new Otp({
          code,
          expiresAt,
          user: user._id,
          createdBy: user._id,
        });

        await record.save();

        return record;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },

    verifyOtp: async (
      _: any,
      { payload }: { payload: { code: string; email: string } }
    ) => {
      try {
        const user = await User.findOne({ email: payload.email });

        // throw error if user does not exist
        if (!user) {
          throw new Error(
            'Sorry, we couldn’t locate the user you’re searching for. Please check the details and try again.'
          );
        }

        // find and delete the otp using given code and found user id and
        const otp = await Otp.findOne({
          code: payload.code,
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

        const deletedOtp = await Otp.findByIdAndDelete(otp._id);

        return deletedOtp;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default otpResolver;
