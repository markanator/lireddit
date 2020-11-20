import { Resolver, Query, Arg, Int, Mutation } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  // return list of Posts
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    // await sleep(2000);
    return Post.find();
  }

  @Query(() => Post, { nullable: true }) // type-gql reference
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post) //type-gql reference
  async createPost(@Arg("title") title: string): Promise<Post> {
    // 2 sql queries
    return Post.create({ title }).save();
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
