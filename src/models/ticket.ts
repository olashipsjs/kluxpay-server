import { Document, model, Schema, Types } from 'mongoose';

export type TicketDocument = Document & {
  name: string;
  title: string;
  category: string;
  ticketId: number;
  description: string;
  user: Types.ObjectId;
  priority: 'high' | 'low' | 'medium';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
};

const schema = new Schema<TicketDocument>(
  {
    ticketId: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      required: true,
      enum: ['high', 'low', 'medium'],
      default: 'low',
    },
    user: { type: Schema.Types.ObjectId, ref: 'Users' },
  },
  { timestamps: true }
);

const Ticket = model<TicketDocument>('Tickets', schema);

export default Ticket;
