import { Link as ChakraLink, Button } from "@chakra-ui/core";

import { Container } from "./Container";

export const CTA = () => (
  <Container
    flexDirection="row"
    position="fixed"
    bottom="0"
    width="100%"
    maxWidth="48rem"
    py={2}
  >
    <ChakraLink
      href="https://github.com/vercel/next.js/blob/canary/examples/with-chakra-ui"
      flexGrow={3}
      mx={2}
    >
      <a
        href={`/login`}
      >
        <Button width="100%" variant="solid" variantColor="blue">
          Get Started Now
        </Button>
      </a>
    </ChakraLink>
  </Container>
);
