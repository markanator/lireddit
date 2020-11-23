import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
// locals
import { createUrqlClient } from "../../utils/createUrqlClient";
import { usePostDetailsQuery } from "../../generated/graphql";
import Layout from "../../components/Layout";

//interface PostDetailsProps {
//
//}

const PostDetails: React.FC<{}> = ({}) => {
  const router = useRouter();
  const postId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const [{ data, error, fetching }] = usePostDetailsQuery({
    pause: postId === -1, // stop query if it is neg one
    variables: {
      // all good
      id: postId,
    },
  });

  if (fetching) {
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
        <Text>{data?.post?.text}</Text>
      </article>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(PostDetails);
