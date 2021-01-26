import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
// locals
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../hooks/useIsAuth";

const createPost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [createPost] = useCreatePostMutation();
  useIsAuth();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{
          title: "",
          text: "",
        }}
        onSubmit={async (values) => {
          // post content
          const { errors } = await createPost({
            variables: { input: values },
            update: (cache) => {
              cache.evict({ fieldName: "posts:{}" });
            },
          });
          // render errors
          if (!errors) {
            router.push("/");
          }
          // console.log();
        }}
      >
        {({ isSubmitting }) => (
          <Form
            style={{
              paddingTop: "6rem",
              paddingBottom: "6rem",
            }}
          >
            <InputField
              label="Enter Post Title"
              name="title"
              placeholder="title"
              textarea={false}
            />
            <Box mt={4}>
              <InputField
                label="Post Body"
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
              Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default createPost;
