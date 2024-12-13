import Joi from 'joi';

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .regex(/[a-z]/, 'lowercase')
    .regex(/[A-Z]/, 'uppercase')
    .regex(/\d/, 'number')
    .regex(/[@$!%*#:-?&]/, 'special character')
    .required(),
});

export default userSchema;
