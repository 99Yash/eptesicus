import cookie_parser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config(); // IMPORTANT: loads the environment variables from the .env file, before importing env.ts

import { env } from './env';

// NOTE https://github.com/expressjs/express/discussions/5491 - `csurf` package is archived, and has issues.

async function main() {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: ['http://localhost:3000'], // TODO: change to the production URL
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      credentials: true, // Allow this frontend (origin) to send cookies, authorization headers, or TLS client certificates along with requests.
      // In the client, you need to do this, else headers won't be included:
      //
      // fetch('http://localhost:4000/protected', {
      //   credentials: 'include', // ✅ tells browser: "send cookies or Authorization headers"
      // });
    })
  );

  app.use(cookie_parser());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.send('API is running');
  });

  app.listen(env.API_SERVER_PORT, () => {
    console.log(`Server is running on port ${env.API_SERVER_PORT}`);
  });
}

main();
