const transactionDef = `#graphql 
    type Transaction {
        to: String!
        amount: Float!
        status: String!
        type: String!
        user: User!
        trade: Trade
    }

    type Query {
        getAllTransactions: [Transaction]
        getUserTransactions: [Transaction]
    }


    type Mutation {
        createTransaction(
            to: String!, 
            tradeId: ID,
            type: String!, 
            amount: Float!, 
            status: String!, 
        ): Transaction
    }

`;

export default transactionDef;
