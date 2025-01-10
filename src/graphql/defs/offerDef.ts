const offerDef = `#graphql 

    type Offer {
        _id: ID!
        margin: Float!
        type: String!
        coin: JSON
        fiat: Fiat!
        timeout: Int!
        notes: String!
        minLimit: Float!
        maxLimit: Float!
        createdBy: User!
        payment: Payment
        isActive: Boolean!
        createdAt: Date!
        updatedAt: Date!
    }

    type GetAllOffers {
        page: Int!
        limit: Int!
        total: Int!
        offers: [Offer!]
    }

    type Query {
        getUserOffers: [Offer!]
        getOfferById(offerId: ID!): Offer!
        getAllOffers (page: Int, limit: Int, type: String, fiat: String): GetAllOffers!
    }


    type Mutation {
        deleteOffer(offerId: ID!): JSON
        activateOffer(offerId: ID!, rate: Float!): JSON
        createOffer(
            coinId: ID!, 
            fiat: String!, 
            type: String!, 
            timeout: Int!, 
            paymentId: ID, 
            notes: String!, 
            maxLimit: Float!, 
            minLimit: Float!, 
            margin: Float!
        ): Offer!
        updateOffer(
            coinId: ID, 
            offerId: ID!, 
            type: String, 
            fiat: String, 
            timeout: Int, 
            notes: String, 
            paymentId: ID,
            maxLimit: Float, 
            minLimit: Float, 
            margin: Float, 
        ): Offer!
    }
`;

export default offerDef;
