import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React from "react";
// locals
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgotPasswordMutation } from "../generated/graphql";

const forgotPssword: React.FC<{}> = ({}) => {
  const [complete, setComeplete] = React.useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          email: "",
        }}
        onSubmit={async (values) => {
          // value keys are exact to graphql stuff
          await forgotPassword(values);
          setComeplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email exists, we;ve sent an email.
            </Box>
          ) : (
            <Form>
              <InputField
                label="Enter Email:"
                name="email"
                placeholder="gabi@example.com"
                type="email"
                textarea={false}
              />
              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Forgot Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

// adds graphql support + SSR only for SEO
export default withUrqlClient(createUrqlClient)(forgotPssword);
