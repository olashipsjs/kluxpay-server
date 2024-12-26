const tradeDef = `#graphql 

    type Trade {
        _id: ID!
        offer: Offer!
        amount: String!
        rate: String!
        status: String!
        createdBy: User!
        createdAt: String!
        updatedAt: String!
        wallet: Wallet
    }

    type Query {
        getTrades: [Trade!]
        getTrade(id: ID!): Trade
        getUserTrades: [Trade!]
    }

    input CreateTradePayload {
        offer: ID!
        rate: Float!
        amount:Float!
        wallet: ID!
    }

    type Mutation {
        createTrade(payload: CreateTradePayload): Trade!
    }
`;

export default tradeDef;
