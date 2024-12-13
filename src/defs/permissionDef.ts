const permissionDef = `#graphql 
    type Permission {
        _id: ID!
        key: String!
        name: String!
        description: String!
    }

    type Query {
        permission(id: ID!): Permission!
        permissions: [Permission!]
    }


    input CreatePermissionPayload {
        key: String!
        name: String!
        description: String!
    }

    input UpdatePermissionPayload {
        key: String
        name: String
        description: String
    }

    type Mutation {
        createPermission(payload: CreatePermissionPayload!): Permission!
        updatePermission(id: ID!, payload: UpdatePermissionPayload!): Permission!
    }
`;

export default permissionDef;
