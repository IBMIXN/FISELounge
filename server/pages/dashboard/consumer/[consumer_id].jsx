import { useRouter } from "next/router";
import useSWR from "swr";
import { Formik, Field } from "formik";

import { useUser } from "../../../lib/hooks";
import { fetcher, capitalize, validateName } from "../../../utils";
import relations from "../../../utils/relations";
import * as yup from 'yup';

import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Link as ChakraLink,
  Text,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/core";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/Table";

import { Nav } from "../../../components/Nav";
import { Container } from "../../../components/Container";
import { Main } from "../../../components/Main";
import { Footer } from "../../../components/Footer";
import Loading from "../../../components/Loading";
import Checkbox from "../../../components/Checkbox";
import Breadcrumbs from "../../../components/Breadcrumbs";

const DeleteUserModal = ({ onClick, consumer_name }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        leftIcon="delete"
        variant="outline"
        variantColor="red"
        onClick={onOpen}
      >
        Delete {consumer_name} from your profile
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete This User?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to remove {consumer_name} from your profile?
            <Text color="red.300">
              All their contacts and details will be gone forever.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variantColor="blue" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button variantColor="red" onClick={onClick}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const AddBackgroundForm = ({ consumer_id, background_scenes, router
}) => {

  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'];
  const fileToBase64 = (inp_file) => {
    const tempFileReader = new FileReader()

    return new Promise((resolve, reject) => {
      tempFileReader.onerror = () => {
        tempFileReader.abort();
        reject(new DOMException("Problem parsing background file."));
      };

      tempFileReader.onload = () => {
        resolve(tempFileReader.result);
      };
      tempFileReader.readAsDataURL(inp_file);
    });
  };

  const handleBackgroundSubmit = async (values, actions) => {
    console.log("submitting...");
    const imageData = await fileToBase64(values.file);
    const formBody = encodeURIComponent("img_b64") + "=" + encodeURIComponent(imageData)
      + "&" + encodeURIComponent("img_name") + "=" + encodeURIComponent(values.img_Name);

    const options = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    };
    await fetch(`/api/consumer/${consumer_id}`, options)
      .then((r) => {
        if (r.ok) {
          router.replace(`/dashboard`);
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

  }

  return (
    <Formik
      initialValues={{ file: null, img_Name: "" }}
      onSubmit={handleBackgroundSubmit}
      validationSchema={yup.object().shape({
        file: yup.mixed().required()
          .test('fileType', "Unsupported File Format", value => SUPPORTED_FORMATS.includes(value.type)),
        img_Name: yup.string().required(),
      })}>

      {({ values, handleSubmit, setFieldValue, isSubmitting }) => {
        return (
          <form onSubmit={handleSubmit}>
            <div className="form-group">

              <Field name="img_Name" validate={validateName}>
                {({ field, form }) => (
                  <FormControl isInvalid={form.errors.name && form.touched.name}>
                    <FormLabel htmlFor="img_Name">Image Title</FormLabel>
                    <Input {...field} id="img_Name" placeholder="Image 1" />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>

              <br></br>
              <label htmlFor="file">Upload Image</label>
              <br></br>
              <input id="file" name="file" type="file" onChange={(event) => {
                setFieldValue("file", event.currentTarget.files[0]);
              }} className="form-control" />
            </div>

            <Button
              type="submit"
              disabled={values.img_Name === "" || values.file === null}
              className="btn btn-primary"
              mt={4}
              isLoading={isSubmitting}
              variantColor="blue">
              Save background
              </Button>

          </form>
        );
      }}
    </Formik>)
}

const MakeChangesForm = ({
  currentName,
  isCloudEnabled,
  consumer_id,
  router,
}) => {
  const handleFormSubmit = async (values, actions) => {
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
    await fetch(`/api/consumer/${consumer_id}`, options)
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
        throw r;
      })
      .then(({ message, data }) => {
        router.replace(`/dashboard`);
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
        name: capitalize(currentName),
        isCloudEnabled: isCloudEnabled === "true",
      }}
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
                <Input {...field} id="name" placeholder="name" />
                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
              </FormControl>
            )}
          </Field>

          <Field
            name="isCloudEnabled"
            type="checkbox"
            checked={values.isCloudEnabled === true}
            label="Enable Cloud Features?"
            component={Checkbox}
          />

          <Button
            mt={4}
            variantColor="blue"
            isLoading={isSubmitting}
            type="submit"
            leftIcon="check"
          >
            Save Changes
          </Button>
        </form>
      )}
    </Formik>
  );
};

