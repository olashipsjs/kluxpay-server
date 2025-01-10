import { model, Schema, Types } from 'mongoose';

export type OfferDocument = Document & {
  _id: string;
  fiat: string;
  notes: string;
  amount: number;
  minLimit: number;
  maxLimit: number;
  timeout: 15 | 30 | 60 | 90;
  isActive: boolean;
  margin: number;
  type: 'buy' | 'sell';
  coin: string;
  createdBy: Types.ObjectId;
  payment?: Types.ObjectId;
};

const schema = new Schema<OfferDocument>(
  {
    coin: { type: String, required: true },
    notes: { type: String, required: true },
    fiat: { type: String, required: true },
    margin: { type: Number, required: true, default: 0 },
    minLimit: { type: Number, required: true, default: 0 },
    maxLimit: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: false },
    type: { type: String, required: true, enum: ['sell', 'buy'] },
    timeout: { type: Number, required: true, enum: [15, 30, 60, 90] },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
    payment: { type: Schema.Types.ObjectId, ref: 'Payments' },
  },
  { timestamps: true }
);

const Offer = model<OfferDocument>('Offers', schema);

export default Offer;
