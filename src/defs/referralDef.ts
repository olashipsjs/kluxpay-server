const referralDef = `#graphql 
    type Referral {
        _id: ID!
        code: String!
        referee: User!
        referrer: User!
        reward: String!
        status: String!
    }

    type Query {
        referral(id: ID!): Referral!
        referrals: [Referral] 
    }

    input ReferPayload {
        referee: ID!
        referrer: ID!
        reward: String!
        status: String!
    }

    input ClaimRewardPayload {
        referralId: ID!
    }

    type Mutation {
        refer(payload: ReferPayload!): Referral!
        claimReward(payload: ClaimRewardPayload): Referral!
    }
`;

export default referralDef;
