import app from './app';
import http from 'http';
import './config/dotenv';
import crons from './crons';
import io from './socket/io';
import connectDB from './config/db';
import handleError from './utils/handleError';
import apolloServer from './graphql/apolloServer';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { expressMiddleware } from '@apollo/server/express4';
import rateLimitMiddleware from './middlewares/rateLimitMiddleware';

const server = http.createServer(app);
io.attach(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'UPDATE'],
  },
});

const PORT = process.env.PORT || 5500;

const startServer = () => {
  server.listen(PORT, async () => {
    try {
      await connectDB();
      await apolloServer.start();
      await crons();

      app.use(
        '/api/graphql',
        graphqlUploadExpress({
          maxFiles: 10,
          overrideSendResponse: false,
          maxFileSize: 10 * 1024 * 1024, // 10MB
        }),
        expressMiddleware(apolloServer, {
          context: async ({ req, res }) => {
            const maxLimit = req.headers.maxLimit as string | undefined;
            if (maxLimit) {
              rateLimitMiddleware(Number(maxLimit));
            }
            return { req, res };
          },
        })
      );

      console.log(`Server started on port: ${PORT}`);
    } catch (error) {
      console.log('Server startup error: ' + error);
      handleError(error);
    }
  });
};

startServer();
