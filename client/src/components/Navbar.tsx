import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
// import { useRouter } from "next/router";
// locals
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { DarkModeSwitch } from "./DarkModeSwitch";
import { useApolloClient } from "@apollo/client";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  // const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const { colorMode } = useColorMode();
  const { data, loading } = useMeQuery({
    skip: isServer(),
    fetchPolicy: "cache-and-network",
  });
  let body = null;
  // dark mode stuff
  const bgColor = { light: "tan", dark: "gray.700" };

  console.log("me data", { ...data?.me });

  // loading
  if (loading) {
    // body = null;
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={4} color="white">
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link mr={4} color="white">
            Register
          </Link>
        </NextLink>
        <DarkModeSwitch />
      </>
    );
    // user is logged in
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={2}>
            Create a Post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
          isLoading={logoutFetching}
          variant="link"
          mr={4}
        >
          Logout
        </Button>
        <DarkModeSwitch />
      </Flex>
    );
  }

  return (
    <Flex
      position="sticky"
      zIndex={1}
      bg={bgColor[colorMode]}
      p={4}
      align="center"
    >
      <Flex maxW={800} align="center" flex={1} m="auto">
        <NextLink href="/">
          <Link>
            <Heading>Light-Reddit</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};

export default Navbar;
