import { ObjectType, Field } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Upvote } from "./Upvote";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  // PK
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  // column
  @Field()
  @Column()
  title!: string;

  // column
  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field()
  @Column()
  authorId: number;

  // owner column
  @Field()
  @ManyToOne(() => User, (user) => user.posts) //relationships
  author: User;

  @OneToMany(() => Upvote, (upvote) => upvote.post)
  upvotes: Upvote[];

  // column
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  // column
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
