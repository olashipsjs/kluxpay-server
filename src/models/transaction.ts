import { Document, model, Schema, Types } from 'mongoose';

export type TransactionDocument = Document & {
  _id: Types.ObjectId;
  type:
    | 'escrow release'
    | 'escrow return'
    | 'escrow reserve'
    | 'deposit'
    | 'withdraw'
    | 'gift';
  amount: number;
  to: string;
  user: Types.ObjectId;
  trade: Types.ObjectId;
  txHash: string;
  confirmations: number;
  timestamp: Date;
  from: string;
  network: string;
};

const schema = new Schema<TransactionDocument>({
  type: {
    type: String,
    required: true,
    enum: [
      'escrow release',
      'escrow return',
      'escrow reserve',
      'withdraw',
      'deposit',
    ],
  },
  to: { type: String, required: true },
  from: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now() },
  confirmations: { type: Number, required: true },
  trade: { type: Schema.Types.ObjectId, ref: 'Trade' },
  txHash: { type: String, required: true, unique: true },
  network: { type: String, required: true, ref: 'Networks' },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Transaction = model<TransactionDocument>('Transactions', schema);

export default Transaction;
