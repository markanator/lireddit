import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import Layout from "../components/Layout";
import NextLink from "next/link";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
// locals
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  if (!fetching && !data) {
    return <div>Query Failed.</div>;
  }

  return (
    <Layout>
      <Flex>
        <Heading>Light-Reddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">CreatePost</Link>
        </NextLink>
      </Flex>
      {/* <div>Hello world!</div> */}
      <br />
      {!data && fetching ? (
        <div className="">Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((post) => (
            <Box p={5} shadow="md" borderWidth="1px" key={post.id}>
              <>
                <Heading fontSize="xl">{post.title}</Heading>{" "}
                <Text>{post.author.username}</Text>
              </>
              <Text mt={4}>{post.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex my={8}>
          <Button
            isLoading={fetching}
            m="auto"
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

// supports ssr
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
