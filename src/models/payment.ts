import { model, Schema } from 'mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Document & {
  method: string;
  details?: string;
  bankName: string;
  _id: Types.ObjectId;
  bankAccountName: string;
  bankAccountNumber: string;
  createdBy: Types.ObjectId;
};

const schema = new Schema<PaymentDocument>({
  details: { type: String },
  bankName: { type: String },
  bankAccountName: { type: String },
  bankAccountNumber: { type: String },
  method: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
});

const Payment = model<PaymentDocument>('Payments', schema);

export default Payment;
