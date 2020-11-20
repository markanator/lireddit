import { InputType, Field } from "type-graphql";

@InputType() //typ-gql decorator
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
