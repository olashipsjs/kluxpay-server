const authTyDef = `#graphql 
    scalar JSON 

    type Query {
        refreshAccessToken: JSON
    }

    type Mutation {
        verifyEmail: JSON
        changeEmail(newEmail: String!): JSON
        lockAccount(password: String!): JSON
        changeUsername(username: String!): JSON
        login(email: String!, password: String!): JSON
        resetPassword(email: String!, newPassword: String!): JSON
        changePassword( oldPassword: String!, newPassword: String!): JSON
    }
`;

export default authTyDef;
