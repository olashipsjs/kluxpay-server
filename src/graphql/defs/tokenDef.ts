const cryptoDef = `#graphql 

    type Query {
        getGasEstimate(to: String!, value: String!, maxFeePerGas: String, maxPriorityFee: String!): JSON
        getTokenBalance (walletId: ID!, contractAddress: String): JSON
    }

    type Mutation {
        sendToken(walletId: ID!, to: String!, amount: Float!, contractAddress: String): JSON
    }
`;

export default cryptoDef;
