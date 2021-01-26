import "reflect-metadata";
// import * as dotenv from "dotenv";
// dotenv.config();
import "dotenv-safe/config";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
// local imports
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Upvote } from "./entities/Upvote";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import path from "path";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";

const PORT = parseInt(process.env.PORT) || 8080;

const main = async () => {
  // setup ORM
  // setup connection
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [User, Post, Upvote],
    logging: true,
    ssl: __prod__ ? { rejectUnauthorized: false } : false,
    // synchronize: true, // don't run on production
    migrations: [path.join(__dirname, "./migrations/*")],
  });

  // console.log("### Connected!");

  await conn.runMigrations(); // run migrations

  // initialize app
  const app = express();

  // redis stuff
  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);
  app.set("trust proxy", 1);
  // cors fix
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // session MW b4 Apollo
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 1, // 1 yrs
        httpOnly: true, // non secure for dev
        sameSite: "lax", // csrf protections
        secure: __prod__, //cookie only works in https
        domain: __prod__ ? ".herokuapp.app" : undefined, // don't need?
      },
      saveUninitialized: false, // create sesh by default regardless of !data
      secret: process.env.SESSION_SECRET as string,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    playground: {
      settings: {
        "request.credentials": "include",
      },
    },
    // destructure access to have req,res
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      upvoteLoader: createUpvoteLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(PORT, () => {
    console.log(`### server started on http://localhost:${PORT}/graphql`);
  });
};

main().catch((err) => {
  console.error(err);
});
