import {
  Resolver,
  Field,
  Mutation,
  Arg,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
// locals
import { MyContext } from "../types";
import { User } from "../entities/User";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType() //can return
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType() //can return
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { em, req, redis }: MyContext
  ): Promise<UserResponse> {
    // reset password stuff goes in here
    if (newPassword.length <= 6) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password was too short! 👀",
          },
        ],
      };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token expired! 😲",
          },
        ],
      };
    }

    const user = await em.findOne(User, { id: parseInt(userId) });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists! 😢",
          },
        ],
      };
    }

    // dont want to save the plain text password to the DB
    user.password = await argon2.hash(newPassword);
    // update DB
    await em.persistAndFlush(user);

    // DEL redis key
    await redis.del(key);

    // login user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean) // decorator
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });
    if (!user) {
      // the email is not in the DB
      return true;
    }

    const token = v4();

    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    );

    // send the email
    sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    // if there is no user ID in the session return null
    if (!req.session.userId) {
      return null;
    }
    //
    const user = await em.findOne(User, { id: req.session.userId });

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // validation
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    // dont want to save the plain text password to the DB
    const hashedPassword = await argon2.hash(options.password);

    // update DB
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          email: options.email,
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = result[0];
    } catch (err) {
      if (err.code === "23505" || err.detail.includes("already exists")) {
        // duplicate username error
        return {
          errors: [
            {
              field: "username",
              message: "Username is already taken",
            },
          ],
        };
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
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // find user
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );

    // ERROR! no user found
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "That username or email does not exist.",
          },
        ],
      };
    }

    // will return a bool
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect Password.",
          },
        ],
      };
    }

    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: any) => {
        // destroy cookie regardless
        res.clearCookie(COOKIE_NAME);
        // check for error
        if (err) {
          console.error(err);
          resolve(false);
          return;
        }
        // all good
        resolve(true);
      })
    );
    // more
  }
}
