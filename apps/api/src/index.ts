import cookie_parser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config(); // IMPORTANT: loads the environment variables from the .env file, before importing env.ts

import { env } from './env';
import { users as userRouter } from './routers/user.router';

// NOTE https://github.com/expressjs/express/discussions/5491 - `csurf` package is archived, and has issues.

async function main() {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: ['http://localhost:3000'], // TODO: change to the production URL
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      credentials: true, // Allow this frontend (origin) to send cookies, authorization headers, or TLS client certificates along with requests.
      // In the client, we need to do "include" credentials, else the headers won't be included (look at the api.ts file in the web app or @see https://github.com/99yash/eptesicus/blob/main/apps/web/src/lib/api.ts)
    })
  );

  app.use(cookie_parser());
  app.use(express.urlencoded({ extended: true }));

  app.use('/users', userRouter);

  app.get('/', (_req, res) => {
    res.send('API is running');
  });

  app.listen(env.API_SERVER_PORT, () => {
    console.log(`Server is running on port ${env.API_SERVER_PORT}`);
  });
}

main();
