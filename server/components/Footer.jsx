import { Flex, Stack, Icon, Text } from "@chakra-ui/core";

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
    <Text textAlign="center">by UCL FISE Groups</Text>
    <Stack>
      <a href="https://ibm.com">
        <Icon name="ibm" color="grey.300" w="200px" h="50px" m="1rem" />
      </a>
      <a href="https://nhs.uk">
        <Icon name="nhs" color="gray.400" w="200px" h="50px" m="1rem" />
      </a>
      <a href="https://ucl.ac.uk">
        <Icon name="ucl" color="gray.400" w="200px" h="50px" m="1rem" />
      </a>
    </Stack>
    <Stack p="1rem" color="gray.300">
      <Text textAlign="center">
        In association with IBM, NHS & University College London
      </Text>
      <Text textAlign="center">
        Supervised by John MacNamara, Dean Mohammedally
      </Text>
    </Stack>
  </Flex>
);
