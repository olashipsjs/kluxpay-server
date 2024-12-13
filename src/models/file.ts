import { model, Schema, Types } from 'mongoose';
import { Document } from 'mongoose';

export type FileDocument = Document & {
  _id: Types.ObjectId;
  url: string;
  size: number;
  mimetype: string;
  uploadedBy: Types.ObjectId;
};

const schema = new Schema<FileDocument>({
  url: { type: String, required: true, default: '' },
  size: { type: Number, required: true, default: 0 },
  mimetype: { type: String, required: true, default: '0' },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
});

const File = model<FileDocument>('Files', schema);

export default File;
