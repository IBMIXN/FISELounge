/** @jsx jsx */
/** @jsxFrag React.Fragment */
// eslint-disable-next-line
import React, { useEffect, useState } from "react";
import { jsx, css } from "@emotion/core";
import "aframe";
import "aframe-particle-system-component";
import { Entity, Scene } from "aframe-react";
import { Helmet } from "react-helmet";
import { isAudioPlaying, playAudio, sleep, stopAudio } from "../../utils";
import SplashScreen from "../../components/SplashScreen";
import JitsiComponent from "../../components/JitsiComponent";
import PluginComponent from "../../components/PluginComponent";
import VoiceCommand from "../../components/VoiceCommand";
import VoiceClip from "../../components/VoiceClip";
import CommandButton from "../../components/CommandButton";
import ContactList from "../../components/ContactList";
import img1 from "../../assets/defaultBackground1.jpeg";
import img2 from "../../assets/defaultBackground2.jpg";
import { Redirect } from "react-router-dom";
import { Icon, useToast } from "@chakra-ui/core";

const TOAST_DURATION = 8000;

const defaultBackground1 = {
  data: img1,
  isVR: "true",
};

const defaultBackground2 = {
  data: img2,
  isVR: "false",
};

var displaySplashScreen = true;

function Main() {
  const [loaded, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(true), 6000);
  }, []);

  const scenes = [defaultBackground1, defaultBackground2];
  const [room, setRoom] = useState("");
  const [call, setCall] = useState(false);
  const [openPlugin, setOpenPlugin] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const toast = useToast();

  const synth = window.speechSynthesis;

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
    //initUserMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    displaySplashScreen = false;
  }
  if (!rawUser) return <Redirect to="/onboarding" />;
  const user = JSON.parse(rawUser);

  // add user-uploaded background scenes
  user.backgrounds.forEach((background) => {
    scenes.unshift(background);
  });

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

  const playTextToSpeechWatson = async (text) => {
    await fetch(
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
    )
      .then(async (res) => {
        if (res.ok) {
          const { body } = res;
          const reader = body.getReader();
          var chunks = [];
          let done, value;
          while (!done) {
            ({ value, done } = await reader.read());
            if (done) {
              break;
            }
            chunks = chunks.concat(value);
          }
          chunks = chunks.reduce((acc, val) => [...acc, ...val], []);
          playAudio(new Uint8Array(chunks));
          return;
        }
        throw res;
      })
      .catch(async (err) => {
        if (err instanceof Error) {
          throw err;
        }
        console.error(
          `Audio Response - ${err.status} ${err.statusText}: ${err.message}`
        );
      });
  };

  const playTextToSpeechLocally = async (text) => {
    if (synth.speaking) {
      synth.cancel();
      await sleep(1000);
    }
    if (text) {
      const speakText = new SpeechSynthesisUtterance(text);
      speakText.onerror = (e) => {
        console.error("Speech to text failed: ", e);
      };
      synth.speak(speakText);
    }
  };

  const stopSpeech = async () => {
    if (user.isWatsonTtsEnabled === "true" && isAudioPlaying()) {
      stopAudio();
      return;
    }
    if (synth.speaking) {
      synth.cancel();
    }
  };

  const showToast = ({
    title,
    description,
    status,
    position,
    isClosable,
    duration,
    id,
  }) => {
    toast({
      title,
      description,
      status,
      position: position || "bottom",
      isClosable: isClosable || true,
      duration: duration || TOAST_DURATION,
      id,
    });
  };

  return loaded || !displaySplashScreen ? (
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
          ${scenes[currentSceneIndex].isVR === "false" &&
          `background-image: url(${scenes[currentSceneIndex].data});
           background-size: cover;`}
        `}
        onClick={() =>
          (openPlugin || call) && (setOpenPlugin(false) || setCall(false))
        }
      >
        {scenes[currentSceneIndex].isVR === "true" && (
          <Scene vr-mode-ui={{ enabled: false }} style={{ zIndex: -10 }}>
            {user.isSnowEnabled === "true" && (
              <Entity particle-system={{ preset: "snow" }} />
            )}
            <Entity
              primitive="a-sky"
              rotation="0 -140 0"
              src={scenes[currentSceneIndex].data}
              crossorigin="anonymous"
            />
          </Scene>
        )}
        {scenes.length > 1 && (
          <CommandButton
            rounded="bottomRight"
            top="0"
            left="0"
            onClick={handleChangeScene}
            ariaLabel="change-background"
          >
            <Icon
              color="white"
              name="repeat"
              size="4rem"
              m="1rem"
              opacity="100%"
            />
          </CommandButton>
        )}
        {
          <CommandButton
            rounded="topLeft"
            bottom="0"
            right="0"
            onClick={setOpenPlugin}
            aria-label="open-plugin"
          >
            <Icon
              color="white"
              name="external-link"
              size="4rem"
              m="1rem"
              opacity="100%"
            />
          </CommandButton>
        }
        <VoiceCommand
          commands={{
            changeScene: handleChangeScene,
            makeCall: handleMakeCall,
            customResponse:
              user.isWatsonTtsEnabled === "true"
                ? playTextToSpeechWatson
                : playTextToSpeechLocally,
          }}
          toast={showToast}
          onStartRecording={stopSpeech}
        ></VoiceCommand>
        <VoiceClip
          isCloudEnabled={user.isCloudEnabled === "true"}
          toast={showToast}
        ></VoiceClip>
        <ContactList onContactClick={handleMakeCall}></ContactList>
      </div>
    </>
  ) : (
    <SplashScreen />
  );
}

export default Main;
