import { model, Schema, Document, Types } from 'mongoose';

export type UserDocument = Document & {
  _id: Types.ObjectId;
  bio: string;
  fiat: string;
  email: string;
  username: string;
  lastName: string;
  firstName: string;
  password: string;
  isOnline: boolean;
  lastActive: Date;
  isLocked: boolean;
  isVerified: boolean;
  isEmailVerified: boolean;
  referralCode: string;
  avatar: Types.ObjectId;
  role: 'admin' | 'owner' | 'moderator' | 'trader' | 'developer';
};

const schema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    bio: {
      trim: true,
      type: String,
      default: '',
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now() },
    isEmailVerified: { type: Boolean, default: false },
    avatar: { type: Schema.Types.ObjectId, ref: 'Files' },
    fiat: { type: String, required: true, default: 'USD' },
    lastName: { type: String, required: true, lowercase: true },
    firstName: { type: String, required: true, lowercase: true },
    referralCode: { type: String, required: true, unique: true },
    role: {
      type: String,
      default: 'trader',
      enum: ['admin', 'owner', 'moderator', 'trader', 'developer'],
    },
  },
  { timestamps: true }
);

const User = model<UserDocument>('Users', schema);

export default User;
