import bearerAuthorization from '../../middlewares/bearerAuthorization';
import Ticket, { TicketDocument } from '../../models/ticket';
import User from '../../models/user';
import handleError from '../../utils/handleError';

const ticketResolver = {
  Query: {
    getAllTickets: async (_: any, __: any, { req }: any) => {
      try {
        await bearerAuthorization(req);

        const tickets = await Ticket.find();

        return tickets;
      } catch (error) {
        handleError(error);
      }
    },

    getTicketById: async (_: any, { ticketId }: any, { req }: any) => {
      try {
        await bearerAuthorization(req);

        const ticket = await Ticket.findById(ticketId);

        return ticket;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Ticket: {
    user: async (parent: TicketDocument) => {
      try {
        const ticket = await Ticket.findById(parent._id).populate({
          path: 'user',
          select: '-password',
        });

        return ticket?.user;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    createTicket: async (_: any, variables: any) => {
      try {
        const count = await Ticket.countDocuments();

        const user = await User.findOne({ email: variables.email });

        const ticket = await Ticket.create({
          user: user?._id,
          ticketId: count + 1,
          name: variables.name,
          title: variables.title,
          priority: variables.priority,
          category: variables.category,
          description: variables.description,
        });

        return ticket;
      } catch (error) {
        handleError(error);
      }
    },

    changeTicketStatus: async (
      _: any,
      { ticketId, status }: any,
      { req }: any
    ) => {
      try {
        await bearerAuthorization(req);

        const ticket = await Ticket.findByIdAndUpdate(
          ticketId,
          { status },
          { new: true }
        );

        return ticket;
      } catch (error) {
        handleError(error);
      }
    },
  },
};

export default ticketResolver;
