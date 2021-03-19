import { Flex, Stack, Icon, Text, Image } from "@chakra-ui/core";

export const Footer = (props) => (
  <Flex
    as="footer"
    py="8rem"
    direction="column"
    justify="center"
    align="center"
    bg="gray.800"
    w="100vw"
    overflowX="hidden"
    {...props}
  >
    <Text textAlign="center">FISE 2021 by UCL and IBM</Text>
    <Stack>
      <a href="https://ibm.com" aria-label="ibm">
        <Icon name="ibm" color="grey.300" w="200px" h="50px" m="1rem" />
      </a>
      <a href="https://nhs.uk" aria-label="nhs">
        <Icon name="nhsX" color="gray.400" w="200px" h="60px" m="1rem" />
      </a>
      <a href="https://ucl.ac.uk" aria-label="ucl">
        <Icon name="ucl" color="gray.400" w="200px" h="50px" m="1rem" />
      </a>
    </Stack>
    <Stack p="1rem" color="gray.300">
      <Text textAlign="center">
        In association with IBM, NHS & University College London
      </Text>
      <Text textAlign="center">
        Supervised by John McNamara, Dean Mohamedally.
      </Text>
      <Text textAlign="center" color="gray.500">
        DISCLAIMER
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
