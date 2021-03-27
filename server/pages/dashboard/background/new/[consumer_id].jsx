import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Formik, Field } from "formik";

import { useUser } from "../../../../lib/hooks";
import {
  fetcher,
  capitalize,
  validateImageName,
  validateImageURL,
} from "../../../../utils";

import {
  Text,
  Heading,
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Checkbox,
  FormHelperText,
  Switch,
} from "@chakra-ui/core";

import { Nav } from "../../../../components/Nav";
import { Container } from "../../../../components/Container";
import { Main } from "../../../../components/Main";
import { Footer } from "../../../../components/Footer";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Loading from "../../../../components/Loading";
import * as yup from "yup";

const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/gif", "image/png"];

const NewBackgroundForm = ({ consumer_id, router }) => {
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
    if (values.imageFile) {
      values.imageFile = await fileToBase64(values.imageFile);
      delete values.imageURL;
    } else {
      values.imageFile = values.imageURL;
      delete values.imageURL;
    }

    values.consumer_id = router.query.consumer_id;
    if (values.imageURL) {
      console.log(values.imageURL);
    }

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
    await fetch(`/api/background`, options)
      .then((r) => {
        if (r.ok) {
          router.replace(`/dashboard/consumer/${consumer_id}`);
          actions.setSubmitting(false);
          return r.json();
        }
        throw r;
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
        imageFile: null,
        imageName: "",
        imageURL: "",
        isVR: "false",
        isURL: "true",
      }}
      onSubmit={handleFormSubmit}
      validationSchema={yup.object().shape({
        imageFile: yup
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
        handleSubmit,
        handleChange,
        setFieldValue,
        values,
        errors,
        touched,
      }) => (
        <form onSubmit={handleSubmit}>
          <Field name="imageName" validate={validateImageName}>
            {({ field, form }) => (
              <FormControl
                isInvalid={form.errors.imageName && form.touched.imageName}
              >
                <FormLabel htmlFor="imageName">Image Title</FormLabel>
                <Input
                  {...field}
                  id="imageName"
                  placeholder="Holiday family photo"
                />
                <FormErrorMessage>{form.errors.imageName}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <FormControl my="1rem">
            <FormLabel>
              <Checkbox
                mr="1rem"
                size="lg"
                name="isVR"
                isChecked={values.isVR === true}
                onChange={handleChange}
              />
              Enable VR-360-Viewing?
            </FormLabel>
          </FormControl>

          <FormControl>
            <FormLabel>
              <Switch
                mr="1rem"
                name="isURL"
                checked={values.isURL}
                isChecked={values.isURL}
                onChange={handleChange}
              />
              Do you have a URL for the image?
            </FormLabel>
          </FormControl>

          <br />

          {values.isURL && (
            <Field name="imageURL" validate={validateImageURL}>
              {({ field, form }) => (
                <FormControl
                  isInvalid={form.errors.imageURL && form.touched.imageURL}
                >
                  <FormLabel htmlFor="imageURL">Image URL</FormLabel>
                  <Input
                    {...field}
                    type="url"
                    id="imageURL"
                    placeholder="http://website.com/images/bridge.png"
                    aria-describedby="url-info-text"
                    onClick={() => setFieldValue("imageFile", null)}
                  />
                  <FormHelperText id="url-info-text">
                    Make sure that the image is public (i.e. no login required)
                  </FormHelperText>
                  <FormErrorMessage>{form.errors.imageURL}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
          )}

          {!values.isURL && (
            <FormControl>
              <FormLabel>Upload Image</FormLabel>
              <br />
              <input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setFieldValue("imageFile", event.currentTarget.files[0]); // add must
                  setFieldValue("imageURL", "");
                }}
                className="form-control"
                aria-describedby="upload-info-text"
              />
              <FormHelperText id="upload-info-text">
                {/* Info text if needed */}
              </FormHelperText>
              {errors.imageFile && touched.imageFile ? (
              <Text color="crimson">{errors.imageFile}</Text>
              ) : null}
            </FormControl>
          )}

          <Button
            type="submit"
            disabled={
              values.imageName === "" ||
              (values.imageFile === null && values.imageURL === "")
            }
            className="btn btn-primary"
            mt={4}
            isLoading={isSubmitting}
            variantColor="blue"
          >
            Save background
          </Button>
        </form>
      )}
    </Formik>
  );
};

const NewBackgroundPage = () => {
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
            ["Add Background", "#"],
          ]}
        />
        <Heading>
          Upload a New Background for {capitalize(consumer.name)}
        </Heading>
        <Text>
          {capitalize(consumer.name)} will be able to see this image as a
          background in the lobby. The image can be either static{" "}
          <i>(normal image)</i> or VR 360° <i>(spherical image or panorama)</i>.
          If VR 360 viewing is selected, the background will be interactive.
          <br />
          <br />
          Note: In the lobby there is always a set of default backgrounds which
          cannot be removed.
        </Text>
        <NewBackgroundForm router={router} consumer_id={consumer_id} />
      </Main>
      <Footer />
    </Container>
  ) : (
    <Loading />
  );
};

export default NewBackgroundPage;
