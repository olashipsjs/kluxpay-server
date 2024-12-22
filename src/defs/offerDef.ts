const offerDef = `#graphql 

    type Offer {
        _id: ID!
        priceMargin: Float!
        type: String!
        coinId: String!
        fiat: String!
        timeout: Int!
        notes: String!
        amount: Float!
        minLimit: Float!
        maxLimit: Float!
        createdBy: User!
        payment: Payment!
        isActive: Boolean!
    }

    type GetOffers {
        page: Int!
        total: Int!
        limit: Int!
        offers: [Offer!]
        assets: [String!]!
    }

    input GetOffersPayload {
        page: Int!
        limit: Int!
        type: String!
        assets: String!
    }

    type Query {
        getUserOffers: [Offer!]
        getOffer(id: ID!): Offer!
        getOffers (payload: GetOffersPayload): GetOffers!
    }
    

    input CreateOfferPayload {
        coinId: String!
        fiat: String!
        type: String!
        timeout: Int!
        payment: ID!
        notes: String!
        amount: Float!
        maxLimit: Float!
        minLimit: Float!
        priceMargin: Float!
    }

    input UpdateOfferPayload {
        type: String
        priceMargin: Float
        coinId: String
        fiat: String
        timeout: Int
        notes: String
        amount: Float
        maxLimit: Float
        minLimit: Float
        payment: ID
        isActive: Boolean
    }


    type Mutation {
        deleteOffer(id: ID!): Offer!
        activateOffer(id: ID!): Offer!
        createOffer(payload: CreateOfferPayload!): Offer!
        updateOffer(id: ID!, payload: UpdateOfferPayload!): Offer!
    }
`;

export default offerDef;
