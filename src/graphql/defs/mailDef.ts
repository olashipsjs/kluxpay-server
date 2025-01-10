const mailDef = `#graphql 

    type Mutation {
        sendMail(data: JSON, subject: String!, template: String!, recipients: String!): JSON
    }
`;

export default mailDef;
