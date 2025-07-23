import { z } from 'zod';

const envSchema = z.object({
  API_SERVER_PORT: z.string().optional(),
  DATABASE_URL: z.string().url(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'staging']).optional(),
  OPENAI_API_KEY: z.string(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  JWT_SECRET: z.string(),
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  SESSION_SECRET: z.string(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
