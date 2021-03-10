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
    <Text textAlign="center" color="white">
      by UCL FISE Groups
    </Text>
    <Stack>
        <Icon name="ibm" color="white" w="200px" h="50px" m="1rem" />
        <Icon name="nhs" color="gray.400" w="200px" h="50px" m="1rem" />
        <Icon name="ucl" color="gray.400" w="200px" h="50px" m="1rem" />
    </Stack>
    <Stack p="1rem" color="gray.300">
      <Text textAlign="center">
        In association with IBM, NHS & University College London
      </Text>
      <Text textAlign="center">
        Supervised by John MacNamara, Dean Mohammedally
      </Text>
    </Stack>
    <Spinner
      size="xl"
      color="blue.500"
      mt="2rem"
      thickness="5px"
      speed="0.6s"
    />
  </Flex>
);

export default SplashScreen;
