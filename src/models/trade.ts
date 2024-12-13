import { model, Schema, Types } from 'mongoose';

export type TradeDocument = Document & {
  _id: string;
  amount: string;
  rate: string;
  offer: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: 'open' | 'paid' | 'closed';
};

const schema = new Schema<TradeDocument>(
  {
    rate: { type: String, required: true },
    amount: { type: String, required: true },
    offer: { type: Schema.Types.ObjectId, required: true, ref: 'Offers' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    status: {
      type: String,
      enum: ['open', 'paid', 'closed'],
      required: true,
      default: 'open',
    },
  },
  { timestamps: true }
);

const Trade = model<TradeDocument>('Trades', schema);

export default Trade;
