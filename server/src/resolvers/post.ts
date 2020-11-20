import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
  // return list of Posts
  @Query(() => [Post])
  async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    // await sleep(2000);
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true }) // type-gql reference
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post) //type-gql reference
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    // will return a post
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true }) // type-gql reference
  async updatePost(
    // first parameter
    @Arg("id") id: number,
    // second parameter
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    // 1. fetch the post
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    // 2. they gave us a title that is not blank
    if (typeof title !== "undefined") {
      post.title = title;
      // update!
      await em.persistAndFlush(post);
    }
    // return it, obvi!
    return post;
  }

  @Mutation(() => Boolean) // type-gql ref
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    // need to do try catch
    await em.nativeDelete(Post, { id });
    return true;
  }
}
