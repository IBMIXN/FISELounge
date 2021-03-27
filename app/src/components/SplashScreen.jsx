import React from "react";
import { Flex, Stack, Icon, Text, Spinner } from "@chakra-ui/core";

const SplashScreen = () => (
  <Flex
    direction="column"
    position="fixed"
    justify="center"
    align="center"
    backgroundColor="gray.800"
    backgroundSize="cover"
    minWidth="100%"
    minHeight="100%"
    backgroundPosition="center"
    top="0"
    left="0"
  >
    <Spinner
      size="xl"
      color="blue.500"
      mt="2rem"
      thickness="5px"
      speed="0.6s"
    />

    <Text p="1rem " textAlign="center" color="white">
      FISE 2021 by UCL and IBM
    </Text>
    <Stack>
      <Icon name="ibm" color="white" w="200px" h="50px" m="1rem" />
      <Icon name="nhsX" color="white" w="200px" h="60px" m="1rem" />
      <Icon name="ucl" color="gray.400" w="200px" h="50px" m="1rem" />
    </Stack>

    <Stack p="1rem" color="gray.300">
      <Text textAlign="center">
        In association with IBM, NHS & University College London
      </Text>
      <Text
        textAlign="center"
        maxWidth="35em"
        color="gray.500"
        wordBreak="true"
      >
        The software is an early proof of concept for development purposes and
        should not be used as-is in a live environment without further
        redevelopment and/or testing. No warranty is given and no real data or
        personally identifiable data should be stored. Usage and its liabilities
        are your own.
      </Text>
    </Stack>
  </Flex>
);

export default SplashScreen;
