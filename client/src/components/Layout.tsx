import { Box, useColorMode } from "@chakra-ui/react";
import React from "react";
import Navbar from "./Navbar";
import Wrapper, { WrapperVariant } from "./Wrapper";

interface LayoutProps {
  variant?: WrapperVariant;
}

const Layout: React.FC<LayoutProps> = ({ variant, children }) => {
  const { colorMode } = useColorMode();
  const bgColor = { light: "gray.50", dark: "gray.900" };
  const color = { light: "black", dark: "white" };
  return (
    <Box bg={bgColor[colorMode]} color={color[colorMode]}>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </Box>
  );
};

export default Layout;
