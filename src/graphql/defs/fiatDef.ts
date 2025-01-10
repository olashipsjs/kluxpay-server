const fiatDef = `#graphql 
    type Fiat {
        id: String!
        name: String!
        sign: String!
        symbol: String!
    }

    type Query {
        getAllFiats: [Fiat]
    }
`;

export default fiatDef;
