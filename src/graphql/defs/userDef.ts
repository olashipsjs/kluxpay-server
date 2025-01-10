const userDef = `#graphql
    scalar Date
   
    type User {
        _id: ID!
        bio: String
        firstName: String!
        lastName: String!
        username: String!
        email: String!
        isLocked: Boolean!
        isOnline: Boolean!
        lastActive: Boolean!
        isVerified: Boolean!
        referrer: User
        isEmailVerified: Boolean!
        referralCode: String!
        role: String!
        fiat: Fiat!
        trades: Int!
        offers: Int!
        avatar: File
        referrals: Int!
        payments: Int!
        createdAt: Date
        updatedAt: Date
    }

    type Query {
        getAllUsers: [User!]
        getUserBalance: JSON
        getLoggedInUser: User!
        getUserById (userId: ID!): User!
        getUserByUsername (username: String!): User!
    }   

    type Mutation {
        createUser(
            username: String!,
            firstName: String!, 
            lastName: String!, 
            email: String!, 
            password: String!
        ): User
        updateUser(
            firstName: String, 
            lastName: String, 
            fiat: String
            bio: String
        ): User
        changeAvatar(fileId: ID!): User
    }
`;

export default userDef;
