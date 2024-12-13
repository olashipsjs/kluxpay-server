const roleDef = `#graphql 
    type Role {
        _id: String!
        name: String!
        description: String!
        permissions: [Permission!]
    }

    type Query {
        role(id: ID!): Role
        roles: [Role]
    }

     

    input CreateRolePayload {
        name: String!
        description: String!
        permissions: [String!]!
    }

    input UpdateRolePayload {
        name: String
        description: String
        permissions: [String!]
    }

    type Mutation {
        createRole(payload: CreateRolePayload!): Role
        updateRole(id: String!, payload: UpdateRolePayload!): Role
        deleteRole(id: String!): Role
    }
`;

export default roleDef;
