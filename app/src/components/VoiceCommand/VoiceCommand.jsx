import React, { useEffect, useContext } from "react";
import { RecorderContext } from "../../pages/Main";
import { RecorderActions } from "../../reducers";
import stringSimilarity from "string-similarity";
import { capitalize, sleep, resampleBufferToWav16kHz } from "../../utils";

var Mp3Recorder;
var WavRecorder;
var audioContext;

function VoiceCommand({ isCloudEnabled, commands, onError, children }) {
  const [recorderState, recorderDispatch] = useContext(RecorderContext);
  const { changeScene, makeCall, customResponse } = commands;

  const setIsBlocked = (bool) => {
    bool
      ? recorderDispatch(RecorderActions.BLOCK_RECORDER)
      : recorderDispatch(RecorderActions.UNBLOCK_RECORDER);
  };

  const setIsMicrophoneRecording = (bool) => {
    bool
      ? recorderDispatch(RecorderActions.SET_RECORDING)
      : recorderDispatch(RecorderActions.SET_NOT_RECORDING);
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
          const Recorder = (await import("../../recorder")).Recorder;
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
      .then(() => setIsBlocked(false))
      .catch((err) => {
        setIsBlocked(false);
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
        description: "Sorry, we couldn't understand what you said",
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
    if (recorderState.isMicrophoneRecording) {
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
      if (recorderState.isBlocked) {
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
    if (!recorderState.isMicrophoneRecording) {
      if (recorderState.isBlocked) {
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

  return (
    <button
      onClick={
        isCloudEnabled
          ? handleWatsonMicrophoneClick
          : handleAskbobMicrophoneClick
      }
    >
      {children}
    </button>
  );
}

export default VoiceCommand;
