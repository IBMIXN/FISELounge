import React, { useEffect, useState } from "react";
import { useJitsi } from "react-jutsu";

const domain = process.env.REACT_APP_JITSI_URL;

const configOverwrite = {
  disableDeepLinking: true,
  enableWelcomePage: false,
  enableClosePage: false,
  prejoinPageEnabled: false,
};

const interfaceConfigOverwrite = {
  LANG_DETECTION: true,
  APP_NAME: "FISE Lounge",
  SHOW_POWERED_BY: false,
  SHOW_PROMOTIONAL_CLOSE_PAGE: false,
  MOBILE_APP_PROMO: false,
  HIDE_INVITE_MORE_HEADER: false,
  DISABLE_RINGING: true,
  DISABLE_TRANSCRIPTION_SUBTITLES: true,
  DISABLE_VIDEO_BACKGROUND: true,
  ENABLE_DIAL_OUT: false,
  ENABLE_FEEDBACK_ANIMATION: false,
  SHOW_BRAND_WATERMARK: false,
  SHOW_JITSI_WATERMARK: false,
  SHOW_WATERMARK_FOR_GUESTS: false,
  CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 1,
  CONNECTION_INDICATOR_DISABLED: true,
  INITIAL_TOOLBAR_TIMEOUT: 200000,
  TOOLBAR_ALWAYS_VISIBLE: true,
  SETTINGS_SECTIONS: [ 'devices', 'language'], 
  TOOLBAR_BUTTONS: [ 'microphone', 'camera', 'hangup', 'invite', 'settings', 'livestreaming'], // languages can't be added to toolbar
  TOOLBAR_TIMEOUT: 5000,
  VIDEO_QUALITY_LABEL_DISABLED: true,
  HIDE_KICK_BUTTON_FOR_GUESTS: true,
  SHOW_CHROME_EXTENSION_BANNER: false,
  DEFAULT_BACKGROUND: '#E5E6E4'
};


const JitsiComponent = (props) => {
  const {
    roomName,
    password,
    displayName,
    onMeetingEnd,
    jitsiContainerStyles,
    containerStyles,
  } = props;

  const subject = "FISE Lounge";

  const [loading, setLoading] = useState(true);

  const options = {
    userInfo: {
      displayName,
    },
    password: password || "",
  };

  const jitsi = useJitsi(
    {
      roomName,
      parentNode: "jitsi-container",
      interfaceConfigOverwrite,
      configOverwrite,
      // jwt: jwt
    },
    domain,
    options
  );

  const containerStyle = {
    width: "100%",
    height: "100%",
  };

  const jitsiContainerStyle = {
    display: loading ? "none" : "block",
    width: "100%",
    height: "100%",
  };

  useEffect(() => {
    if (jitsi) {
      jitsi.executeCommand("subject", subject);

      // jitsi.addEventListener("participantRoleChanged", function (event) {
      //   if (event.role === "moderator") {
      //     jitsi.executeCommand("password", password);
      //   }
      // });

      // jitsi.addEventListener("passwordRequired", () => {
      //   if (password) {
      //     jitsi.executeCommand("password", password);
      //   }
      // });
      
      setLoading(false);

      if (onMeetingEnd) jitsi.addEventListener("readyToClose", onMeetingEnd);
    }

    return () => jitsi && jitsi.dispose();
  }, [jitsi, onMeetingEnd]);

  return (
    <div style={{ ...containerStyle, ...containerStyles }}>
      {loading && <p>Loading ...</p>}
      <div
        id="jitsi-container"
        style={{ ...jitsiContainerStyle, ...jitsiContainerStyles }}
      />
    </div>
  );
};

export default JitsiComponent;