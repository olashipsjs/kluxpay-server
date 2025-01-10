const referralDef = `#graphql 
    type Referral {
        _id: ID!
        referee: User!
        referrer: User!
        status: String!
        createdAt: Date!
    }

    type Query {
        getUserReferrals: [Referral!] 
    }

    type Mutation {
        redeemReferral(referralId: ID!): Referral!
        createReferral(referralCode: String!): Referral!
    }
`;

export default referralDef;
