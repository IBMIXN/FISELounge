/** @jsx jsx */
/** @jsxFrag React.Fragment */
// eslint-disable-next-line
import React, { useEffect, useState } from "react";
import { jsx, css } from "@emotion/core";
import "aframe";
import "aframe-particle-system-component";
import { Entity, Scene } from "aframe-react";
import { Helmet } from "react-helmet";
import { playAudio } from "../../utils";
import stringSimilarity from "string-similarity";
import { capitalize, sleep, resampleBufferToWav16kHz } from "../../utils";
import JitsiComponent from "../../components/JitsiComponent";
import PluginComponent from "../../components/PluginComponent";
import img1 from "../../assets/img1.jpeg";
import img2 from "../../assets/img2.jpg";
import img3 from "../../assets/img3.jpg";
import img4 from "../../assets/img4.jpg";
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

var Mp3Recorder;
var WavRecorder;
var audioContext;

function Main() {
  const scenes = [img1, img2, img3, img4];
  const [room, setRoom] = useState("");
  const [call, setCall] = useState(false);
  const [openPlugin, setOpenPlugin] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isMicrophoneRecording, setIsMicrophoneRecording] = useState(false);
  const [isBlocked, setIsBlocked] = useState(true);
  const toast = useToast();
  // if plugin URL not added then icon will not show up in APP
  const pluginExists = process.env.REACT_APP_PLUGIN_URL;

  const initUserMedia = async () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return navigator.mediaDevices
      .getUserMedia(
        { audio: true },
        () => {
          console.log("Permission Granted");
        },
        () => {
          console.log("Permission Denied");
        }
      )
      .then(async (stream) => {
        if (user.isCloudEnabled === "true") {
          const MicRecorder = await import("mic-recorder-to-mp3");
          Mp3Recorder = new MicRecorder({ bitRate: 128 });
        } else {
          const Recorder = (await import("./recorder")).Recorder;
          var source = audioContext.createMediaStreamSource(stream);
          window.savedReferenceWorkaroundFor934512 = source;
          var gainNode = audioContext.createGain();
          gainNode.gain.value = 0.2; //0.15;
          source.connect(gainNode);

          WavRecorder = new Recorder(gainNode, {
            type: "audio/wav",
          });
        }
      })
      .then(() => setIsBlocked(false))
      .catch((err) => {
        setIsBlocked(false);
        console.log("Unable to get user media stream ", err);
      });
  };

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
    initUserMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rawUser = localStorage.getItem("user");
  if (!rawUser) return <Redirect to="/onboarding" />;
  const user = JSON.parse(rawUser);

  // add user-uploaded background scenes
  scenes.unshift(...Object.values(user.ar_scenes));

  const handleChangeScene = () => {
    setCurrentSceneIndex((currentSceneIndex + 1) % scenes.length);
  };

  const handleMakeCall = async (contact_id) => {
    await fetch(`${process.env.REACT_APP_SERVER_URL}/api/otc/${user.otc}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `contact_id=${contact_id}&sms=true`,
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

  const playTtsAudioResponse = async ({ body }) => {
    const reader = body.getReader();
    reader
      .read()
      .then((result) => {
        playAudio(result.value);
      })
      .catch(async (err) => {
        if (err instanceof Error) {
          throw err;
        }
        throw await err.json().then((rJson) => {
          console.error(
            `Audio Response - ${err.status} ${err.statusText}: ${rJson.message}`
          );
          return;
        });
      });
  };

  const handleTextToSpeechResponse = async (text) => {
    const response = await fetch(
      `${
        process.env.REACT_APP_SERVER_URL
      }/api/otc/watson/text-to-speech/${localStorage.getItem("otc")}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `text=${text}`,
      }
    ).then((r) => {
      if (r.ok) {
        return r;
      }
      throw r;
    });
    return response;
  };

  const handleAskbobResponse = async ({ query, messages, error }) => {
    if (error) {
      toast({
        title: "Askbob couldn't understand you.",
        description:
          "Please try moving somewhere quieter or speaking more loudly.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.error(`Askbob Error - ${error}`);
      return;
    }

    if (!messages || messages.length === 0) {
      toast({
        title: "Askbob couldn't understand you.",
        description:
          "Please try moving somewhere quieter or try rephrasing your request.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    console.log("Askbob - ", JSON.stringify({ query, messages, error }));

    messages = messages || [];
    const askBobTextObject = messages.find((msg) => msg.text);

    const askBobCustomObject = messages.find((msg) => msg.custom);
    const intent = askBobCustomObject ? askBobCustomObject.custom.type : null;

    switch (intent) {
      case "call_user":
        const contactToCall = askBobCustomObject.custom
          ? askBobCustomObject.custom.callee.toLowerCase()
          : null;

        const contacts = JSON.parse(localStorage.getItem("user")).contacts;

        const contactNames = contacts.map((c) => c.name);
        const { bestMatchIndex } = stringSimilarity.findBestMatch(
          contactToCall,
          contactNames
        );
        if (bestMatchIndex === -1 || bestMatchIndex === null) {
          toast({
            title: `"${query}"`,
            description: `Sorry, ${capitalize(
              contactToCall
            )} is not in your contacts.`,
            status: "warning",
            duration: 9000,
            isClosable: true,
          });
          break;
        }
        const contact_id = contacts[bestMatchIndex]._id;
        handleMakeCall(contact_id);
        break;

      case "change_background":
        handleChangeScene();
        break;

      default:
        if (askBobTextObject && askBobTextObject.text) {
          const ttsResponse = await handleTextToSpeechResponse(
            askBobTextObject.text
          );
          await playTtsAudioResponse(ttsResponse);
        }
        break;
    }
  };

  const handleAskbobMicrophoneClick = async (e) => {
    if (!isMicrophoneRecording) {
      if (isBlocked) {
        console.log("Permission Denied");
      } else {
        await initUserMedia();
        WavRecorder.record();
        setIsMicrophoneRecording(true);
      }
    } else {
      setIsBlocked(true);
      await sleep(400);
      setIsMicrophoneRecording(false);
      await sleep(400);
      WavRecorder.stop();
      try {
        WavRecorder.getBuffer(async (buffers) => {
          if (!buffers || buffers.length === 0 || buffers[0].length === 0) {
            console.log("Recorder.js buffer empty");
            WavRecorder.clear();
            setIsBlocked(false);
            toast({
              title: "We couldn't hear you.",
              description:
                "Microphone recorder not working properly, try again.",
              status: "error",
              duration: 9000,
              isClosable: true,
            });
            return;
          }

          const leftChannelBuffer = buffers[0];
          const wavFile = resampleBufferToWav16kHz(
            audioContext,
            leftChannelBuffer
          );

          var formData = new FormData();
          formData.append("speech", wavFile);
          formData.append(
            "sender",
            JSON.parse(localStorage.getItem("user")).name
          );

          await fetch(`${process.env.REACT_APP_ASKBOB_URL}/voicequery`, {
            method: "POST",
            body: formData,
          })
            .then((r) => {
              if (r.ok) {
                return r.json();
              }
              toast({
                title: "Something went wrong",
                description: "Askbob couldn't respond to your request.",
                status: "error",
                duration: 9000,
                isClosable: true,
              });
              throw r;
            })
            .then((rJson) => {
              handleAskbobResponse(rJson);
              WavRecorder.clear();
              setIsBlocked(false);
            })
            .catch(async (err) => {
              WavRecorder.clear();
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
        });
      } catch (err) {
        WavRecorder.clear();
        setIsMicrophoneRecording(false);
        setIsBlocked(false);
        console.log(err);
      }
    }
  };

  const handleWatsonResponse = async ({ action, contact_id, text, reply }) => {
    if (!text) {
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
      switch (action) {
        case "respondAudioOnly":
          const response = await handleTextToSpeechResponse(reply);
          await playTtsAudioResponse(response);
          break;
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

  const handleWatsonMicrophoneClick = async (e) => {
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
      {openPlugin && (
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
          <PluginComponent />
        </div>
      )}

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
          ${(call || openPlugin) && "filter: blur(5px);"}
          z-index: 10;
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
        `}
        onClick={() =>
          (openPlugin || call) && (setOpenPlugin(false) || setCall(false))
        }
      >
        <Scene vr-mode-ui={{ enabled: false }} style={{ zIndex: -10 }}>
          {user.isSnowEnabled === "true" && (
            <Entity particle-system={{ preset: "snow" }} />
          )}
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
              bg="rgba(12, 12, 12, 0.45)"
              pr="1rem"
              pb="1rem"
              pt="0.5rem"
              pl="0.5rem"
              roundedBottomRight="70%"
            >
              <Icon
                color="white"
                name="repeat"
                size="4rem"
                m="1rem"
                opacity="100%"
              />
            </Box>
          </button>
        )}
        {scenes.length > 1 && (
          <button onClick={handleChangeScene}>
            <Box
              pos="absolute"
              bottom="0"
              left="0"
              bg="rgba(12, 12, 12, 0.45)"
              pr="1rem"
              pb="1rem"
              pt="0.5rem"
              pl="0.5rem"
              roundedTopRight="70%"
            >
              <Icon
                color="red.500"
                name="warning-2"
                size="4rem"
                m="1rem"
                opacity="100%"
              />
            </Box>
          </button>
        )}
        {pluginExists && (
          <button onClick={setOpenPlugin}>
            <Box
              pos="absolute"
              bottom="0"
              right="0"
              bg="rgba(12, 12, 12, 0.45)"
              pr="1rem"
              pb="1rem"
              pt="0.5rem"
              pl="0.5rem"
              roundedTopLeft="70%"
            >
              <Icon
                color="white"
                name="plus-square"
                size="4rem"
                m="1rem"
                opacity="100%"
              />
            </Box>
          </button>
        )}

        <button
          onClick={
            user.isCloudEnabled === "true"
              ? handleWatsonMicrophoneClick
              : handleAskbobMicrophoneClick
          }
        >
          <Box
            pos="absolute"
            top="0"
            right="0"
            bg="rgba(12, 12, 12, 0.45)"
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

        {user.contacts && (
          <Box
            pos="absolute"
            bottom="20%"
            left="20vw"
            right="20vw"
            overflow="auto"
          >
            <Stack isInline spacing="6rem" display="flex" flexDirection="row">
              {user.contacts.map((contact, index) => (
                <Box
                  // Flex items will stay centered, even if they overflow the flex container
                  // marginLeft & marginRight ensures that first and last box-items have
                  // margins that keep them accessible
                  marginLeft={index === 0 ? "auto" : "0"}
                  marginRight={
                    index === user.contacts.length - 1 ? "auto" : "0"
                  }
                >
                  <button
                    style={{ outline: "none" }}
                    onClick={() => handleMakeCall(contact._id)}
                  >
                    {contact.profileImage ? (
                      <Box
                        w="10rem"
                        h="10rem"
                        rounded="10%"
                        bg={colors[index % colors.length]}
                      >
                        <Image
                          rounded="10%"
                          size="10rem"
                          src={contact.profileImage}
                          pointerEvents="none"
                        />
                      </Box>
                    ) : (
                      <Box
                        w="10rem"
                        h="10rem"
                        rounded="100%"
                        bg={colors[index % colors.length]}
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
        )}
      </div>
    </>
  );
}

const colors = ["yellow.50", "pink.300", "yellow.400", "red.500", "pink.800"];

export default Main;
