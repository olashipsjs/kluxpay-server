const authTyDef = `#graphql 
    scalar JSON

    input SignInPayload {
        email: String!
        password: String!
    }

    type SignInReturn { 
        accessToken: String!
    }

    input VerifyEmailPayload {
        email: String!
    }  

    input ChangeEmailPayload {
        newEmail: String!
    }

    input ChangePasswordPayload {
        oldPassword: String!
        newPassword: String!
    }

    input ResetPasswordPayload {
        email: String!
        newPassword: String!
    }

    input LockAccountPayload {
        password: String!
    }

    input RefreshAccessTokenPayload {
        accessToken: String!
    }

    type Query {
        refreshAccessToken(payload: RefreshAccessTokenPayload!): JSON
    }

    type Mutation {
        signIn(payload: SignInPayload!): SignInReturn!
        verifyEmail(payload: VerifyEmailPayload!): JSON
        changeEmail(payload: ChangeEmailPayload!): JSON
        resetPassword(payload: ResetPasswordPayload!): JSON
        changePassword(payload: ChangePasswordPayload!): JSON
        lockAccount(payload: LockAccountPayload!): JSON
    }
`;

export default authTyDef;
