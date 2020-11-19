import { MikroORM } from '@mikro-orm/core';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import 'reflect-metadata';
// local imports
import { __prod__ } from './constants';
import microConfig from './mikro-orm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

const PORT = process.env.PORT || 7777;

const main = async () => {
	const orm = await MikroORM.init(microConfig);
	await orm.getMigrator().up();

	const app = express();
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver,UserResolver],
			validate: false,
		}),
		context: () => ({ em: orm.em }),
	});
	apolloServer.applyMiddleware({ app });

	app.listen(PORT, () => {
		console.log(`### server started on http://localhost:${PORT}`);
	});
};

main();
