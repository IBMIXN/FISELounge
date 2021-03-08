import { Flex, Stack, Icon, Text } from "@chakra-ui/core";
import { Spinner } from "@chakra-ui/core";
import { Container } from "./Container";
import { Main } from "./Main";

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
    <Text textAlign="center" color="white" >by UCL FISE Groups</Text>
    <Stack>
      <a >
        <Icon name="ibm" color="white" w="200px" h="50px" m="1rem" />
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

export default SplashScreen;