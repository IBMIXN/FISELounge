import React, { useEffect, useState, useContext } from "react";
import { RecorderContext } from "../pages/Main";
import { RecorderActions } from "../reducers";
import { capitalize, sleep, resampleBufferToWav16kHz } from "../utils";
import CommandButton from "./CommandButton";
import PulsatingBlob from "./PulsatingBlob";
import { Icon, Spinner, useTheme } from "@chakra-ui/core";
import { encodeURI } from "../utils";

var Mp3Recorder;
var WavRecorder;
var audioContext;

function VoiceClip({ isCloudEnabled, onNotify }) {
  const [isLoading, setIsLoading] = useState(true);
  const [recorderState, recorderDispatch] = useContext(RecorderContext);
  const theme = useTheme();

  const DEFAULT_MESSAGE = "Please, I am in need of your help. Contact me.";

  const setIsRecording = (bool) => {
    if (bool) {
      onNotify({
        title: "Recording EMERGENCY Message",
        status: "error",
        position: "top",
        duration: 3000,
        id: "emergency-toast",
      });
      recorderDispatch(RecorderActions.SET_IS_RECORDING_CLIP);
      return;
    }
    recorderDispatch(RecorderActions.SET_NOT_RECORDING_CLIP);
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

  const sendEmergencyMessage = async (text) => {
    text = text || DEFAULT_MESSAGE;
    console.log(encodeURI({ text }));
    await fetch(
      `${
        process.env.REACT_APP_SERVER_URL
      }/api/otc/emergency/${localStorage.getItem("otc")}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: encodeURI({ text }),
      }
    )
      .then((res) => {
        if (res.ok) {
          onNotify({
            title: "Emergency message sent succesfully",
            description:
              "Please, if needed contact local authorities and maintain your calm",
            status: "error",
          });
          return;
        }
        throw res;
      })
      .catch(async (err) => {
        onNotify({
          title: "Message could not be send",
          description:
            "Please try again by pressing the bottom left emergency button",
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

  const handleWatsonResponse = async ({ text }) => {
    if (!text) {
      onNotify({
        title: "We couldn't hear you... sending default emergency message.",
        description:
          "Please try moving somewhere quieter or speaking more loudly.",
        status: "warning",
      });
    }
    sendEmergencyMessage(text);
  };

  const handleWatsonClick = async () => {
    if (recorderState.clipIsRecording) {
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
                onNotify({
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

  const handleAskbobResponse = async ({ query, error }) => {
    if (error) {
      onNotify({
        title: "Askbob couldn't understand you.",
        description:
          "Please try moving somewhere quieter or speaking more loudly.",
        status: "error",
      });
      console.error(`Askbob Error - ${error}`);
    }
    sendEmergencyMessage(query);
  };

  const handleAskbobClick = async () => {
    if (!recorderState.clipIsRecording) {
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
            onNotify({
              title: "Askbob couldn't hear you.",
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
              onNotify({
                title: "Something went wrong... sending default message",
                description: "Askbob not working properly, try again.",
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
              onNotify({
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

  const handleClick = async () => {
    if (isCloudEnabled) {
      await handleWatsonClick();
      return;
    }
    handleAskbobClick();
  };

  const getEmergencySign = () => {
    if (isLoading) {
      return (
        <Spinner
          size="4rem"
          m="1rem"
          color={theme.colors.warningRed}
          speed="0.5s"
          thickness="4px"
        />
      );
    } else if (recorderState.clipIsRecording) {
      return (
        <PulsatingBlob
          color={theme.colors.warningRed}
          pulseOn={recorderState.clipIsRecording}
          key="emergency-pulsating-blob"
        ></PulsatingBlob>
      );
    } else {
      return (
        <Icon
          name="warning-2"
          color={theme.colors.warningRed}
          size="4rem"
          margin="1rem"
          key="emergency-warning-icon"
        ></Icon>
      );
    }
  };

  return (
    <CommandButton rounded="topRight" bottom="0" left="0" onClick={handleClick}>
      {getEmergencySign()}
    </CommandButton>
  );
}

export default VoiceClip;
