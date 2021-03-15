import { useUser } from "../lib/hooks";

import { Heading, List, ListIcon, ListItem, Text } from "@chakra-ui/core";

import { Container } from "../components/Container";
import { Nav } from "../components/Nav";
import { Hero } from "../components/Hero";
import { Main } from "../components/Main";
import { Footer } from "../components/Footer";
import { CTA } from "../components/CTA";
import React from "react";

const IndexPage = () => {
  const user = useUser();

  return (
    <Container>
      <Nav />
      <Hero />
      <Main mt="-30vh">
        <Heading>
          Let your loved ones connect with <strong>you</strong>, not the other
          way around.
        </Heading>

        <List spacing={3} my={0}>
          <ListItem>
            <ListIcon icon="check-circle" color="green.500" />
            Intuitive User Interface
          </ListItem>
          <ListItem>
            <ListIcon icon="check-circle" color="green.500" />
            Secure
          </ListItem>
          <ListItem>
            <ListIcon icon="check-circle" color="green.500" />
            Free
          </ListItem>
        </List>
      </Main>
      <Text mb="3rem">
        <i>*Not supported on Internet Explorer & Opera Mini</i>
      </Text>
      <Footer />
      {!user && <CTA />}
    </Container>
  );
};

export default IndexPage;
