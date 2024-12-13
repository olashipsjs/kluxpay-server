const fileDef = `#graphql 
    type File {
        _id: ID!
        size: Int!
        url: String!
        mimetype: String!
        uploadedBy: User!
    }

    type Query {
        file(id: ID!): File!
        files: [File!]
    }

    type Mutation {
        uploadSingleFile(file: File): File!
        uploadMultipleFiles(files: File): File!
    }
`;

export default fileDef;
