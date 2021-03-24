import React from "react";
import { Box } from "@chakra-ui/core";
import theme from "../theme";
import Frame from "react-frame-component";
import Plugin from "./Plugin";

const PluginComponent = () => {
  const iframeId = "plugin-iframe";

  const iframeStyle = {
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
      <Frame
        title="iframeTest"
        frameborder="0"
        id={iframeId}
        objectFit="scale-down"
        style={iframeStyle}
      >
        <Plugin iframeId={iframeId}></Plugin>
      </Frame>
    </Box>
  );
};

export default PluginComponent;
