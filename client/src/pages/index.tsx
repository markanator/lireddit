import { withUrqlClient } from "next-urql";
import React from "react";
import Layout from "../components/Layout";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";
// locals
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>CreatePost</Link>
      </NextLink>
      <div>Hello world!</div>
      <br />
      {!data ? (
        <div className="">Loading...</div>
      ) : (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </Layout>
  );
};

// supports ssr
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
