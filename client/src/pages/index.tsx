import React from "react";
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
import UpvoteSection from "../components/UpvoteSection";
import EditDeletePostsButton from "../components/EditDeletePostsButton";

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 15,
      cursor: null,
    },
  });

  if (!loading && !data) {
    return (
      <div>
        <Heading fontSize="lg">Query Failed.</Heading>
        <Text>{error?.message}</Text>
      </div>
    );
  }

  return (
    <Layout>
      <Flex>
        <Heading>Fresh Posts</Heading>
      </Flex>
      <br />
      {!data && loading ? (
        <div className="">Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((post) =>
            !post ? null : (
              <Flex p={5} shadow="md" borderWidth="1px" key={post.id}>
                {/* imported component */}
                <UpvoteSection post={post} />
                <Box flex={1}>
                  <NextLink href={`/post/${post.id}`}>
                    <Link>
                      <Heading fontSize="xl">{post.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>{post.author.username}</Text>
                  <Flex align="center">
                    <Text flex={1} mt={4}>
                      {post.textSnippet}
                    </Text>
                    <Box ml="auto">
                      <EditDeletePostsButton
                        id={post.id}
                        authorId={post.author.id}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex my={8}>
          <Button
            isLoading={loading}
            m="auto"
            onClick={() => {
              // apollo pagination
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
                updateQuery: (previousValue, { fetchMoreResult }) => {
                  if (!fetchMoreResult) {
                    return previousValue;
                  }

                  return {
                    // TODO
                  };
                },
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
export default Index;
