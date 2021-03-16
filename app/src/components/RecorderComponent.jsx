import React, { useEffect, useState } from "react";
import { sleep, handleError } from "../utils";
import { RecorderAdapter } from "../RecorderAdapter";

var audioContext;
var Recorder;

function RecorderComponent({
  askbobFetch,
  askbobResponseHandler,
  watsonFetch,
  watsonResponseHandler,
  rendererOnDefault,
  rendererOnRecording,
  rendererOnLoading,
  onStartRecording,
  onFeedback,
  onError,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

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
          Recorder = new RecorderAdapter({ isCloudEnabled: true });
        } else {
          var source = audioContext.createMediaStreamSource(stream);
          window.savedReferenceWorkaroundFor934512 = source;

          var gainNode = audioContext.createGain();
          gainNode.gain.value = 0.2;
          source.connect(gainNode);

          Recorder = new RecorderAdapter({
            source: gainNode,
            isCloudEnabled: false,
            sampleRate: audioContext.sampleRate,
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

  const handleMicrophoneClick = async () => {
    if (!isRecording && !isLoading) {
      if (user.isCloudEnabled === "false") {
        await initUserMedia(); // fixes Recorder.js known bug when audioContext gets garbage collected
      }
      await Recorder.start()
        .then(() => {
          setIsRecording(true);
        })
        .catch((err) => console.error(err));
      if (onStartRecording) {
        onStartRecording();
      }
    } else {
      setIsLoading(true);
      await sleep(100);
      setIsRecording(false);
      await sleep(800);
      Recorder.stop()
        .then((res) => {
          if (user.isCloudEnabled === "true") {
            return watsonFetch(res);
          }
          return askbobFetch(res);
        })
        .then((r) => {
          if (r && r.ok) {
            return r.json();
          }
          throw r;
        })
        .then(async (rJson) => {
          if (onFeedback) {
            onFeedback(rJson, user.isCloudEnabled);
          }
          user.isCloudEnabled === "true"
            ? await watsonResponseHandler(rJson)
            : await askbobResponseHandler(rJson);
          Recorder.clear();
          setIsLoading(false);
        })
        .catch(async (err) => {
          Recorder.clear();
          setIsLoading(false);
          setIsRecording(false);
          onError();
          await handleError(err);
        });
    }
  };

  const renderer = () => {
    if (isRecording) {
      return rendererOnRecording();
    }
    if (isLoading) {
      return rendererOnLoading();
    }
    return rendererOnDefault();
  };

  return <div onClick={handleMicrophoneClick}>{renderer()}</div>;
}

export default RecorderComponent;
