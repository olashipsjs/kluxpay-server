import { model, Schema, Types } from 'mongoose';

export type WalletType = {
  escrow: string;
  balance: string;
  publicKey: string;
  privateKey: string;
  _id: Types.ObjectId;
  user: Types.ObjectId;
  platform: 'ethereum' | 'solana' | 'bitcoin'; // 'ethereum', 'solana', 'binance-smart-chain', 'bitcoin', etc.
};

const schema = new Schema<WalletType>({
  escrow: { type: String, required: true, default: '0.00' },
  publicKey: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true, unique: true },
  platform: {
    type: String,
    required: true,
    enum: ['ethereum', 'solana', 'bitcoin'],
    lowercase: true,
  },
  balance: { type: String, default: '0.00' },
  user: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
});

const Wallet = model<WalletType>('Wallets', schema);

export default Wallet;
