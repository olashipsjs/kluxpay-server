import Role, { RoleType } from '../models/role';
import Permission from '../models/permission';

const roleResolver = {
  Query: {
    role: async (_: any, { id }: { id: string }) => {
      try {
        const role = await Role.findById(id);

        if (!role) {
          throw new Error('Could not find role');
        }

        return role;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
    roles: async () => {
      try {
        const roles = await Role.find();

        if (!roles || roles.length === 0) {
          throw new Error('Could not find any existing role');
        }

        return roles;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },

  Role: {
    permissions: async (parent: any) => {
      try {
        const permissions = await Permission.find();

        return permissions;
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    createRole: async (
      _: any,
      { payload }: { payload: Omit<RoleType, '_id'> }
    ) => {
      try {
        const existingRole = await Role.findOne({ name: payload.name });

        if (existingRole) {
          throw new Error(`The role ${payload.name} already exists`);
        }

        const newRole = new Role(payload);
        await newRole.save();

        return newRole;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
    updateRole: async (
      _: any,
      { id, payload }: { id: string; payload: Omit<Partial<RoleType>, '_id'> }
    ) => {
      try {
        const role = await Role.findById(id);

        if (!role) {
          throw new Error('Role does not exist');
        }

        const updatedRole = await Role.findByIdAndUpdate(role.id, payload, {
          new: true,
        });

        return updatedRole;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
    deleteRole: async (_: any, { id }: { id: string }) => {
      try {
        const existingRole = await Role.findById(id);

        if (!existingRole) {
          throw new Error('Role does not exist');
        }

        const deletedRole = await Role.findByIdAndDelete(existingRole._id);

        return deletedRole;
      } catch (error) {
        console.log(error);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default roleResolver;
