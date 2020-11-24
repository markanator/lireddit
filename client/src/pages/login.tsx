import React from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import NextLink from "next/link";
// locals
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { toErrorMap } from "../utils/toErrorMap";
import { useLoginMutation } from "../generated/graphql";

// interface registerProps {}

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  // GQL hook
  const [login] = useLoginMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          usernameOrEmail: "",
          password: "",
        }}
        onSubmit={async (values, { setErrors }) => {
          // value keys are exact to graphql stuff
          const res = await login({ variables: values });
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
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

// adds graphql support + SSR only for SEO
export default Login;
