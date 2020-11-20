import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
// locals
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import NextLink from "next/link";

const ChangePassword: NextPage<{}> = () => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState<string>("");

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          newPassword: "",
        }}
        onSubmit={async (values, { setErrors }) => {
          const res = await changePassword({
            newPassword: values.newPassword,
            token:
              typeof router.query.token === "string" ? router.query.token : "",
          });
          // error checking
          if (res.data?.changePassword.errors) {
            const errorMap = toErrorMap(res.data.changePassword.errors);
            if ("token" in errorMap) {
              // handle token issues
              setTokenError(errorMap.token);
            }
            // set error anyhow
            setErrors(errorMap);
          }
          // it worked!
          else if (res.data?.changePassword.user) {
            // worked
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label="Enter New Password"
              name="newPassword"
              placeholder="newPassword"
              type="password"
              textarea={false}
            />
            {tokenError ? (
              <Flex>
                <Box mr={4} color="tomato">
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Link>Request Another Link</Link>
                </NextLink>
              </Flex>
            ) : null}

            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

// supports ssr
export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword);
