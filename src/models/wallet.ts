import { model, Schema, Types } from 'mongoose';

export type WalletType = {
  escrow: number;
  balance: number;
  publicKey: string;
  privateKey: string;
  _id: Types.ObjectId;
  user: Types.ObjectId;
  platform: 'ethereum' | 'bitcoin'; // 'ethereum', 'solana', 'binance-smart-chain', 'bitcoin', etc.
};

const schema = new Schema<WalletType>({
  escrow: { type: Number, required: true, default: 0 },
  publicKey: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true, unique: true },
  platform: {
    type: String,
    required: true,
    enum: ['ethereum', 'bitcoin'],
    lowercase: true,
  },
  balance: { type: Number, default: 0 },
  user: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
});

const Wallet = model<WalletType>('Wallets', schema);

export default Wallet;
