import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

type Props = Request;

const bearerAuthorization = async (req: Props, debug: boolean = false) => {
  const authorization = req.headers.authorization;

  if (debug) {
    console.log({ authorization });
  }

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new Error('Authorization header is missing or invalid');
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY!) as {
      id: string;
    };

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('Unauthorized request. Account does not exist.');
    }

    (req as any).user = { id: user._id };

    return { id: user._id };
  } catch (error) {
    console.log((error as Error).message);
    throw new Error((error as Error).message);
  }
};

export default bearerAuthorization;
