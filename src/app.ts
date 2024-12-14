import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import path from 'path';
import express from 'express';
import cookies from 'cookie-parser';
import { ApolloServer } from '@apollo/server';

import { expressMiddleware } from '@apollo/server/express4';

// type definitions
import userDef from './defs/userDef';
import authDef from './defs/authDef';
import otpDef from './defs/otpDef';
import roleDef from './defs/roleDef';
import walletDef from './defs/walletDef';
import offerDef from './defs/offerDef';
import tradeDef from './defs/tradeDef';
import permissionDef from './defs/permissionDef';
import mailDef from './defs/mailDef';
import paymentDef from './defs/paymentDef';
import referralDef from './defs/referralDef';

// resolvers
import userResolver from './resolvers/userResolver';
import authResolver from './resolvers/authResolver';
import roleResolver from './resolvers/roleResolver';
import tradeResolver from './resolvers/tradeResolver';
import offerResolver from './resolvers/offerResolver';
import walletResolver from './resolvers/walletResolver';
import permissionResolver from './resolvers/permissionResolver';
import otpResolver from './resolvers/otpResolver';
import mailResolver from './resolvers/mailResolver';
import paymentResolver from './resolvers/paymentResolver';
import referralResolver from './resolvers/referralResolver';

// middlewares
import loggerMiddleware from './middlewares/loggerMiddleware';
import rateLimitMiddleware from './middlewares/rateLimitMiddleware';

// crons
import updateBalance from './crons/updateBalance';

// libraries
import render from './libs/render';

// config
import connectDB from './config/db';
import offerDeactivation from './crons/offerDeactivation';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(cookies());

app.use('/assets', express.static(path.join(__dirname, 'views/assets')));

app.get('/views/:template', async (req, res) => {
  const { template } = req.params;

  try {
    const html = render(template, {
      name: 'yuri markov',
      platform: 'Kluxpay',
      trader: 'james hugg',
      title: 'Trade cancelled',
      url: 'https://facebook.com/',
    });
    res.send(html);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send('An error occurred while rendering the email template.');
  }
});

const server = new ApolloServer({
  typeDefs: [
    userDef,
    authDef,
    otpDef,
    roleDef,
    walletDef,
    offerDef,
    tradeDef,
    permissionDef,
    mailDef,
    paymentDef,
    referralDef,
  ],
  resolvers: [
    userResolver,
    authResolver,
    otpResolver,
    roleResolver,
    walletResolver,
    offerResolver,
    tradeResolver,
    permissionResolver,
    mailResolver,
    paymentResolver,
    referralResolver,
  ],
});

const startServer = async () => {
  try {
    await connectDB();

    await server.start();

    app.use(
      '/api/graphql/',
      expressMiddleware<any>(server, {
        context: async ({ req, res }) => {
          // loggerMiddleware(req, res);

          const maxLimit = req.headers.maxLimit as string | undefined;

          // check if maxLimit is defined. If true run the rate limit middleware
          if (maxLimit) {
            rateLimitMiddleware(Number(maxLimit));
          }

          return { req, res };
        },
      })
    );

    const PORT = process.env.PORT || 5500;

    app.listen(PORT, async () => {
      console.log('🚀 Server is up and running at: ', PORT);

      // update wallet balance every 60 seconds
      setInterval(() => {
        updateBalance();
        offerDeactivation();
      }, 6000);
    });
  } catch (error) {
    console.error('Failed to start server:', (error as Error).message);
  }
};

startServer().catch((error) => console.log(error));
