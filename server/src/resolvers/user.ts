import { Resolver, InputType, Field, Mutation, Arg, Ctx, ObjectType } from 'type-graphql';
import argon2 from 'argon2'
import { MyContext } from '../types';
import { User } from '../entities/User';

@InputType() //typ-gql decorator
class UsernamePasswordInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

@ObjectType() //can return
class FieldError {
	@Field()
	field: string;

	@Field()
	message: string;
}


@ObjectType() //can return
class UserResponse {
	@Field(()=> [FieldError], {nullable: true})
	errors?: FieldError[];

	@Field(()=> User, {nullable: true})
	user?: User;
}



@Resolver()
export class UserResolver {
	@Mutation(() => User)
	async register(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em }: MyContext
	) {
		// dont want to save the plain text password to the DB
		const hashedPassword = await argon2.hash(options.password);
		// save hashed password
		const user = em.create(User, {
			username: options.username,
			password: hashedPassword,
		});
		// update DB
		await em.persistAndFlush(user);
		return user;
	}

	@Mutation(() => UserResponse) // type-gql ref
	async login(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em }: MyContext
	): Promise<UserResponse> {
		// find user
		const user = await em.findOne(User, {username: options.username});
		if (!user){
			return {
				errors: [{
					field: "username",
					message: "That username doesn't exist."

				}]
			}
		}

		// will return a bool
		const valid = await argon2.verify(user.password, options.password);
		if (!valid){
			return {
				errors: [{
					field: "password",
					message: "Incorrect Password."

				}]
			}
		}


		return { user };
	}

}
