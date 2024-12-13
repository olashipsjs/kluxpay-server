import { model, Schema, Types } from 'mongoose';
import { Document } from 'mongoose';

export type ReferralDocument = Document & {
  code: string;
  reward: number;
  _id: Types.ObjectId;
  referee: Types.ObjectId;
  referrer: Types.ObjectId;
  status: 'pending' | 'completed' | 'failed';
};

const schema = new Schema<ReferralDocument>(
  {
    code: { type: String, required: true },
    reward: { type: Number, required: true, default: 0 },
    referee: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
    referrer: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
    },
  },
  { timestamps: true }
);

const Referral = model<ReferralDocument>('Referrals', schema);

export default Referral;
