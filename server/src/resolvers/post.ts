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
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

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

  // return list of Posts
  @Query(() => PaginatedPosts) // gql type
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    // TS type here
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    // for SQL Query below
    const sqlReplacement: any[] = [realLimitPlusOne];

    if (req.session.userId) {
      sqlReplacement.push(req.session.userId);
    }

    let cursorIndex = 3;
    if (cursor) {
      sqlReplacement.push(new Date(parseInt(cursor)));
      cursorIndex = sqlReplacement.length;
    }
    // write a join => big query that returns joined data
    const posts = await getConnection().query(
      `
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
        ) author,
        ${
          req.session.userId
            ? '(select value from upvote where "userId" = $2 and "postId" = p.id) "voteStatus"'
            : 'null as "voteStatus"'
        }

      from post p
      inner join public.user u on u.id = p."authorId"
      ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}
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
    return Post.findOne(id, { relations: ["author"] });
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
    @Arg("id") id: number,
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
