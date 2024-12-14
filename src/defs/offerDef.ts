const offerDef = `#graphql 

    type Offer {
        _id: ID!
        priceMargin: Int!
        type: String!
        coinId: String!
        fiat: String!
        timeout: Int!
        notes: String!
        amount: Int!
        minLimit: Int!
        maxLimit: Int!
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
        amount: Int!
        maxLimit: Int!
        minLimit: Int!
        priceMargin: Int!
    }

    input UpdateOfferPayload {
        type: String!
        priceMargin: Int
        coinId: String
        fiat: String
        timeout: Int
        notes: String
        amount: Int
        maxLimit: Int
        minLimit: Int
        payment: ID
        isActive: Boolean
    }

    input ActivateOfferPayload {
        tokenAddress: String!
        
    }


    type Mutation {
        activateOffer(id: ID!): Offer!
        deleteOffer(id: ID!): Offer!
        createOffer(payload: CreateOfferPayload!): Offer!
        updateOffer(id: ID!, payload: UpdateOfferPayload!): Offer!
    }
`;

export default offerDef;
