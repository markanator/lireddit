import {
  Resolver,
  Field,
  Mutation,
  Arg,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { v4 } from "uuid";
import { getConnection } from "typeorm";
// locals
import { MyContext } from "../types";
import { User } from "../entities/User";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";

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

@Resolver(User)
export class UserResolver {
  // lets hide emails from being public
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the current user and its ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    // current user wants to see someone elses email
    return "";
  }

  // enter all mutations and queries here
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, redis }: MyContext
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

    const _userId = parseInt(userId);
    const user = await User.findOne(_userId);

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

    // update DB
    await User.update(
      {
        id: _userId,
      },
      {
        password: await argon2.hash(newPassword),
      }
    );

    // DEL redis key
    await redis.del(key);

    // login user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean) // decorator
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
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
      `<a href="${process.env.CORS_ORIGIN}/change-password/${token}">reset password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    // if there is no user ID in the session return null
    if (!req.session.userId) {
      return null;
    }
    //
    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
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
      const res = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: options.email,
          username: options.username,
          password: hashedPassword,
        })
        .returning("*")
        .execute();

      // user = result[0];
      user = res.raw[0];
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

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
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
