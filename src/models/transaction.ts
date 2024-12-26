import { Schema, Types, model } from 'mongoose';

export type TransactionType = {
  to: string;
  fee: number;
  from: string;
  network: string;
  txHash: string;
  wallet: Types.ObjectId;
  type: 'send' | 'received';
  blockConfirmation: number;
};

const schema = new Schema<TransactionType>(
  {
    to: { type: String, required: true },
    fee: { type: Number, required: true },
    from: { type: String, required: true },
    network: { type: String, required: true },
    txHash: { type: String, required: true },
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallets', required: true },
    type: { type: String, enum: ['send', 'received'], required: true },
    blockConfirmation: { type: Number, required: true },
  },
  { timestamps: true }
);

const Transaction = model<TransactionType>('Transactions', schema);

export default Transaction;
