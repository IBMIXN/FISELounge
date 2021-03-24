import React from "react";
import stringSimilarity from "string-similarity";
import { capitalize } from "../utils";
import { Spinner, Icon, useTheme } from "@chakra-ui/core";
import CommandButton from "./CommandButton";
import RecorderComponent from "./RecorderComponent";

function VoiceCommand({ commands, toast, onStartRecording }) {
  const { changeScene, makeCall, customResponse } = commands;

  const theme = useTheme();

  const user = JSON.parse(localStorage.getItem("user"));

  const errorResponseToast = () => {
    toast({
      title: "We couldn't hear you.",
      description:
        "Please try moving somewhere quieter or speaking more loudly.",
      status: "error",
    });
  };

  const serverErrorToast = () => {
    toast({
      title: "Something went wrong...",
      description: "Services did not respond, please try again.",
      status: "error",
    });
  };

  const showFeedbackToast = (json, cloudEnabled) => {
    if (!json) {
      return;
    }
    if (cloudEnabled === "true" && json.data) {
      const { text, reply } = json.data;
      toast({
        title: `You said "${text}"`,
        description: reply,
        status: "info",
        position: "top",
        isClosable: true,
        duration: 6000,
      });
      return;
    }
    if (cloudEnabled !== "true" && json) {
      const { query, messages, error } = json;
      if (error) {
        return;
      }
      toast({
        title: `You said "${query}"`,
        description: messages && messages[0] ? messages[0].text : "",
        status: "info",
        position: "top",
        isClosable: true,
        duration: 6000,
      });
    }
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
      toast({
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
          break;
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

    if (askBobCustomObject && askBobCustomObject.custom.Service_Type) {
      // Concierge Response
      await customResponse(askBobCustomObject.custom.Response);
      const steps = askBobCustomObject.custom.Steps;
      if (steps) {
        await customResponse(steps.join(". "));
        return;
      }
    }
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
    <CommandButton
      rounded="bottomLeft"
      top="0"
      right="0"
      ariaLabel="voice-command"
    >
      <RecorderComponent
        askbobFetch={fetchAskbobVoiceQuery}
        askbobResponseHandler={handleAskbobResponse}
        watsonFetch={fetchWatsonVoiceQuery}
        watsonResponseHandler={handleWatsonResponse}
        rendererOnDefault={rendererOnDefault}
        rendererOnRecording={rendererOnRecording}
        rendererOnLoading={rendererOnLoading}
        onStartRecording={onStartRecording}
        onFeedback={showFeedbackToast}
        onError={serverErrorToast}
      ></RecorderComponent>
    </CommandButton>
  );
}

export default VoiceCommand;
