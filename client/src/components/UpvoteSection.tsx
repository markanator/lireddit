import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Text, Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import {
  PostSnippetFragment,
  PostsQuery,
  useVoteMutation,
} from "../generated/graphql";

interface UpvoteSectionProps {
  // post: PostsQuery["posts"]["posts"][0]; OG way
  // tests need a whole post OBJ
  post: PostSnippetFragment;
}

const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const [voteLoading, setVoteLoading] = useState<"uload" | "dload" | "noLoad">(
    "noLoad"
  );
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" alignItems="center" mr={4}>
      <IconButton
        onClick={async () => {
          setVoteLoading("uload");
          await vote({
            postId: post.id,
            value: 1,
          });
          setVoteLoading("noLoad");
        }}
        isLoading={voteLoading === "uload"}
        aria-label="Upvote Post"
        icon={<ChevronUpIcon />}
      />
      <Text fontSize="xl" py={2}>
        {post.points}
      </Text>
      <IconButton
        onClick={async () => {
          setVoteLoading("dload");
          await vote({
            postId: post.id,
            value: -1,
          });
          setVoteLoading("noLoad");
        }}
        isLoading={voteLoading === "dload"}
        aria-label="Downvote Post"
        icon={<ChevronDownIcon />}
      />
    </Flex>
  );
};

export default UpvoteSection;
