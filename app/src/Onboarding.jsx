import React from "react";
import { Redirect } from "react-router-dom";
import { Formik, Field } from "formik";
import {
  Flex,
  Text,
  Heading,
  Stack,
  FormErrorMessage,
  FormLabel,
  Link as ChakraLink,
  FormControl,
  Input,
  Button,
  Box,
} from "@chakra-ui/core";
import { useState } from "react";
import { useEffect } from "react";

import Footer from "./components/Footer";

function Onboarding() {
  const [userIsValid, setUserIsValid] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("user")) setUserIsValid(true);
  }, []);

  function validateOtc(value) {
    let error = "";
    if (!value) {
      error = "Required";
    }
    return error;
  }

  const handleFormSubmit = async (values, actions) => {
    await fetch(`${process.env.REACT_APP_SERVER_URL}/api/otc/${values.otc}`)
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
        throw r;
      })
      .then(({ message, data }) => {
        localStorage.setItem("otc", values.otc);
        localStorage.setItem("user", JSON.stringify(data));
        actions.setSubmitting(false);
        setUserIsValid(true);
        return;
      })
      .catch(async (err) => {
        actions.setSubmitting(false);
        if (err instanceof Error) {
          throw err;
        }
        if (err.status === 403) {
          setError("You entered an invalid one-time-code.");
        }
        throw await err.json().then((rJson) => {
          console.error(
            `HTTP ${err.status} ${err.statusText}: ${rJson.message}`
          );
          return;
        });
      });
  };

  return (
    <Flex direction="column" alignItems="center" justifyContent="flex-start">
      <Stack justifyContent="center" alignItems="center" height="25vh">
        <Heading fontSize="5vw">Welcome to FISE Lounge</Heading>
        {userIsValid && <Redirect to="/" />}
      </Stack>
      <Box>
        <Formik initialValues={{ otc: "" }} onSubmit={handleFormSubmit}>
          {({
            isSubmitting,
            getFieldProps,
            handleChange,
            handleBlur,
            handleSubmit,
            values,
          }) => (
            <form onSubmit={handleSubmit}>
              <Field name="otc" validate={validateOtc}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={(form.errors.otc || error) && form.touched.otc}
                  >
                    <FormLabel htmlFor="otc" fontSize="1.5rem">
                      Please enter the one-time-code you were given.
                    </FormLabel>
                    <Input
                      {...field}
                      id="otc"
                      name="otc"
                      placeholder="One-time-code"
                      autocomplete="no"
                      size="lg"
                    />
                    <FormErrorMessage>
                      {error || form.errors.otc}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <Button
                mt={4}
                variantColor="green"
                isLoading={isSubmitting}
                type="submit"
                size="lg"
              >
                Enter App
              </Button>
            </form>
          )}
        </Formik>
      </Box>
      <Stack spacing="1.5rem" width="100%" maxWidth="48rem" py="8rem" px="1rem">
        <Text fontSize="1.5rem">
          If you have been told to enter a three word code, please enter it
          above and press "Enter App".
        </Text>
        <Text color="gray.500">
          Otherwise, please sign up for FISE Lounge at{" "}
          <ChakraLink
            color="blue.600"
            textDecoration="underline"
            href="https://fise.ml"
          >
            fise.ml
          </ChakraLink>{" "}
          and return here when you have created a user and received a
          one-time-code.
        </Text>
      </Stack>
      <Footer />
    </Flex>
  );
}

export default Onboarding;
