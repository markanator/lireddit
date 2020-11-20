import { ObjectType, Field } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
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
  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  // column
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  // column
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