const BackgroundTable = ({
  ar_scenes,
}) => {
  const bgArray = Object.keys(ar_scenes);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Background Name</TableHeader>
          <TableHeader />
        </TableRow>
      </TableHead>
      <TableBody>
        {bgArray.map((imageName, i) => (
          <TableRow
            bg={i % 2 === 0 ? "white" : "gray.50"}
            key={i}
          >
            <TableCell>
              <Text
                fontSize="sm"
                color="gray.600"
                as="a"
              >
                {imageName}
              </Text>
            </TableCell>
            <TableCell textAlign="right">
              <ChakraLink
                fontSize="sm"
                fontWeight="medium"
                color="blue.600"
              >
                Delete
                </ChakraLink>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const ConsumerPage = () => {
  const router = useRouter();
  const user = useUser({ redirectTo: "/login" });
  const { consumer_id } = router.query;
  const { data: consumer } = useSWR(
    consumer_id && `/api/consumer/${consumer_id}`,
    fetcher
  );

  const handleDeleteConsumer = async () => {
    await fetch(consumer_id && `/api/consumer/${consumer_id}`, {
      method: "DELETE",
    })
      .then((r) => {
        if (r.ok) {
          router.replace(`/dashboard`);
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

  return user && consumer ? (
    <Container>
      <Nav />
      <Main>
        <Breadcrumbs
          links={[
            ["Dashboard", "/dashboard"],
            [`${capitalize(consumer.name)}'s User Profile`, "#"],
          ]}
        />
        <Heading>Editing {capitalize(consumer.name)}'s Profile</Heading>
        <Text>
          To set up FISE Lounge on {capitalize(consumer.name)}'s device, go to
          {` `}
          <ChakraLink href="localhost:3001" textDecoration="underline">
            [FISE APP URL]
          </ChakraLink>
          {` `} and enter in the code:
          <br />
          <Badge>{consumer.otc}</Badge>.
          <br />
          (Ensure {capitalize(consumer.name)}'s account is set up the way they
          like. You'll have to log them out to apply any changes.)
        </Text>
        <Heading size="lg">{capitalize(consumer.name)}'s Contacts</Heading>
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Relation</TableHeader>
                <TableHeader />
              </TableRow>
            </TableHead>
            <TableBody>
              {consumer.contacts &&
                consumer.contacts.map((contact, index) => (
                  <TableRow
                    bg={index % 2 === 0 ? "white" : "gray.50"}
                    key={index}
                  >
                    <TableCell>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        as="a"
                        href={`/dashboard/contact/${contact._id}`}
                      >
                        {capitalize(contact.name)}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text fontSize="sm" color="gray.500">
                        {contact.email}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text fontSize="sm" color="gray.500">
                        {capitalize(relations[contact.relation])}
                      </Text>
                    </TableCell>
                    <TableCell textAlign="right">
                      <ChakraLink
                        href={`/dashboard/contact/${contact._id}`}
                        fontSize="sm"
                        fontWeight="medium"
                        color="blue.600"
                      >
                        Edit
                      </ChakraLink>
                    </TableCell>
                  </TableRow>
                ))}
              <TableRow bg="white">
                <TableCell>
                  <Button
                    as="a"
                    href={`/dashboard/contact/new/${consumer_id}`}
                    leftIcon="add"
                    color="gray.600"
                  >
                    Add a new contact
                  </Button>
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </Box>
        <Heading size="lg">{capitalize(consumer.name)}'s Backgrounds</Heading>
        <Box>
          <BackgroundTable
            ar_scenes={consumer.ar_scenes} />
        </Box>
        <AddBackgroundForm
          router={router}
          consumer_id={consumer_id}
          background_scenes={consumer.ar_scenes} />
        <br></br>
        <Heading size="lg">Edit {capitalize(consumer.name)}'s Info</Heading>
        <MakeChangesForm
          router={router}
          consumer_id={consumer_id}
          currentName={capitalize(consumer.name)}
          isCloudEnabled={consumer.isCloudEnabled}
        />
        <Heading mt="3rem" size="lg" color="red.200">
          Danger Zone
        </Heading>
        <Box>
          <DeleteUserModal
            onClick={handleDeleteConsumer}
            consumer_name={capitalize(consumer.name)}
          />
        </Box>
      </Main>
      <Footer />
    </Container>
  ) : (
      <Loading />
    );
};

export default ConsumerPage;