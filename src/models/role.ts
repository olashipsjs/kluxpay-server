import { model, Schema, Types } from 'mongoose';

export type RoleType = Document & {
  description: string;
  _id: Types.ObjectId;
  permissions: Types.ObjectId[];
  name: 'owner' | 'administrator' | 'trader' | 'moderator';
};

const schema = new Schema<RoleType>({
  description: { type: String, required: true, lowercase: true },
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permissions' }],
});

const Role = model('Roles', schema);

export default Role;
