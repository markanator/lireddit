import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import {
  Resolver,
  Query,
  Arg,
  Int,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  // return list of Posts
  @Query(() => [Post])
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);

    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .orderBy('"createdAt"', "DESC") // triple quotes because of capital letter
      .take(realLimit); // use this instead of limit => typeORM

    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    }

    return qb.getMany();
  }

  @Query(() => Post, { nullable: true }) // type-gql reference
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post) //type-gql reference
  @UseMiddleware(isAuth) //can be used anywhere
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    // 2 sql queries
    return Post.create({
      ...input,
      authorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true }) // type-gql reference
  async updatePost(
    // first parameter
    @Arg("id") id: number,
    // second parameter
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    // 1. fetch the post
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    // 2. they gave us a title that is not blank
    if (typeof title !== "undefined") {
      post.title = title;
      // update!
      await Post.update({ id }, { title });
    }
    // return it, obvi!
    return post;
  }

  @Mutation(() => Boolean) // type-gql ref
  async deletePost(@Arg("id") id: number): Promise<Boolean> {
    // need to do try catch
    await Post.delete(id);
    return true;
  }
}
