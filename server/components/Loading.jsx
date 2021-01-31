import { Flex, Spinner } from "@chakra-ui/core";

const Loading = () => (
  <Flex
    justifyContent="center"
    alignItems="center"
    height="70vh"
  >
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.100"
      color="blue.500"
      size="xl"
    />
  </Flex>
);

export default Loading;
