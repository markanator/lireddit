import { ApolloCache } from "@apollo/client";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Text, Flex, IconButton } from "@chakra-ui/react";
import gql from "graphql-tag";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {
  PostSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from "../generated/graphql";

interface UpvoteSectionProps {
  post: PostSnippetFragment;
}

const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const router = useRouter();
  const [voteLoading, setVoteLoading] = useState<"uload" | "dload" | "noLoad">(
    "noLoad"
  );
  const [vote] = useVoteMutation();

  return (
    <Flex direction="column" alignItems="center" mr={4}>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setVoteLoading("uload");
          const { data } = await vote({
            variables: {
              postId: post.id,
              value: 1,
            },
            update: (cache) => updateAfterVote(1, post.id, cache),
          });

          if (data?.vote === false) {
            setVoteLoading("noLoad");
            router.push("/login");
          } else {
            setVoteLoading("noLoad");
          }
        }}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        isLoading={voteLoading === "uload"}
        aria-label="Upvote Post"
        icon={<ChevronUpIcon />}
      />
      <Text fontSize="xl" py={2}>
        {post.points}
      </Text>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setVoteLoading("dload");
          const { data } = await vote({
            variables: {
              postId: post.id,
              value: -1,
            },
            update: (cache) => updateAfterVote(-1, post.id, cache),
          });
          if (data?.vote === false) {
            setVoteLoading("noLoad");
            router.push("/login");
          } else {
            setVoteLoading("noLoad");
          }
        }}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        isLoading={voteLoading === "dload"}
        aria-label="Downvote Post"
        icon={<ChevronDownIcon />}
      />
    </Flex>
  );
};

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: "Post:" + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });

  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints =
      (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
    cache.writeFragment({
      id: "Post:" + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

export default UpvoteSection;
