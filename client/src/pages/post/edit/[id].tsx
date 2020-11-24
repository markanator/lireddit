import { Box, Button, Heading } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import {
  usePostDetailsQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { useGetPostId } from "../../../hooks/useGetPostId";

const editPost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const postId = useGetPostId();
  const [updatePost] = useUpdatePostMutation();
  const { data, loading } = usePostDetailsQuery({
    skip: postId === -1,
    variables: {
      id: postId,
    },
  });

  if (loading) {
    return (
      <Layout>
        <Box>Loading...</Box>
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
    <Layout variant="small">
      <Heading>Edit Post</Heading>
      <Formik
        initialValues={{
          title: data.post.title,
          text: data.post.text,
        }}
        onSubmit={async (values) => {
          await updatePost({ variables: { id: postId, ...values } });
          router.push(`/post/${postId}`);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label="Post Title"
              name="title"
              placeholder="title"
              textarea={false}
            />
            <Box mt={4}>
              <InputField
                label="Post Content"
                name="text"
                placeholder="text..."
                textarea
              />
            </Box>
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Update Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default editPost;
