import { MikroORM } from '@mikro-orm/core';
import path from 'path';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { __prod__ } from './constants';

export default {
	type: 'postgresql',
	migrations: {
		path: path.join(__dirname, './migrations'), // path to the folder with migrations
		pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
	},
	entities: [Post, User],
	dbName: 'lireddit',
	user: 'postgres',
	password: 'LOrain123',
	debug: !__prod__,
	port: 5433,
} as Parameters<typeof MikroORM.init>[0]; // fixing type issue
