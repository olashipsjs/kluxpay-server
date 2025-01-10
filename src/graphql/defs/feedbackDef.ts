const feedbackDef = `#graphql
  type Feedback {
    _id: ID!
    rating: Int!
    description: String!
    trade: Trade!
    user: User!
    createdAt: JSON!
    updatedAt: JSON!
  }

  type Query {
    getUserFeedbacks: [Feedback!]
    getFeedbackById(feedbackId: ID!): Feedback!
  } 

  type Mutation {
    createFeedback (rating: Int!, description: String!, tradeId: ID!): Feedback!
  }

`;

export default feedbackDef;
