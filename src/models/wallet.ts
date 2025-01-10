import { Document, model, Schema, Types } from 'mongoose';

export type WalletDocument = Document & {
  name: string;
  publicKey: string;
  privateKey: string;
  _id: Types.ObjectId;
  user: Types.ObjectId;
  mnemonicPhrase?: string;
  network: string;
  timestamp: Date;
};

const schema = new Schema<WalletDocument>({
  name: { type: String, default: '' },
  publicKey: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true, unique: true },
  mnemonicPhrase: { type: String },
  network: {
    type: String,
    required: true,
    lowercase: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

const Wallet = model<WalletDocument>('Wallets', schema);

export default Wallet;
