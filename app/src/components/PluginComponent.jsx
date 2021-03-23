import React from "react";
import { Box } from "@chakra-ui/core";
import theme from "../theme";

const domain = process.env.PUBLIC_URL + "/plugins.html";

const PluginComponent = () => {
  const iFrameStyle = {
    width: "100%",
    height: "100%",
    border: "none",
    background: "none transparent",
  };

  return (
    <Box
      pos="absolute"
      top="2%"
      bottom="2%"
      right="4%"
      left="4%"
      bg={theme.colors.whiteGlass}
      pr="1rem"
      pb="1rem"
      pt="0.5rem"
      pl="0.5rem"
      roundedBottom="5px"
      roundedTop="5px"
    >
      <iframe
        src={domain}
        title="iframeTest"
        frameborder="0"
        id="iframe"
        objectFit="scale-down"
        style={iFrameStyle}
      ></iframe>
    </Box>
  );
};

export default PluginComponent;
