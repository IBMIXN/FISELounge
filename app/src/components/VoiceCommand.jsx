import React, { useEffect, useState, useContext } from "react";
import { RecorderContext } from "../pages/Main";
import { RecorderActions } from "../reducers";
import stringSimilarity from "string-similarity";
import { capitalize, sleep, resampleBufferToWav16kHz } from "../utils";
import { Spinner, Icon, useTheme } from "@chakra-ui/core";
import CommandButton from "./CommandButton";

var Mp3Recorder;
var WavRecorder;
var audioContext;

function VoiceCommand({ isCloudEnabled, commands, onError }) {
  const [isLoading, setIsLoading] = useState(true);
  const [recorderState, recorderDispatch] = useContext(RecorderContext);
  const { changeScene, makeCall, customResponse } = commands;

  const theme = useTheme();

  const setIsRecording = (bool) => {
    bool
      ? recorderDispatch(RecorderActions.SET_IS_RECORDING_COMMAND)
      : recorderDispatch(RecorderActions.SET_NOT_RECORDING_COMMAND);
  };

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
        if (
          JSON.parse(localStorage.getItem("user")).isCloudEnabled === "true"
        ) {
          const MicRecorder = (await import("mic-recorder-to-mp3")).default;
          Mp3Recorder = new MicRecorder({ bitRate: 128 });
        } else {
          const Recorder = (await import("../recorder")).Recorder;
          var source = audioContext.createMediaStreamSource(stream);
          window.savedReferenceWorkaroundFor934512 = source;

          var gainNode = audioContext.createGain();
          gainNode.gain.value = 0.2;
          source.connect(gainNode);

          WavRecorder = new Recorder(gainNode, {
            type: "audio/wav",
          });
        }
      })
      .then(() => setIsLoading(false))
      .catch((err) => {
        setIsLoading(false);
        console.log("Unable to get user media stream ", err);
      });
  };

  useEffect(() => {
    initUserMedia();
    // eslint-disable-next-line
  }, []);

  const handleWatsonResponse = async ({ action, contact_id, text, reply }) => {
    if (!text) {
      onError({
        title: "We couldn't hear you.",
        description:
          "Please try moving somewhere quieter or speaking more loudly.",
        status: "error",
      });
    } else if (!action) {
      // No intent recognized
      onError({
        title: "We couldn't understand you.",
        description:
          "Please try moving somewhere quieter or speaking more loudly.",
        status: "error",
      });
    } else if (action === "startCall" && !contact_id) {
      // No contact found
      onError({
        title: "We don't know who that is.",
        description: "Sorry, we don't recognize that person.",
        status: "warning",
      });
    } else {
      switch (action) {
        case "respondAudioOnly":
          customResponse(reply);
          break;
        case "startExercise":
          console.log("Exercise initiated");
          break;
        case "changeBackground":
          changeScene();
          break;
        case "startCall":
          makeCall(contact_id);
          break;
        default:
          onError({
            title: "We couldn't hear you.",
            description:
              "Please try moving somewhere quieter or speaking more loudly.",
            status: "error",
          });
      }
    }
  };

  const handleWatsonMicrophoneClick = async (e) => {
    if (recorderState.commandIsRecording) {
      // End recording
      setIsRecording(false);
      setIsLoading(true);

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
                setIsLoading(false);
              })
              .catch(async (err) => {
                setIsLoading(false);
                onError({
                  title: "Something went wrong",
                  description: "We couldn't respond to your request.",
                  status: "error",
                });
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
          setIsRecording(false);
        })
        .catch((e) => console.log(e));
    } else {
      Mp3Recorder.start()
        .then(() => {
          setIsRecording(true);
        })
        .catch((e) => console.error(e));
    }
  };

  const handleAskbobResponse = async ({ query, messages, error }) => {
    if (error) {
      onError({
        title: "Askbob couldn't understand you.",
        description:
          "Please try moving somewhere quieter or speaking more loudly.",
        status: "error",
      });
      console.error(`Askbob Error - ${error}`);
      return;
    }

    if (!messages || messages.length === 0) {
      onError({
        title: "Askbob couldn't understand you.",
        description:
          "Please try moving somewhere quieter or try rephrasing your request.",
        status: "error",
      });
    }

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
          onError({
            title: `"${query}"`,
            description: `Sorry, ${capitalize(
              contactToCall
            )} is not in your contacts.`,
            status: "warning",
          });
          break;
        }
        const contact_id = contacts[bestMatchIndex]._id;
        makeCall(contact_id);
        break;
      case "change_background":
        changeScene();
        break;
      default:
        if (askBobTextObject && askBobTextObject.text) {
          customResponse(askBobTextObject.text);
        }
        break;
    }
  };

  const handleAskbobMicrophoneClick = async () => {
    if (!recorderState.commandIsRecording) {
      if (!isLoading) {
        await initUserMedia();
        WavRecorder.record();
        setIsRecording(true);
      }
    } else {
      setIsLoading(true);
      await sleep(400);
      setIsRecording(false);
      await sleep(200);
      WavRecorder.stop();
      try {
        WavRecorder.getBuffer(async (buffers) => {
          if (!buffers || buffers.length === 0 || buffers[0].length === 0) {
            console.log("Recorder.js buffer empty");
            WavRecorder.clear();
            setIsLoading(false);
            onError({
              title: "We couldn't hear you.",
              description:
                "Microphone recorder not working properly, try again.",
              status: "error",
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
              onError({
                title: "Something went wrong",
                description: "Askbob couldn't respond to your request.",
                status: "error",
              });
              throw r;
            })
            .then((rJson) => {
              handleAskbobResponse(rJson);
              WavRecorder.clear();
              setIsLoading(false);
            })
            .catch(async (err) => {
              WavRecorder.clear();
              setIsLoading(false);
              onError({
                title: "Something went wrong",
                description: "We couldn't respond to your request.",
                status: "error",
              });
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
        setIsRecording(false);
        setIsLoading(false);
        console.log(err);
      }
    }
  };

  return (
    <CommandButton
      rounded="bottomLeft"
      top="0"
      right="0"
      onClick={
        isCloudEnabled
          ? handleWatsonMicrophoneClick
          : handleAskbobMicrophoneClick
      }
    >
      {isLoading ? (
        <Spinner size="4rem" m="1rem" color="white" speed="0.5s" />
      ) : (
        <Icon
          color={
            recorderState.commandIsRecording ? theme.colors.warningRed : "white"
          }
          name="microphone"
          size="4rem"
          m="1rem"
          opacity="100%"
        />
      )}
    </CommandButton>
  );
}

export default VoiceCommand;
