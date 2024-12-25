import { model, Schema, Document, Types } from 'mongoose';

export type UserType = Document & {
  _id: Types.ObjectId;
  email: string;
  lastName: string;
  password: string;
  firstName: string;
  dateOfBirth: string;
  isOnline: boolean;
  isLocked: boolean;
  isVerified: boolean;
  currency: string;
  isEmailVerified: boolean;
  referralCode: string;
  activeWallet?: Types.ObjectId;
  role: 'admin' | 'owner' | 'moderator' | 'trader' | 'developer';
};

const schema = new Schema<UserType>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    dateOfBirth: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    currency: { type: String, required: true, default: 'usd' },
    lastName: { type: String, required: true, lowercase: true },
    firstName: { type: String, required: true, lowercase: true },
    referralCode: { type: String, required: true, unique: true, default: '' },
    role: {
      type: String,
      default: 'trader',
      enum: ['admin', 'owner', 'moderator', 'trader', 'developer'],
    },
    activeWallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallets',
    },
  },
  { timestamps: true }
);

const User = model<UserType>('Users', schema);

export default User;
