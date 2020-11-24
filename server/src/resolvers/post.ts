import { Upvote } from "../entities/Upvote";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
//
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post]) //gql type
  posts: Post[];

  @Field() // gql type
  hasMore: Boolean;
}

@Resolver(Post) // could have been added to Entity
export class PostResolver {
  // get text snippet
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }
  // get author for a post
  @FieldResolver(() => User)
  async author(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    // will batch all users into a single call
    // and return them
    return userLoader.load(post.authorId);
  }
  // get author for a post
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { upvoteLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    // will batch all users into a single call
    // and return them
    const vote = await upvoteLoader.load({
      postId: post.id,
      userId: parseInt(req.session.id),
    });

    return vote ? vote.value : null;
  }

  // return list of Posts
  @Query(() => PaginatedPosts) // gql type
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    // TS type here
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    // for SQL Query below
    const sqlReplacement: any[] = [realLimitPlusOne];

    if (cursor) {
      sqlReplacement.push(new Date(parseInt(cursor)));
    }
    // write a join => big query that returns joined data
    const posts = await getConnection().query(
      `
        select p.*
        from post p
        ${cursor ? `where p."createdAt" < $2` : ""}
        order by p."createdAt" DESC
        limit $1
      `,
      sqlReplacement
    );

    return {
      posts: posts.slice(0, realLimit), // only give users proper amount
      hasMore: posts.length === realLimitPlusOne, // if its less than above return false => no more content
    };
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    // 1. fetch the post
    const res = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where("id = :id and authorId = :authorId", {
        id,
        authorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return res.raw[0];
  }

  @Mutation(() => Boolean) // type-gql ref
  @UseMiddleware(isAuth) // must be signed in
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    //#region NOT CASCADE WAY
    // need permission to delete
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // }
    // //
    // if (post.authorId !== req.session.userId) {
    //   throw new Error("Not Authorized!");
    // }
    // await Upvote.delete({ postId: id });
    //#endregion
    await Post.delete({ id, authorId: parseInt(req.session.id) });
    return true;
  }

  @Mutation(() => Boolean)
  // @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpvote = value !== -1;
    // prevent spamming
    const realValue = isUpvote ? 1 : -1;
    const { userId } = req.session;

    // fetch previous
    const upvote = await Upvote.findOne({ where: { postId, userId } });

    // user has voted on post before
    if (upvote && upvote.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          update upvote
          set value = $1
          where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId]
        );

        // *2 just for front end display purposes
        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2;
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!upvote) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          insert into upvote ("userId", "postId", "value")
          values ($1, $2, $3);
        `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2;
        `,
          [realValue, postId]
        );
      });
    }

    return true;
  }
}
