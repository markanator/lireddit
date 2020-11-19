import { Box, Flex, Link } from "@chakra-ui/react";
import React from "react";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  return (
    <Flex bg="tomato" p={4}>
      <Box ml={"auto"}>
        <Link mr={2} color="white">
          Login
        </Link>
        <Link color="white">Register</Link>
      </Box>
    </Flex>
  );
};

export default Navbar;
