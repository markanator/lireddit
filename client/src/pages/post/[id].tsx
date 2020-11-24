import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
// locals
import Layout from "../../components/Layout";
import { useGetPostFromUrl } from "../../hooks/useGetPostFromUrl";
import EditDeletePostsButton from "../../components/EditDeletePostsButton";

const PostDetails: React.FC<{}> = ({}) => {
  const { data, error, loading } = useGetPostFromUrl();

  if (loading) {
    return (
      <Layout>
        <Box>Loading...</Box>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout>
        <Box>{error}</Box>
      </Layout>
    );
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post!</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <article>
        <Heading as="h1" size="xl" mb={4}>
          {data?.post?.title}
        </Heading>
        <Box mb={4}>
          <Text>{data?.post?.text}</Text>
        </Box>
        <EditDeletePostsButton
          id={data.post.id}
          authorId={data.post.author.id}
        />
      </article>
    </Layout>
  );
};

export default PostDetails;
