import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { Box, Container } from "@chakra-ui/react";

export const Root = () => {
  return (
    <Box>
      <Navigation />
      <Container maxW="4xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  );
};
