import React from "react";
import { Box, Image, Stack, Text } from "@chakra-ui/core";

function ContactList({ onContactClick }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const colors = ["yellow.50", "pink.300", "yellow.400", "red.500", "pink.800"];

  if (user.contacts) {
    return (
      <Box pos="absolute" bottom="20%" left="20vw" right="20vw">
        <Stack
          isInline
          spacing="6rem"
          display="flex"
          flexDirection="row"
          className="scrollable"
        >
          {user.contacts.map((contact, index) => (
            <Box className="contactBox">
              <button
                style={{ outline: "none" }}
                onClick={() => onContactClick(contact._id)}
                aria-label="contact"
              >
                {contact.profileImage ? (
                  <Box
                    w="10rem"
                    h="10rem"
                    rounded="10%"
                    bg={colors[index % colors.length]}
                    mb="15px"
                  >
                    <Image
                      rounded="10%"
                      size="10rem"
                      src={contact.profileImage}
                      pointerEvents="none"
                      objectFit="cover"
                      alt={contact.name || "profile"}
                    />
                  </Box>
                ) : (
                  <Box
                    w="10rem"
                    h="10rem"
                    rounded="10%"
                    bg={colors[index % colors.length]}
                    mb="15px"
                  >
                    <Text fontSize="6rem" lineHeight="10rem">
                      {contact.name[0].toUpperCase()}
                    </Text>
                  </Box>
                )}
              </button>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }
}

export default ContactList;
