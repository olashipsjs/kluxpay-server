import { model, Schema, Types } from 'mongoose';

export type OfferDocument = Document & {
  _id: string;
  fiat: string;
  notes: string;
  amount: number;
  coinId: string;
  minLimit: number;
  maxLimit: number;
  timeout: 15 | 30;
  isActive: boolean;
  priceMargin: number;
  type: 'buy' | 'sell';
  createdBy: Types.ObjectId;
  payment: Types.ObjectId;
};

const schema = new Schema<OfferDocument>(
  {
    fiat: { type: String, required: true },
    notes: { type: String, required: true },
    coinId: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    priceMargin: { type: Number, required: true, default: 0 },
    timeout: { type: Number, required: true, enum: [15, 30] },
    isActive: { type: Boolean, required: true, default: false },
    minLimit: { type: Number, required: true, default: 0 },
    maxLimit: { type: Number, required: true, default: 0 },
    type: { type: String, required: true, enum: ['sell', 'buy'] },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
    payment: { type: Schema.Types.ObjectId, required: true, ref: 'Payments' },
  },
  { timestamps: true }
);

const Offer = model<OfferDocument>('Offers', schema);

export default Offer;
