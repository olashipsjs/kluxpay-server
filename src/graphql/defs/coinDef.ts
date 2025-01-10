const coinDef = `#graphql 
    type Query {
        getAllP2PCoins(convert: String): JSON
        getAllCoins (page: Int, convert: String): JSON
        getCoinQuote(coinId: Int!, convert: String!): JSON
        getCoinByName(coinName: String!, convert: String!): JSON
    }

`;

export default coinDef;
