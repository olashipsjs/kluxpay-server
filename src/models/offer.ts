import { model, Schema, Types } from 'mongoose';

export type OfferDocument = Document & {
  _id: string;
  fiat: string;
  notes: string;
  amount: string;
  coinId: string;
  minLimit: string;
  maxLimit: string;
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
    amount: { type: String, required: true },
    priceMargin: { type: Number, required: true, default: 0 },
    timeout: { type: Number, required: true, enum: [15, 30] },
    isActive: { type: Boolean, required: true, default: true },
    minLimit: { type: String, required: true, default: '0.00' },
    maxLimit: { type: String, required: true, default: '0.00' },
    type: { type: String, required: true, enum: ['sell', 'buy'] },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
    payment: { type: Schema.Types.ObjectId, required: true, ref: 'Payments' },
  },
  { timestamps: true }
);

const Offer = model<OfferDocument>('Offers', schema);

export default Offer;
