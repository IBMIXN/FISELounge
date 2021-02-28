import { useRouter } from "next/router";
import useSWR from "swr";
import { Formik, Field } from "formik";

import { useUser } from "../../../lib/hooks";
import {
  fetcher,
  capitalize,
  validateName,
  validateEmail,
  validateRelation,
  validatePhone,
} from "../../../utils";
import relations from "../../../utils/relations";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  Heading,
} from "@chakra-ui/core";

import { Nav } from "../../../components/Nav";
import { Container } from "../../../components/Container";
import { Main } from "../../../components/Main";
import { Footer } from "../../../components/Footer";
import Breadcrumbs from "../../../components/Breadcrumbs";
import Loading from "../../../components/Loading";
import Checkbox from "../../../components/Checkbox";
import * as yup from 'yup';

const MakeChangesForm = ({
  router,
  contact_id,
  currentName,
  currentEmail,
  currentRelation,
  currentPhone,
  currentProfileImage,
}) => {
  var hasSelectedDeleteImage = false; // CHANGED NAME FROM deleteImg 
  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'];
  const fileToBase64 = (inputFile) => {
    const fileReader = new FileReader() 

    return new Promise((resolve, reject) => {   
      fileReader.onerror = () => {
        fileReader.abort();
        reject(new DOMException("Problem parsing background file."));
      };

      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.readAsDataURL(inputFile);
    });
  };

  const handleFormSubmit = async (values, actions) => {
    if (values.profileImage) {
      values.profileImage = await fileToBase64(values.profileImage);
    } else if (values.hasSelectedDeleteImage) {
      //delete image if selected 
      values.profileImage = ""; 
    } else {
      values.profileImage = currentProfileImage;
    }
    // don't include value in formbody
    delete values.hasSelectedDeleteImage;

    const formBody = Object.entries(values)
      .map(
        ([key, value]) =>
          encodeURIComponent(key) + "=" + encodeURIComponent(value)
      )
      .join("&");
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    };
    await fetch(`/api/contact/${contact_id}`, options)
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
        throw r;
      })
      .then(({ message, data }) => {
        router.replace(`/dashboard/consumer/${data.consumer_id}`);
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
      initialValues={{
        name: currentName,
        email: currentEmail,
        phone: currentPhone,
        relation: currentRelation,
        profileImage: null,
        hasSelectedDeleteImage: hasSelectedDeleteImage === "false",
      }}
      onSubmit={handleFormSubmit}
      validationSchema={yup.object().shape({
        profileImage: yup.mixed()
          .nullable()
          .notRequired()
          .test('fileType', "Unsupported File Format", value => !value || (value && SUPPORTED_FORMATS.includes(value.type))),
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
          <Field name="phone" validate={validatePhone}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.phone && form.touched.phone}>
                <FormLabel htmlFor="phone">Phone number</FormLabel>
                <Input {...field} id="email" placeholder="+44767254891" />
                <FormErrorMessage>{form.errors.phone}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <br />
          <Field name="relation" validate={validateRelation}>
            {({ field, form }) => (
              <FormControl
                isInvalid={form.errors.relation && form.touched.relation}
              >
                <FormLabel htmlFor="relation">
                  What relation is this person to ?
                </FormLabel>
                <Select {...field} id="relation" placeholder="Select Relation">
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
                </Select>
                <FormErrorMessage>{form.errors.relation}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          
          <br />
          <FormLabel>Current Profile Picture</FormLabel>
          <img src={currentProfileImage} width="100px" height="100x" />
          <Field
            name="hasSelectedDeleteImage"
            type="checkbox"
            checked={values.hasSelectedDeleteImage === true}
            label="Remove"
            component={Checkbox}
          />
          <FormLabel htmlFor="profileImage">Change Profile Picture</FormLabel>
          <br />
          <input id="profileImage" name="profileImage" type="file" accept="image/*" onChange={(event) => {
            setFieldValue("profileImage", event.currentTarget.files[0]);
          }} className="form-control" />
          <br />

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

const ContactPage = () => {
  const router = useRouter();
  const user = useUser({ redirectTo: "/login" });

  const { contact_id } = router.query;
  const { data: contact, error } = useSWR(
    contact_id && `/api/contact/${contact_id}`,
    fetcher
  );

  if (error) {
    router.replace("/dashboard");
  }

  const handleDeleteContact = async () => {
    await fetch(contact_id && `/api/contact/${contact_id}`, {
      method: "DELETE",
    })
      .then((r) => {
        if (r.ok) {
          if (contact)
            router.replace(`/dashboard/consumer/${contact.consumer_id}`);
          else router.replace(`/dashboard`);
          return;
        }
        throw r;
      })
      .catch(async (err) => {
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

  return user && contact ? (
    <Container>
      <Nav />
      <Main>
        <Breadcrumbs
          links={[
            ["Dashboard", "/dashboard"],
            [
              `${capitalize(contact.consumer_name)}'s User Profile`,
              `/dashboard/consumer/${contact.consumer_id}`,
            ],
            [`${capitalize(contact.name)}'s Contact Details`, "#"],
          ]}
        />
        <Heading>Editing {capitalize(contact.name)}'s Contact Details</Heading>
        <MakeChangesForm
          router={router}
          currentName={capitalize(contact.name)}
          currentEmail={contact.email}
          currentPhone={contact.phone}
          currentRelation={relations[contact.relation]}
          contact_id={contact_id}
          currentProfileImage={contact.profileImage}
        />
        <Heading mt="3rem" size="lg" color="red.200">
          Danger Zone
        </Heading>
        <Box>
          <Button
            leftIcon="delete"
            variantColor="red"
            onClick={handleDeleteContact}
          >
            Delete {capitalize(contact.name)} from {capitalize(contact.consumer_name)}'s Profile
          </Button>
        </Box>
      </Main>
      <Footer />
    </Container>
  ) : (
      <Loading />
    );
};

export default ContactPage;
