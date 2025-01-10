import { ApolloServer } from '@apollo/server';
import typeDefs from './defs';
import resolvers from './resolvers';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

export default apolloServer;
