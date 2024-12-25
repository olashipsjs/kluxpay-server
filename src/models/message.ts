import { Document, model, Schema, Types } from 'mongoose';

export type MessageDocument = Document & {
  text: string;
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  trade: Types.ObjectId;
  timestamp: Date;
  status: 'sent' | 'pending';
};

const schema = new Schema<MessageDocument>({
  text: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  trade: { type: Schema.Types.ObjectId, ref: 'Trades', required: true },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['sent', 'pending'],
  },
  timestamp: { type: Date, required: true, default: Date.now() },
});

const Message = model<MessageDocument>('Messages', schema);

export default Message;