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
        generateOtp(payload: GenerateOtpPayload!): Otp!
        verifyOtp(payload: VerifyOtpPayload!): Otp!
    }
`;

export default otpDef;
