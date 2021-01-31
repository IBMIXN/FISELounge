import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Formik, Field } from "formik";

import { useUser } from "../../../../lib/hooks";
import {
  fetcher,
  capitalize,
  validateName,
  validateEmail,
  validateRelation,
} from "../../../../utils";

import {
  Text,
  Heading,
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Select,
} from "@chakra-ui/core";

import { Nav } from "../../../../components/Nav";
import { Container } from "../../../../components/Container";
import { Main } from "../../../../components/Main";
import { Footer } from "../../../../components/Footer";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Loading from "../../../../components/Loading";

const NameForm = ({ router }) => {
  const [formError, setFormError] = useState("");

  const handleFormSubmit = async (values, actions) => {
    const valuesToSend = { ...values, consumer_id: router.query.consumer_id };
    const formBody = Object.entries(valuesToSend)
      .map(
        ([key, value]) =>
          encodeURIComponent(key) + "=" + encodeURIComponent(value)
      )
      .join("&");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    };
    await fetch("/api/contact", options)
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
        throw r;
      })
      .then(({ message, data: contact }) => {
        setTimeout(() => {
          router.replace(`/dashboard/consumer/${router.query.consumer_id}`);
          actions.setSubmitting(false);
        }, 1500);
      })
      .catch(async (err) => {
        actions.setSubmitting(false);
        if (err.status === 400) {
          return await err.json().then((rJson) => {
            setFormError(rJson.message);
            return;
          });
        }
        if (err instanceof Error) {
          throw err;
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
    <Formik
      initialValues={{ name: "", email: "", relation: "" }}
      onSubmit={handleFormSubmit}
    >
      {({
        isSubmitting,
        getFieldProps,
        handleChange,
        handleBlur,
        handleSubmit,
        values,
      }) => (
        <form onSubmit={handleSubmit}>
          <Field name="name" validate={validateName}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.name && form.touched.name}>
                <FormLabel htmlFor="name">First name</FormLabel>
                <Input {...field} id="name" placeholder="Adam" />
                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <br />
          <Field name="email" validate={validateEmail}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.email && form.touched.email}>
                <FormLabel htmlFor="email">Email address</FormLabel>
                <Input {...field} id="email" placeholder="adam@example.org" />
                <FormErrorMessage>{form.errors.email}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <br />
          <FormControl>
            <FormLabel htmlFor="relation">What relation is this?</FormLabel>

            <Field
              as={Select}
              name="relation"
              placeholder="Select Relation"
              validate={validateRelation}
            >
              <option value="son">Their son</option>
              <option value="daughter">Their daughter</option>
              <option value="grandson">Their grandson</option>
              <option value="granddaughter">Their granddaughter</option>
              <option value="father">Their father</option>
              <option value="mother">Their mother</option>
              <option value="grandfather">Their grandfather</option>
              <option value="grandmother">Their grandmother</option>
              <option value="uncle">Their uncle</option>
              <option value="aunt">Their aunt</option>
              <option value="brother">Their brother</option>
              <option value="sister">Their sister</option>
              <option value="friend">Their friend</option>
            </Field>
          </FormControl>

          {formError && <Text color="crimson">{formError}</Text>}
          <Button
            mt={4}
            variantColor="blue"
            isLoading={isSubmitting}
            type="submit"
          >
            Create Contact
          </Button>
        </form>
      )}
    </Formik>
  );
};

const NewContactPage = () => {
  const router = useRouter();
  const user = useUser({ redirectTo: "/login" });

  const { consumer_id } = router.query;

  const { data: consumer } = useSWR(
    consumer_id && `/api/consumer/${consumer_id}`,
    fetcher
  );

  return user && consumer ? (
    <Container>
      <Nav />
      <Main>
        <Breadcrumbs
          links={[
            ["Dashboard", "/dashboard"],
            [
              `${capitalize(consumer.name)}'s User Profile`,
              `/dashboard/consumer/${consumer_id}`,
            ],
            ["Add a Contact", "#"],
          ]}
        />
        <Heading>Create a New Contact for {capitalize(consumer.name)}</Heading>
        <Text>
          {capitalize(consumer.name)} will be able to call this person in the
          FISE Lounge app <br /> (If you haven't already, you will need to add
          yourself as a contact too).
        </Text>
        <NameForm router={router} />
      </Main>
      <Footer />
    </Container>
  ) : (
    <Loading />
  );
};

export default NewContactPage;
