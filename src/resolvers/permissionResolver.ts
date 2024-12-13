import Permission, { PermissionType } from '../models/permission';

const permissionResolver = {
  Query: {
    permission: async (_: any, { id }: { id: string }) => {
      try {
        const permission = await Permission.findById(id);

        if (!permission) {
          throw new Error('Permission not found');
        }

        return permission;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },

    permissions: async (_: any) => {
      try {
        const permissions = await Permission.find();

        if (!permissions || permissions.length < 0) {
          throw new Error('No permissions found');
        }

        return permissions;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    createPermission: async (
      _: any,
      { payload }: { payload: Omit<PermissionType, '_id'> }
    ) => {
      try {
        const existingPermission = await Permission.findOne({
          key: payload.key,
        });

        if (existingPermission) {
          throw new Error(`Permission ${payload.key} already exists`);
        }

        const newPermission = new Permission(payload);
        await newPermission.save();

        return newPermission;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },

    updatePermission: async (
      _: any,
      {
        id,
        payload,
      }: { id: string; payload: Omit<Partial<PermissionType>, '_id'> }
    ) => {
      try {
        const updatedPermission = await Permission.findByIdAndUpdate(
          id,
          payload,
          { new: true }
        );

        if (!updatedPermission) {
          throw new Error('Unable to update permission');
        }

        return updatedPermission;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default permissionResolver;
