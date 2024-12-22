const userDef = `#graphql
   

    type User {
        _id: ID!
        firstName: String!
        lastName: String!
        dateOfBirth: String!
        email: String!
        isLocked: Boolean!
        isOnline: Boolean!
        isVerified: Boolean!
        referrals: [User!]
        referrer: User
        isEmailVerified: Boolean!
        referralCode: String!
        role: String!
        currency: String!
    }

    type Query {
        getUsers: [User!]
        getUser: User!
    }

    input CreateUserPayload {
        firstName: String!
        lastName: String!
        dateOfBirth: String!
        email: String!
        password: String!
    }

    input UpdateUserPayload {
        firstName: String
        lastName: String
        dateOfBirth: String
        currency: String
    }

    type Mutation {
        createUser(payload: CreateUserPayload!): User
        updateUser(payload: UpdateUserPayload!): User
    }
`;

export default userDef;
