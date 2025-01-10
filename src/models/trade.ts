import { Document } from 'mongoose';
import { model, Schema, Types } from 'mongoose';

export type TradeDocument = Document & {
  rate: number;
  amount: number;
  offer: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: 'pending' | 'completed' | 'cancelled' | 'paid';
};

const schema = new Schema<TradeDocument>(
  {
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    offer: { type: Schema.Types.ObjectId, required: true, ref: 'Offers' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'completed', 'cancelled', 'paid'],
    },
  },
  { timestamps: true }
);

const Trade = model<TradeDocument>('Trades', schema);

export default Trade;
