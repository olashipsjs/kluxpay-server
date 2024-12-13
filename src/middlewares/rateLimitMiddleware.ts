import rateLimit from 'express-rate-limit';

const rateLimitMiddleware = (trials: number = 8) => {
  rateLimit({
    max: trials,
    windowMs: 10 * 60 * 1000,
    message:
      'Too many requests created from this IP, please try again after 10 minutes.',
  });
};

export default rateLimitMiddleware;
