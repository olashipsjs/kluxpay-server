const paymentDef = `#graphql 

    type Payment {
        _id: ID!
        method: String!
        details: String
        createdBy: User!
        bankName: String
        bankAccountName: String
        bankAccountNumber: String
    }

    type Query {
        getPaymentById(paymentId: ID!): Payment!
        getUserPayments: [Payment!]
    }


    type Mutation {
        deletePayment(paymentId: ID!): Payment!
        createPayment(
            method: String!
            details: String!
            bankName: String!
            bankAccountName: String!
            bankAccountNumber: String!
        ): Payment!
        updatePayment(
            paymentId: ID! 
            method: String
            details: String
            bankName: String
            bankAccountName: String
            bankAccountNumber: String
        ): Payment!
    }
`;

export default paymentDef;
