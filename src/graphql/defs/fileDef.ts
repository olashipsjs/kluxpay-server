const fileDef = `#graphql 

    scalar Upload

    type File {
        _id: ID!
        size: Float!
        url: String!
        timestamp: Date!
        mimetype: String!
        filename: String!
        uploadedBy: User!
    }

    type Mutation {
        uploadFile(file: Upload!): JSON
    }
`;

export default fileDef;
