import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import path from 'path';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cookies from 'cookie-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

// Import existing definitions and resolvers
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

import rateLimitMiddleware from './middlewares/rateLimitMiddleware';
import updateBalance from './crons/updateBalance';
import offerDeactivation from './crons/offerDeactivation';
import render from './libs/render';
import connectDB from './config/db';

import Message from './models/message';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());

const allowedOrigins = ['http://localhost:5173', 'https://www.kluxpay.com'];
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('Request origin:', origin);
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(cookies());

app.use('/assets', express.static(path.join(__dirname, 'views/assets')));

app.get('/views/:template', async (req, res) => {
  const { template } = req.params;
  try {
    const html = render(template);
    res.send(html);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send('An error occurred while rendering the email template.');
  }
});

// Apollo Server Setup
const apolloServer = new ApolloServer({
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

// Start Apollo Server
const startServer = async () => {
  try {
    await connectDB();
    await apolloServer.start();

    app.use(
      '/api/graphql/',
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

    const PORT = process.env.PORT || 5500;

    // Set up Socket.IO
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('join', async ({ tradeId, userId }, cb) => {
        if (!tradeId) return cb(new Error('tradeId is required'), false);

        const room = tradeId;
        socket.join(room);

        // Fetch and send all previous messages for this trade
        const messages = await Message.find({ trade: tradeId }).sort({
          createdAt: 1,
        });
        socket.emit('roomData', { room, messages });

        // Welcome message
        const welcomeMessage = new Message({
          user: userId,
          trade: tradeId,
          text: 'Please confirm payment before proceeding to make payment',
        });
        await welcomeMessage.save();

        // Send welcome message to current user and notify others in the room
        socket.emit('message', welcomeMessage);
        socket.broadcast.to(room).emit('message', welcomeMessage);

        cb(null, true);
      });

      socket.on('sendMessage', async ({ userId, tradeId, text }, cb) => {
        try {
          if (!userId || !tradeId || !text) {
            return cb(new Error('userId, tradeId, and text are required'));
          }

          const message = new Message({ text, sender: userId, trade: tradeId });
          await message.save();

          io.to(tradeId).emit('message', message);
          cb(null, message);
        } catch (err) {
          console.error(err);
          cb(new Error('Failed to send message'));
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Start HTTP Server
    server.listen(PORT, () => {
      console.log(`🚀 Server is up and running at: ${PORT}`);

      setInterval(() => {
        updateBalance();
        offerDeactivation();
      }, 60000);
    });
  } catch (error) {
    console.error('Failed to start server:', (error as Error).message);
  }
};

startServer();
