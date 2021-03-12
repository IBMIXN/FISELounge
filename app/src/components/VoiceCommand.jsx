import React from "react";
import stringSimilarity from "string-similarity";
import { capitalize } from "../utils";
import { Spinner, Icon, useTheme } from "@chakra-ui/core";
import CommandButton from "./CommandButton";
import RecorderComponent from "./RecorderComponent";

function VoiceCommand({ commands, onError }) {
  const { changeScene, makeCall, customResponse } = commands;

  const theme = useTheme();

  const user = JSON.parse(localStorage.getItem("user"));

  const errorResponseToast = () => {
    onError({
      title: "We couldn't hear you.",
      description:
        "Please try moving somewhere quieter or speaking more loudly.",
      status: "error",
    });
  };

  const serverErrorToast = () => {
    onError({
      title: "Something went wrong...",
      description: "Services did not respond, please try again.",
      status: "error",
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

  const fetchAskbobVoiceQuery = (res) => {
    var formData = new FormData();
    formData.append("speech", res);
    formData.append("sender", user.name);

    return fetch(`${process.env.REACT_APP_ASKBOB_URL}/voicequery`, {
      method: "POST",
      body: formData,
    });
  };

  const handleWatsonResponse = async ({ data }) => {
    const { action, contact_id, text, reply } = data;
    if (!text || !action) {
      errorResponseToast();
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
          errorResponseToast();
      }
    }
  };

  const handleAskbobResponse = async ({ query, messages, error }) => {
    if (error) {
      errorResponseToast();
      console.error(`Askbob Error - ${error}`);
      return;
    }

    if (!messages || messages.length === 0) {
      errorResponseToast();
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

  const rendererOnDefault = () => {
    return (
      <Icon
        color="white"
        name="microphone"
        size="4rem"
        m="1rem"
        opacity="100%"
      />
    );
  };

  const rendererOnRecording = () => {
    return (
      <Icon
        color={theme.colors.warningRed}
        name="microphone"
        size="4rem"
        m="1rem"
        opacity="100%"
      />
    );
  };

  const rendererOnLoading = () => {
    return <Spinner size="4rem" m="1rem" color="white" speed="0.5s" />;
  };

  return (
    <CommandButton rounded="bottomLeft" top="0" right="0">
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

export default VoiceCommand;
