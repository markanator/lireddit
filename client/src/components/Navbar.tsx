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
// locals
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { DarkModeSwitch } from "./DarkModeSwitch";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const { colorMode } = useColorMode();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  let body = null;
  // dark mode stuff
  const bgColor = { light: "tan", dark: "gray.700" };

  // loading
  if (fetching) {
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
          onClick={() => {
            logout();
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
