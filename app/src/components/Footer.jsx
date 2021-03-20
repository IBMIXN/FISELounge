import React from "react";
import { Flex, Stack, Icon, Text } from "@chakra-ui/core";

const Footer = (props) => (
  <Flex
    as="footer"
    py="4rem"
    direction="column"
    justify="center"
    align="center"
    w="100vw"
    overflowX="hidden"
  >
    <Text textAlign="center">FISE Lounge was created by students at UCL</Text>
    <Stack>
      <a href="https://ibm.com" aria-label="ibm">
        <Icon name="ibm" color="grey.900" w="200px" h="50px" m="1rem" />
      </a>
      <a href="https://nhs.uk" aria-label="nhs">
      <Icon name="nhsX" color="grey.900" w="200px" h="50px" m="1rem" />
      </a>
      <a href="https://ucl.ac.uk" aria-label="ucl">
        <Icon name="ucl" color="gray.700" w="200px" h="50px" m="1rem" />
      </a>
    </Stack>
    <Stack p="1rem" color="gray.400">
      <Text textAlign="center">
        In association with IBM, NHS & University College London.
      </Text>
      <Text textAlign="center">
        Supervised by John McNamara, Dean Mohamedally.
      </Text>
    </Stack>
  </Flex>
);

export default Footer;
