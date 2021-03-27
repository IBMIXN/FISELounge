import { useRouter } from "next/router";
import { mutate } from "swr";

import { useUser } from "../../lib/hooks";
import { capitalize } from "../../utils";

import {
  Box,
  Button,
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
  Icon,
  Tooltip,
  Stack,
} from "@chakra-ui/core";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/Table";

import { Nav } from "../../components/Nav";
import { Container } from "../../components/Container";
import { Main } from "../../components/Main";
import { Footer } from "../../components/Footer";
import Loading from "../../components/Loading";
import Breadcrumbs from "../../components/Breadcrumbs";

const DeleteUserModal = ({ onClick }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        leftIcon="delete"
        variant="outline"
        variantColor="red"
        onClick={onOpen}
      >
        Delete Your Account
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Your FISE Lounge Account?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete your entire FISE Lounge
            adminisitration account?
            <Text color="red.300">
              All of your users, their contacts and all their details will be
              deleted forever!
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variantColor="blue" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button variantColor="red" onClick={onClick}>
              Yes, I want to delete my account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const DashboardPage = () => {
  const user = useUser({ redirectTo: "/login" });
  const router = useRouter();

  const handleDeleteUser = async () => {
    await fetch(`/api/user/delete`, {
      method: "DELETE",
    })
      .then((r) => {
        if (r.ok) {
          router.replace("/api/logout");
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

  const handleRefreshOtc = async (consumer_id) => {
    await fetch(`/api/consumer/${consumer_id}`, {
      method: "POST",
    })
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
        throw r;
      })
      .then(({ message, data }) => {
        mutate("/api/user");
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

  return user ? (
    <Container>
      <Nav />
      <Main>
        <Breadcrumbs links={[["Dashboard", "/dashboard"]]} />
        <Heading>Welcome to the Dashboard, {capitalize(user.name)}</Heading>
        <Text>
          To set up your loved one with FISE Lounge, first Add a new user to set
          up their details and contacts, then go to the {` `}
          <ChakraLink href={process.env.NEXT_PUBLIC_FISE_WEB_APP_URL} textDecoration="underline">
            app
          </ChakraLink>
          {` `} on their device and enter in their One-Time-Code given below. To log out a user you need to refresh this code.
        </Text>

        <Box mt="3rem">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Contacts</TableHeader>
                <TableHeader>One-Time-Code</TableHeader>
                <TableHeader />
              </TableRow>
            </TableHead>
            <TableBody>
              {user.consumers &&
                user.consumers.map((consumer, index) => (
                  <TableRow
                    bg={index % 2 === 0 ? "white" : "gray.50"}
                    key={index}
                  >
                    <TableCell>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        as="a"
                        href={`/dashboard/consumer/${consumer._id}`}
                      >
                        {capitalize(consumer.name)}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text fontSize="sm" color="gray.500">
                        {consumer.contacts.length}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Stack isInline>
                        <Text fontSize="sm" color="gray.500">
                          {consumer.otc}
                        </Text>
                        <Tooltip label="Refresh OTC (Will log user out)">
                          <Button
                            aria-label="Refresh otc"
                            m="0"
                            p="0"
                            size="1rem"
                            label="Refresh otc"
                            onClick={() => handleRefreshOtc(consumer._id)}
                          >
                            <Icon color="gray.500" name="repeat" size="1rem" />
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell textAlign="right">
                      <ChakraLink
                        href={`/dashboard/consumer/${consumer._id}`}
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
                    href="/dashboard/consumer/new"
                    leftIcon="add"
                    color="gray.600"
                  >
                    Add a new user
                  </Button>
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </Box>
        <Heading mt="3rem" size="lg" color="red.200">
          Danger Zone
        </Heading>
        <Box>
          <Button leftIcon="exit" variantColor="red" as="a" href="/api/logout">
            Sign Out ({user.email})
          </Button>
        </Box>
        <Box>
          <DeleteUserModal onClick={handleDeleteUser} />
        </Box>
      </Main>
      <Footer />
    </Container>
  ) : (
    <Loading />
  );
};

export default DashboardPage;
