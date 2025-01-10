const networkDef = `#graphql 
    type Network {
        _id: ID!
        url: String!
        name: String!
        image: String!
        symbol: String!
        ticker: String!
    }

    type Query {
        getNetworkByName (name: String!): Network!
    }

    type Mutation {
        createNetworks: [Network]!
    }

`;

export default networkDef;
