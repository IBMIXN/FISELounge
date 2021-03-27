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
  validatePhone,
} from "../../../../utils";

import {
  Text,
  Heading,
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Button,
  Select,
} from "@chakra-ui/core";

import { Nav } from "../../../../components/Nav";
import { Container } from "../../../../components/Container";
import { Main } from "../../../../components/Main";
import { Footer } from "../../../../components/Footer";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Loading from "../../../../components/Loading";
import * as yup from "yup";

const NameForm = ({ router }) => {
  const [formError, setFormError] = useState("");
  const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "image/png",
  ];
  const fileToBase64 = (inputFile) => {
    const tempFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      tempFileReader.onerror = () => {
        tempFileReader.abort();
        reject(new DOMException("Problem parsing background file."));
      };

      tempFileReader.onload = () => {
        resolve(tempFileReader.result);
      };
      tempFileReader.readAsDataURL(inputFile);
    });
  };

  const handleFormSubmit = async (values, actions) => {
    if (values.profileImage != "") {
      values.profileImage = await fileToBase64(values.profileImage);
    }
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
      initialValues={{
        name: "",
        email: "",
        phone: "",
        relation: "",
        profileImage: "",
      }}
      onSubmit={handleFormSubmit}
      validationSchema={yup.object().shape({
        profileImage: yup
          .mixed()
          .notRequired()
          .test(
            "fileType",
            "Unsupported File Format",
            (value) =>
              !value || (value && SUPPORTED_FORMATS.includes(value.type))
          ),
      })}
    >
      {({
        isSubmitting,
        getFieldProps,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        values,
        errors,
        touched,
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
                <InputGroup>
                  <InputLeftElement
                    children={<Icon name="email" color="gray.300" />}
                  />
                  <Input {...field} id="email" placeholder="adam@example.org" />
                </InputGroup>
                <FormErrorMessage>{form.errors.email}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <br />
          <Field name="phone" validate={validatePhone}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.phone && form.touched.phone}>
                <FormLabel htmlFor="phone">Phone number</FormLabel>
                <InputGroup>
                  <InputLeftElement
                    children={<Icon name="phone" color="gray.300" />}
                  />
                  <Input {...field} id="email" placeholder="+44767254891" />
                </InputGroup>
                <FormErrorMessage>{form.errors.phone}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <br />
          <FormControl>
            <FormLabel htmlFor="relation">What relation is this?</FormLabel>

            <Field
              as={Select}
              name="relation"
              validate={validateRelation}
            >
              <option default style={{ color: 'black' }}>Select Relation</option>
              <option value="son" style={{ color: 'black' }} >Their son</option>
              <option value="daughter" style={{ color: 'black' }} >Their daughter</option>
              <option value="grandson" style={{ color: 'black' }}>Their grandson</option>
              <option value="granddaughter" style={{ color: 'black' }}>Their granddaughter</option>
              <option value="father" style={{ color: 'black' }}>Their father</option>
              <option value="mother" style={{ color: 'black' }}>Their mother</option>
              <option value="grandfather" style={{ color: 'black' }}>Their grandfather</option>
              <option value="grandmother" style={{ color: 'black' }}>Their grandmother</option>
              <option value="uncle" style={{ color: 'black' }}>Their uncle</option>
              <option value="aunt" style={{ color: 'black' }}>Their aunt</option>
              <option value="brother" style={{ color: 'black' }}>Their brother</option>
              <option value="sister" style={{ color: 'black' }}>Their sister</option>
              <option value="friend" style={{ color: 'black' }}>Their friend</option>
            </Field>
          </FormControl>
          <br />
          <FormLabel htmlFor="profileImage">Set Profile Picture</FormLabel>
          <br />
          <input
            id="profileImage"
            name="profileImage"
            type="file"
            accept="image/*"
            onChange={(event) => {
              setFieldValue("profileImage", event.currentTarget.files[0]);
            }}
            className="form-control"
          />
          <br />
          {errors.profileImage && touched.profileImage ? (
              <Text color="crimson">{errors.profileImage}</Text>
              ) : null}

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
