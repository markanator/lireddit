import { Box, Button, Flex, Heading, useColorMode } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
// locals
import Wrapper from "../components/Wrapper";
import { MeDocument, MeQuery, useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";

interface registerProps {}

const register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  // URQL hook
  const [register] = useRegisterMutation();
  const { colorMode } = useColorMode();
  const bgColor = { light: "gray.50", dark: "gray.900" };
  const color = { light: "black", dark: "white" };

  return (
    <Box bg={bgColor[colorMode]} color={color[colorMode]} w="full" h="100vh">
      <Wrapper variant="small">
        <Heading mb={8}>Register</Heading>
        <Formik
          initialValues={{
            email: "",
            username: "",
            password: "",
          }}
          onSubmit={async (values, { setErrors }) => {
            // value keys are exact to graphql stuff
            const res = await register({
              variables: { options: values },
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.register.user,
                  },
                });
              },
            });
            // render errors
            if (res.data?.register.errors) {
              setErrors(toErrorMap(res.data.register.errors));
            } else if (res.data?.register.user) {
              // it worked
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                label="Username"
                name="username"
                placeholder="Username"
                textarea={false}
              />
              <Box mt={4}>
                <InputField
                  label="Email"
                  name="email"
                  placeholder="mark@example.com"
                  type="email"
                  textarea={false}
                />
              </Box>
              <Box mt={4}>
                <InputField
                  label="Password"
                  name="password"
                  placeholder="password"
                  type="password"
                  textarea={false}
                />
              </Box>
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
                  Register
                </Button>
                <NextLink href="/">
                  <Button colorScheme="gray" variant="ghost">
                    Cancel
                  </Button>
                </NextLink>
                <NextLink href="/login">
                  <Button colorScheme="gray" variant="outline">
                    Login
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

// supports ssr
export default register;
