import { useState } from "react";

import { useUser } from "../lib/hooks";

import { Box, Heading, Flex, Text, Button, Stack } from "@chakra-ui/core";

export const Nav = ({ props }) => {
  const user = useUser();

  const [show, setShow] = useState(true);
  const handleToggle = () => setShow(!show);

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      px="1.5rem"
      color="white"
      w={["100%", "100%", 3 / 4]}
      {...props}
    >
      <Flex as="a" href="/" align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={"-.1rem"}>
          FISE Lounge
        </Heading>
      </Flex>
      <Box
        // display={[show ? "block" : "none", "block"]}
        mt={{ base: 4, md: 0 }}
      >
        {user ? (
          <Stack isInline>
            <Button
              as="a"
              href="/dashboard"
              variant="outline"
              color="white"
              borderColor="white"
            >
              Dashboard
            </Button>
            <Button as="a" href="/api/logout" variant="outline" color="white">
              Sign Out
            </Button>
          </Stack>
        ) : (
          <Button
            as="a"
            href="/login"
            variant="outline"
            color="white"
            borderColor="white"
          >
            Sign In
          </Button>
        )}
      </Box>
    </Flex>
  );
};
