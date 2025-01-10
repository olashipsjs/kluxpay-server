const otpDef = `#graphql
    scalar Date
    scalar JSON

    type Otp {
        _id: ID!
        code: String!
        createdBy: User!
        expiresAt: Date!
    }

    input VerifyOtpPayload {
        email: String!
        code: String!
    }

    type Mutation {
        verifyOtp(email: String!, code: String!): JSON
        generateOtp(email: String!): JSON
    }
`;

export default otpDef;
