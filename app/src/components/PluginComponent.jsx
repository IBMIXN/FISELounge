import React from "react";

const domain = process.env.PUBLIC_URL + "/plugins.html";

const PluginComponent = () => {
  const iFrameStyle = {
    width: "100%",
    height: "100%",
    border: "none",
    background: "#FFFFFF",
  };

  return (
    <iframe
      src={domain}
      title="iframeTest"
      frameborder="0"
      id="iframe"
      scrolling="auto"
      objectFit="scale-down"
      style={iFrameStyle}
    ></iframe>
  );
};

export default PluginComponent;
