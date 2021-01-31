import { useRouter } from "next/router";
import { Formik, Field } from "formik";

import { useUser } from "../../../lib/hooks";
import { validateName } from "../../../utils";

import {
  Text,
  Heading,
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Checkbox,
} from "@chakra-ui/core";

import { Nav } from "../../../components/Nav";
import { Container } from "../../../components/Container";
import { Main } from "../../../components/Main";
import { Footer } from "../../../components/Footer";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Loading from "../../../components/Loading";

const NameForm = ({ router }) => {
  const handleFormSubmit = async (values, actions) => {
    const formBody = Object.entries(values)
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
    await fetch("/api/consumer", options)
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
        throw r;
      })
      .then(({ message, data: consumer }) => {
        router.replace(`/dashboard/consumer/${consumer._id}`);
        actions.setSubmitting(false);
      })
      .catch(async (err) => {
        actions.setSubmitting(false);
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
      initialValues={{ name: "", isCloudEnabled: true }}
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
                <Input {...field} id="name" placeholder="Jane" />
                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <FormControl my="1rem">
            <FormLabel>
              <Checkbox
                mr="1rem"
                size="lg"
                name="isCloudEnabled"
                checked={values.isCloudEnabled}
                isChecked={values.isCloudEnabled}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              Enable IBM Watson Speech-to-text features?
            </FormLabel>
          </FormControl>

          <Button
            mt={4}
            variantColor="blue"
            isLoading={isSubmitting}
            type="submit"
          >
            Save Changes
          </Button>
        </form>
      )}
    </Formik>
  );
};

const NewConsumerPage = () => {
  const router = useRouter();
  const user = useUser({ redirectTo: "/login" });

  return user ? (
    <Container>
      <Nav />
      <Main>
        <Breadcrumbs
          links={[
            ["Dashboard", "/dashboard"],
            ["Create User", "#"],
          ]}
        />
        <Heading>Create a New User</Heading>
        <Text>
          This should be someone you care for who will contact their loved ones
          through FISE Lounge.
        </Text>
        <NameForm router={router} />
      </Main>
      <Footer />
    </Container>
  ) : (
    <Loading />
  );
};

export default NewConsumerPage;
