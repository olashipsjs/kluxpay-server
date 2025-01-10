import { model, Schema, Types } from 'mongoose';

export type OtpType = {
  code: string;
  expiresAt: Date;
  createdBy: Types.ObjectId;
};

const schema = new Schema<OtpType>(
  {
    code: { type: String, required: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
      unique: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const Otp = model<OtpType>('Otps', schema);

export default Otp;
