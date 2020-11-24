import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
// locals
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostsButtonProps {
  id: number;
  authorId: number;
}

const EditDeletePostsButton: React.FC<EditDeletePostsButtonProps> = ({
  id,
  authorId,
}) => {
  const { data: meData } = useMeQuery();
  const [deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== authorId) {
    return null;
  }
  return (
    <Box>
      <NextLink href={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          ml="auto"
          mr={4}
          icon={<EditIcon />}
          aria-label="edit post"
        />
      </NextLink>
      <IconButton
        ml="auto"
        icon={<DeleteIcon />}
        aria-label="delete post"
        onClick={() => {
          deletePost({ variables: { id } });
        }}
      />
    </Box>
  );
};

export default EditDeletePostsButton;
