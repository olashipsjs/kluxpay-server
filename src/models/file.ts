import { Document, model, Schema, Types } from 'mongoose';

export type FileDocument = Document & {
  _id: Types.ObjectId;
  url: string;
  size: number;
  timestamp: Date;
  filename: string;
  mimetype: string;
  uploadedBy: Types.ObjectId;
};

const schema = new Schema<FileDocument>({
  size: { type: Number, default: 0 },
  url: { type: String, required: true },
  mimetype: { type: String, required: true },
  filename: { type: String, required: true },
  timestamp: { type: Date, default: Date.now() },
  uploadedBy: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
});

const File = model<FileDocument>('Files', schema);

export default File;
