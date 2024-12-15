const otpDef = `#graphql
    scalar Date
    scalar JSON

    type Otp {
        _id: ID!
        code: String!
        createdBy: User!
        expiresAt: Date!
    }


    type Query {
        otps: [Otp!]
        otp(id: ID!): Otp!
    }

    input GenerateOtpPayload {
        email: String!
    }

    input VerifyOtpPayload {
        email: String!
        code: String!
    }

    type Mutation {
        verifyOtp(payload: VerifyOtpPayload!): JSON
        generateOtp(payload: GenerateOtpPayload!): Otp!
    }
`;

export default otpDef;
