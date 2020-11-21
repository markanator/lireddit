import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
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
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import path from "path";

const PORT = process.env.PORT || 7777;

const main = async () => {
  // setup ORM
  const conn = await createConnection({
    type: "postgres",
    port: parseInt(process.env.DB_PORT as string),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Post],
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
  });

  console.log("### Connected!");

  // await Post.delete({});
  conn.runMigrations(); // run migrations

  // setup connection
  const app = express();

  // redis stuff
  const RedisStore = connectRedis(session);
  const redis = new Redis();
  // initialize app

  // cors fix
  app.use(
    cors({
      origin: "http://localhost:3000",
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
      },
      saveUninitialized: false, // create sesh by default regardless of !data
      secret: process.env.COOKIE_SECRET as string,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    // destructure access to have req,res
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(PORT, () => {
    console.log(`### server started on http://localhost:${PORT}/graphql`);
  });
};

main().catch((err) => {
  console.error(err);
});
