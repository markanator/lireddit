import { Resolver, InputType, Field, Mutation, Arg, Ctx, ObjectType, Query } from 'type-graphql';
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
	@Query(()=> User,{nullable: true})
	async me(
		@Ctx() { em, req }: MyContext
	) {
		// if there is no user ID in the session return null
		if(!req.session.userId){
			return null;
		}
		//
		const user = await em.findOne(User,{id: req.session.userId});

		return user;
	}


	@Mutation(() => UserResponse)
	async register(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em,req }: MyContext
	):Promise<UserResponse> {

		// validation
		if (options.username.length <=2){
			return {
				errors: [{
					field: "Username",
					message: "Too short!"
				}]
			}
		}
		if (options.password.length <=6){
			return {
				errors: [{
					field: "Password",
					message: "Too short!"
				}]
			}
		}

		// dont want to save the plain text password to the DB
		const hashedPassword = await argon2.hash(options.password);
		// save hashed password
		const user = em.create(User, {
			username: options.username,
			password: hashedPassword,
		});
		// update DB
		try{
			await em.persistAndFlush(user);
		}
		catch (err){
			if (err.code === "23505" || err.detail.includes("already exists")){
				// duplicate username error
				return {
					errors: [{
						field: "username",
						message: "Username is already taken"
					}]
				}
			}
			console.log("message: ", err.message);
		}

		// store userId in session
		// keep them logged in
		req.session.userId = user.id;


		return { user };
	}

	@Mutation(() => UserResponse) // type-gql ref
	async login(
		@Arg('options') options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
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

		req.session!.userId = user.id;


		return { user };
	}

}
