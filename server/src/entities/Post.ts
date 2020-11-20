import { ObjectType, Field } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  // PK
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  // column
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  // column
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  // column
  @Field()
  @Column()
  title!: string;
}
