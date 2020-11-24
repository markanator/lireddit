import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote";

export const createUpvoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Upvote | null>(
    async (keys) => {
      // get all user in one query
      const upvotes = await Upvote.findByIds(keys as any);
      // need to return data
      const upvoteIdsToUpvote: Record<string, Upvote> = {};

      upvotes.forEach((vote) => {
        upvoteIdsToUpvote[`${vote.userId} | ${vote.postId}`] = vote;
      });

      return keys.map(
        (key) => upvoteIdsToUpvote[`${key.userId} | ${key.postId}`]
      );
    }
  );
