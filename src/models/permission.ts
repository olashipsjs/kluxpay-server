import { model, Schema } from 'mongoose';

export type PermissionType = Document & {
  _id: string;
  key: string;
  name: string;
  description: string;
};

const schema = new Schema<PermissionType>({
  name: { type: String, required: true },
  key: { type: String, required: true, lowercase: true, unique: true },
  description: { type: String, required: true },
});

const Permission = model('Permissions', schema);

export default Permission;
