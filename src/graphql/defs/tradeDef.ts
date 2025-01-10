const tradeDef = `#graphql 

    type Trade {
        _id: ID!
        offer: Offer!
        amount: String!
        rate: String!
        status: String!
        createdBy: User!
        createdAt: Date!
        updatedAt: Date!
    }

    type Query {
        getAllTrades: [Trade!]
        getTradeById(tradeId: ID!): Trade
        getUserTrades: [Trade!]
    }

    type Mutation {
        paidTrade (tradeId: ID!): Trade!
        cancelTrade (tradeId: ID!): Trade!
        completeTrade (tradeId: ID!): Trade!
        createTrade (
            offerId: ID!,
            rate: Float!,
            amount:Float!,
        ): Trade!
    }
`;

export default tradeDef;
