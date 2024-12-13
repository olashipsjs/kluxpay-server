import { Schema, Types, model } from 'mongoose';

export type TransactionType = {
  walletId: Types.ObjectId;
  hash: string;
  from: string;
  to: string;
  amount: string;
  status: 'pending' | 'success' | 'failed';
  confirmations: number;
  network: 'goerli' | 'sepolia' | 'mainnet';
  gas: {
    cost: string;
    price: string;
  };
};

const schema = new Schema<TransactionType>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallets',
      required: true,
    },
    hash: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    confirmations: { type: Number, required: true, default: 0 },
    gas: {
      cost: { type: String, required: true, default: '0' },
      price: { type: String, required: true, default: '0' },
    },

    network: {
      type: String,
      required: true,
      enum: ['goerli', 'mainnet', 'sepolia'],
    },
  },
  { timestamps: true }
);

const Transaction = model<TransactionType>('Transactions', schema);

export default Transaction;
