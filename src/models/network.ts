import { Document, Schema, model } from 'mongoose';

export type NetworkDocument = Document & {
  url: string;
  name: string;
  image: string;
  symbol: string;
  ticker: string;
};

const schema = new Schema<NetworkDocument>({
  image: { type: String, required: true },
  url: { type: String, required: true },
  ticker: { type: String, required: true },
  symbol: { type: String, required: true, lowercase: true },
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
});

const Network = model<NetworkDocument>('Networks', schema);

export default Network;
