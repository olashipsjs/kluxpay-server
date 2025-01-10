const ticketDef = `#graphql 

    type Ticket {
        _id: ID!
        user: User
        name: String!
        title: String!
        status: String!
        category: String!
        priority: String!
        description: String!
        ticketId: Int
        createdAt: Date!
    }

    type Query {
        getAllTickets: [Ticket!]
        getTicketById (ticketId: ID): Ticket!
    }

    type Mutation {
        createTicket(
            name: String!,
            email: String!,
            title: String!,
            priority: String!,
            category: String!,
            description: String!
        ): Ticket!
        
        changeTicketStatus(ticketId: ID!, status: String!): Ticket!
    }
`;

export default ticketDef;
