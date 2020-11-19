import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
@Entity()
export class Post {
	// column
	@Field()
	@PrimaryKey()
	id!: number;
	// column
	@Field(() => String)
	@Property({ type: 'Date' })
	createdAt = new Date();
	// column
	@Field(() => String)
	@Property({ type: 'Date', onUpdate: () => new Date() })
	updatedAt = new Date();
	// column
	@Field()
	@Property({ type: 'text' })
	title!: string;
}
