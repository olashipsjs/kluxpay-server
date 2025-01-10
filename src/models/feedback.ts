import { Document, model, Schema, Types } from 'mongoose';

export type FeedbackDocument = Document & {
  rating: number;
  description: string;
  trade: Types.ObjectId;
  user: Types.ObjectId;
};

const schema = new Schema<FeedbackDocument>(
  {
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    description: { type: String, required: true, trim: true },
    trade: { type: Schema.Types.ObjectId, required: true, ref: 'Trades' },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  },
  { timestamps: true }
);

const Feedback = model<FeedbackDocument>('Feedbacks', schema);

export default Feedback;
