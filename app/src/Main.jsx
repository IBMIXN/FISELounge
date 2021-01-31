/** @jsx jsx */
/** @jsxFrag React.Fragment */
// eslint-disable-next-line
import React, { useEffect, useState } from "react";
import { jsx, css } from "@emotion/core";
import "aframe";
import "aframe-particle-system-component";
import { Entity, Scene } from "aframe-react";
import { Helmet } from "react-helmet";

import MicRecorder from "mic-recorder-to-mp3";

import JitsiComponent from "./components/JitsiComponent";

import img1 from "./assets/img1.jpg";
import img2 from "./assets/img2.jpg";
import img3 from "./assets/img3.jpg";
import img4 from "./assets/img4.jpg";
import { Redirect } from "react-router-dom";
import {
  Box,
  Icon,
  Image,
  Stack,
  Text,
  useToast,
  Spinner,
} from "@chakra-ui/core";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

function Main() {
  const scenes = [img1, img2, img3, img4];
  const [room, setRoom] = useState("");
  const [call, setCall] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isMicrophoneRecording, setIsMicrophoneRecording] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const toast = useToast();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia(
      { audio: true },
      () => {
        console.log("Permission Granted");
        setIsBlocked(false);
      },
      () => {
        console.log("Permission Denied");
        setIsBlocked(true);
      }
    );
  }, []);

  useEffect(() => {
    const otc = localStorage.getItem("otc");
    async function fetchUserData() {
      await fetch(`${process.env.REACT_APP_SERVER_URL}/api/otc/${otc}`)
        .then((r) => {
          if (r.ok) {
            return r.json();
          }
          throw r;
        })
        .then(({ message, data }) => {
          localStorage.setItem("user", JSON.stringify(data));
          return;
        })
        .catch(async (err) => {
          if (err instanceof Error) {
            throw err;
          }
          if (err.status === 403) {
            localStorage.setItem("user", "");
            localStorage.setItem("otc", "");
            return;
          }
          throw await err.json().then((rJson) => {
            console.error(
              `HTTP ${err.status} ${err.statusText}: ${rJson.message}`
            );
            return;
          });
        });
    }
    fetchUserData();
  }, []);

  const rawUser = localStorage.getItem("user");
  if (!rawUser) return <Redirect to="/onboarding" />;
  const user = JSON.parse(rawUser);

  const handleChangeScene = () => {
    setCurrentSceneIndex((currentSceneIndex + 1) % scenes.length);
  };

  const handleMakeCall = async (contact_id) => {
    await fetch(`${process.env.REACT_APP_SERVER_URL}/api/otc/${user.otc}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `contact_id=${contact_id}`,
    })
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
        throw r;
      })
      .then(({ message, data }) => {
        setRoom(contact_id);
        setCall(!call);
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

  const handleWatsonResponse = ({ action, contact_id, text }) => {
    if (!text) {
      // No text was detected
      toast({
        title: "We couldn't hear you.",
        description:
          "Please try moving somewhere quieter or speaking more loudly.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } else if (!action) {
      // No intent recognized
      toast({
        title: "We couldn't understand you.",
        description: "Sorry, we couldn't understand what you said",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } else if (action === "startCall" && !contact_id) {
      // No contact found
      toast({
        title: "We don't know who that is.",
        description: "Sorry, we don't recognize that person.",
        status: "warning",
        duration: 9000,
        isClosable: true,
      });
    } else {
      // We have a valid request
      switch (action) {
        case "startExercise":
          console.log("Exercise initiated");
          break;
        case "changeBackground":
          handleChangeScene();
          break;
        case "startCall":
          handleMakeCall(contact_id);
          break;
        default:
          toast({
            title: "We couldn't hear you.",
            description:
              "Please try moving somewhere quieter or speaking more loudly.",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
      }
    }
  };

  const handleMicrophoneClick = async (e) => {
    if (isMicrophoneRecording) {
      // End recording
      setIsBlocked(true);

      Mp3Recorder.stop()
        .getMp3()
        .then(async ([buffer, blob]) => {
          const file = new File(buffer, "voice-command.mp3", {
            type: blob.type,
            lastModified: Date.now(),
          });

          var reader = new FileReader();
          reader.onload = async () => {
            const mp3_base64 = btoa(reader.result);
            await fetch(
              `${
                process.env.REACT_APP_SERVER_URL
              }/api/otc/watson/${localStorage.getItem("otc")}`,
              {
                method: "POST",
                body: mp3_base64,
              }
            )
              .then((r) => {
                if (r.ok) {
                  return r.json();
                }
                throw r;
              })
              .then(({ message, data }) => {
                console.log(message, data);
                handleWatsonResponse(data);
                setIsBlocked(false);
              })
              .catch(async (err) => {
                setIsBlocked(false);
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
          reader.readAsBinaryString(file);
          setIsMicrophoneRecording(false);
        })
        .catch((e) => console.log(e));
    } else {
      // Begin recording
      if (isBlocked) {
        console.log("Permission Denied");
      } else {
        Mp3Recorder.start()
          .then(() => {
            setIsMicrophoneRecording(true);
          })
          .catch((e) => console.error(e));
      }
    }
  };

  return (
    <>
      <Helmet></Helmet>

      {user && call && (
        <div
          css={css`
            z-index: 50;
            position: relative;
            top: 10vh;
            left: 10vw;
            height: 80vh;
            width: 80vw;
          `}
        >
          <JitsiComponent
            roomName={room}
            password=""
            displayName={user.name}
            loadingComponent={<p>loading ...</p>}
            onMeetingEnd={() => setCall(false)}
          />
        </div>
      )}
      <div
        css={css`
          ${call && "filter: blur(5px);"}
          z-index: 10;
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
        `}
        onClick={() => call && setCall(false)}
      >
        <Scene vr-mode-ui={{ enabled: false }} style={{ zIndex: -10 }}>
          <Entity particle-system={{ preset: "snow" }} />
          <Entity
            primitive="a-sky"
            rotation="0 -140 0"
            src={scenes[currentSceneIndex]}
          />
        </Scene>
        {scenes.length > 1 && (
          <button onClick={handleChangeScene}>
            <Box
              pos="absolute"
              top="0"
              left="0"
              bg="gray.600"
              pr="1rem"
              pb="1rem"
              pt="0.5rem"
              pl="0.5rem"
              roundedBottomRight="70%"
            >
              <Icon color="white" name="repeat" size="4rem" m="1rem" />
            </Box>
          </button>
        )}
        {user.isCloudEnabled === "true" && (
          <button onClick={handleMicrophoneClick}>
            <Box
              pos="absolute"
              top="0"
              right="0"
              bg="gray.600"
              pr="1rem"
              pb="1rem"
              pt="0.5rem"
              pl="0.5rem"
              roundedBottomLeft="70%"
            >
              {isBlocked ? (
                <Spinner size="4rem" m="1rem" color="white" speed="0.5s" />
              ) : (
                <Icon
                  name="microphone"
                  size="4rem"
                  m="1rem"
                  color={isMicrophoneRecording ? "red.500" : "white"}
                />
              )}
            </Box>
          </button>
        )}
        {user.contacts && (
          <Box
            pos="absolute"
            bottom="20%"
            left={`calc(50vw - ${
              user.contacts.length === 1 ? "5" : user.contacts.length * 6
            }rem)`}
          >
            <Stack isInline spacing="6rem">
              {user.contacts.map((contact, index) => (
                <Box>
                  <button
                    style={{ outline: "none" }}
                    onClick={() => handleMakeCall(contact._id)}
                  >
                    {contact.profileImage ? (
                      <Image
                        rounded="full"
                        size="10rem"
                        src={contact.profileImage}
                        alt="Segun Adebayo"
                        pointerEvents="none"
                      />
                    ) : (
                      <Box w="10rem" h="10rem" rounded="100%" bg={colors[index % colors.length]}>
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
        )}
      </div>
    </>
  );
}

const colors = ["red.300", "blue.300", "green.300"]

export default Main;
