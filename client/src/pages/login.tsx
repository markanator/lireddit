import React from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import NextLink from "next/link";
// locals
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  useColorMode,
} from "@chakra-ui/react";
import { toErrorMap } from "../utils/toErrorMap";
import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";

// interface registerProps {}

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  // GQL hook
  const [login] = useLoginMutation();
  const { colorMode } = useColorMode();
  const bgColor = { light: "gray.50", dark: "gray.900" };
  const color = { light: "black", dark: "white" };

  return (
    <Box bg={bgColor[colorMode]} color={color[colorMode]} w="full" h="100vh">
      <Wrapper variant="small">
        <Heading pb={8}>Login</Heading>
        <Formik
          initialValues={{
            usernameOrEmail: "",
            password: "",
          }}
          onSubmit={async (values, { setErrors }) => {
            // value keys are exact to graphql stuff
            const res = await login({
              variables: values,
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.login.user,
                  },
                });
                cache.evict({ fieldName: "posts:{}" });
              },
            });
            // render errors
            if (res.data?.login.errors) {
              setErrors(toErrorMap(res.data.login.errors));
            } else if (res.data?.login.user) {
              // it worked
              if (typeof router.query.next === "string") {
                router.push(router.query.next);
              } else {
                router.push("/");
              }
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                label="Username Or Email"
                name="usernameOrEmail"
                placeholder="Username Or Email"
                textarea={false}
              />
              <Box mt={4}>
                <InputField
                  label="Password"
                  name="password"
                  placeholder="password"
                  type="password"
                  textarea={false}
                />
              </Box>
              <Flex mt={4}>
                <NextLink href="/forgot-password">
                  <Link ml={"auto"}>Forgot Password?</Link>
                </NextLink>
              </Flex>
              <Flex
                mt={8}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={isSubmitting}
                >
                  Login
                </Button>
                <NextLink href="/">
                  <Button colorScheme="gray" variant="ghost">
                    Cancel
                  </Button>
                </NextLink>
                <NextLink href="/register">
                  <Button colorScheme="gray" variant="outline">
                    Register
                  </Button>
                </NextLink>
              </Flex>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Box>
  );
};

// adds graphql support + SSR only for SEO
export default Login;
