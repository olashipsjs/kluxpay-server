import { Request, Response } from 'express';

const loggerMiddleware = (req: Request, res: Response) => {
  console.log({ req, res });
};

export default loggerMiddleware;
