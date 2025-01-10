import { Server } from 'socket.io';
import Message from '../models/message';
import User from '../models/user';
import handleError from '../utils/handleError';

const io = new Server({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'UPDATE'],
  },
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('online', async ({ userId }) => {
    socket.data.userId = userId;

    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastActive: Date.now(),
      });
      io.emit('online', { userId, isOnline: true });
    } catch (error) {
      handleError(error);
    }
  });

  socket.on('join', async ({ tradeId }, cb) => {
    if (!tradeId) return cb(new Error('Trade ID is required'), false);

    const room = tradeId;
    socket.join(room);

    try {
      const messages = await Message.find({ trade: tradeId })
        .sort({ createdAt: 1 })
        .populate([{ path: 'sender', select: '-password' }, { path: 'trade' }]);

      socket.emit('roomData', { room, messages });
      socket.to(room).emit('roomData', { room, messages });

      cb(null, true);
    } catch (err) {
      console.error('Error fetching messages:', err);
      cb(new Error('Failed to fetch room messages'), false);
    }
  });

  socket.on('message', async ({ userId, tradeId, text }, cb) => {
    try {
      const message = new Message({ text, sender: userId, trade: tradeId });
      await message.save();

      const populatedMessage = await Message.findById(message._id).populate([
        { path: 'sender', select: '-password' },
        { path: 'trade' },
      ]);

      if (!populatedMessage) {
        throw new Error('Message could not be populated');
      }

      io.to(tradeId).emit('message', populatedMessage);

      cb(null, populatedMessage);
    } catch (err) {
      console.error(err);
      cb(new Error('Failed to send message'));
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);

    const userId = socket.data.userId;

    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastActive: Date.now(),
      });
    } catch (error) {
      handleError(error);
    }
  });
});

export default io;
