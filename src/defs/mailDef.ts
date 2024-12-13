const mailDef = `#graphql 
    scalar MailData

    input SendMailPayload {
        data: MailData
        subject: String
        template: String
        recipients: String
    }

    type Mutation {
        sendMail(payload: SendMailPayload!): JSON
    }
`;

export default mailDef;
