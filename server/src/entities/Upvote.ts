// import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity() // typeORM
export class Upvote extends BaseEntity {
  @Column({ type: "int" })
  value: number;

  @PrimaryColumn()
  userId: number;

  // owner column
  @ManyToOne(() => User, (user) => user.upvotes) //relationships
  user: User;

  @PrimaryColumn()
  postId: number;

  // owner column
  @ManyToOne(() => Post, (post) => post.upvotes, {
    onDelete: "CASCADE",
  }) //relationships
  post: Post;
}
