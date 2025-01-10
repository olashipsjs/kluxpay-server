import { model, Schema, Types, Document } from 'mongoose';

export type ReferralDocument = Document & {
  referee: Types.ObjectId;
  referrer: Types.ObjectId;
  status: 'redeemed' | 'pending';
};

const schema = new Schema<ReferralDocument>(
  {
    referee: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
    referrer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Users',
    },
    status: {
      type: String,
      lowercase: true,
      enum: ['redeemed', 'pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Referral = model<ReferralDocument>('Referrals', schema);

export default Referral;
