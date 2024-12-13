const tradeDef = `#graphql 

    type Trade {
        _id: ID!
        offer: Offer!
        amount: String!
        rate: String!
        status: String!
        createdBy: User!
    }

    type Query {
        getTrades: [Trade!]
        getTrade(id: ID!): Trade
        getUserTrades: [Trade!]
    }

    input CreateTradePayload {
        offer: ID!
        rate: String!
        amount: String!
    }

    type Mutation {
        createTrade(payload: CreateTradePayload): Trade!
    }
`;

export default tradeDef;
