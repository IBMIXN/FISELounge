import React from "react";
import CommandButton from "./CommandButton";
import PulsatingBlob from "./PulsatingBlob";
import { Icon, Spinner, useTheme } from "@chakra-ui/core";
import { encodeURI } from "../utils";
import RecorderComponent from "./RecorderComponent";

const DEFAULT_MESSAGE = "Please, I am in need of your help. Contact me.";

function VoiceClip({ onNotify }) {
  const theme = useTheme();

  const user = JSON.parse(localStorage.getItem("user"));

  const serverErrorToast = () => {
    onNotify({
      title: "Something went wrong...",
      description: "Services did not respond, please try again.",
      status: "error",
    });
  };

  const sendEmergencyMessage = async (text) => {
    text = text || DEFAULT_MESSAGE;
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

  const fetchWatsonVoiceQuery = async (res) => {
    return fetch(
      `${
        process.env.REACT_APP_SERVER_URL
      }/api/otc/watson/${localStorage.getItem("otc")}`,
      {
        method: "POST",
        body: res,
      }
    );
  };

  const fetchAskbobVoiceQuery = async (res) => {
    var formData = new FormData();
    formData.append("speech", res);
    formData.append("sender", user.name);

    return fetch(`${process.env.REACT_APP_ASKBOB_URL}/voicequery`, {
      method: "POST",
      body: formData,
    });
  };

  const handleWatsonResponse = async ({ data }) => {
    const { text } = data;
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

  const rendererOnDefault = () => {
    return (
      <Icon
        name="warning-2"
        color={theme.colors.warningRed}
        size="4rem"
        margin="1rem"
        key="emergency-warning-icon"
      ></Icon>
    );
  };

  const rendererOnRecording = () => {
    return (
      <PulsatingBlob
        color={theme.colors.warningRed}
        pulseOn={true}
        key="emergency-pulsating-blob"
      ></PulsatingBlob>
    );
  };

  const rendererOnLoading = () => {
    return (
      <Spinner
        size="4rem"
        m="1rem"
        color={theme.colors.warningRed}
        speed="0.5s"
        thickness="4px"
      />
    );
  };

  return (
    <CommandButton rounded="topRight" bottom="0" left="0">
      <RecorderComponent
        askbobFetch={fetchAskbobVoiceQuery}
        askbobResponseHandler={handleAskbobResponse}
        watsonFetch={fetchWatsonVoiceQuery}
        watsonResponseHandler={handleWatsonResponse}
        rendererOnDefault={rendererOnDefault}
        rendererOnRecording={rendererOnRecording}
        rendererOnLoading={rendererOnLoading}
        onError={serverErrorToast}
      ></RecorderComponent>
    </CommandButton>
  );
}

export default VoiceClip;
