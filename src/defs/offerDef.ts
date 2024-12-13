const offerDef = `#graphql 

    type Offer {
        _id: ID!
        priceMargin: Int!
        type: String!
        coinId: String!
        fiat: String!
        timeout: Int!
        notes: String!
        amount: String!
        minLimit: String!
        maxLimit: String!
        createdBy: User!
        payment: Payment!
        isActive: Boolean!
    }

    type GetOffers {
        total: Int!
        limit: Int!
        page: Int!
        assets: [String!]!
        offers: [Offer!]
    }

    input GetOffersPayload {
        page: Int!
        limit: Int!
        type: String!
        assets: String!
    }

    type Query {
        getOffers (payload: GetOffersPayload): GetOffers!
        getOffer(id: ID!): Offer!
        getUserOffers: [Offer!]
    }
    

    input CreateOfferPayload {
        coinId: String!
        fiat: String!
        type: String!
        timeout: Int!
        payment: ID!
        notes: String!
        amount: String!
        maxLimit: String!
        minLimit: String!
        priceMargin: String!
    }

    input UpdateOfferPayload {
        type: String!
        priceMargin: Int
        coinId: String
        fiat: String
        timeout: Int
        notes: String
        amount: String
        maxLimit: String
        minLimit: String
        payment: ID
        isActive: Boolean
    }


    type Mutation {
        deleteOffer(id: ID!): Offer!
        createOffer(payload: CreateOfferPayload!): Offer!
        updateOffer(id: ID!, payload: UpdateOfferPayload!): Offer!
    }
`;

export default offerDef;
