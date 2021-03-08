import { useUser } from "../lib/hooks";

import { Heading, List, ListIcon, ListItem } from "@chakra-ui/core";

import { Container } from "../components/Container";
import { Nav } from "../components/Nav";
import { Hero } from "../components/Hero";
import { Main } from "../components/Main";
import { Footer } from "../components/Footer";
import { CTA } from "../components/CTA";
import React, { useState, useEffect } from 'react'
import SplashScreen from "../components/SplashScreen";

const IndexPage = () => {
  const user = useUser();

  const [loaded, setLoading] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoading(true), 6000)
  }, [])

  return loaded ? (
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
      <Footer />
      {!user && <CTA />}
    </Container>
  ) : (
    <SplashScreen />
  );
};

export default IndexPage;
