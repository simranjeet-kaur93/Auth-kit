import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),
  WEB_URL: Joi.string().uri().default('http://localhost:3001'),
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5433),
  POSTGRES_USER: Joi.string().default('authkit_user'),
  POSTGRES_PASSWORD: Joi.string().default('authkit_pass_123'),
  POSTGRES_DB: Joi.string().default('authkit'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  JWT_ACCESS_SECRET: Joi.string().min(8).required(),
  JWT_REFRESH_SECRET: Joi.string().min(8).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  GOOGLE_CALLBACK_URL: Joi.string()
    .uri()
    .default('http://localhost:3000/auth/google/callback'),
  SENDGRID_API_KEY: Joi.string().allow('').optional(),
  SENDGRID_FROM_EMAIL: Joi.string().email().default('noreply@example.com'),
  TWILIO_ACCOUNT_SID: Joi.string().allow('').optional(),
  TWILIO_AUTH_TOKEN: Joi.string().allow('').optional(),
  TWILIO_FROM_PHONE: Joi.string().allow('').optional(),
});
