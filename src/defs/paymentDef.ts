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
        getPayment(id: ID!): Payment!
        getUserPayments: [Payment!]
    }

    input CreatePaymentPayload {
        method: String!
        details: String
        bankName: String
        bankAccountName: String
        bankAccountNumber: String
    }

    input UpdatePaymentPayload {
        method: String
        details: String
        bankName: String
        bankAccountName: String
        bankAccountNumber: String
    }


    type Mutation {
        deletePayment(id: ID!): Payment!
        createPayment(payload: CreatePaymentPayload!): Payment!
        updatePayment(id: ID!, payload: UpdatePaymentPayload!): Payment!
    }
`;

export default paymentDef;
