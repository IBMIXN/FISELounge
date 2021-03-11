import "../styles/button.css";
import React from "react";
import { useTheme } from "@chakra-ui/core";

function PulsatingBlob({ width, height, color, pulseOn }) {
  const theme = useTheme();

  return (
    <div
      className={"blob " + (pulseOn ? "animate-pulse" : "")}
      style={{
        width: width || theme.icons.mainStyle.width,
        height: height || theme.icons.mainStyle.height,
        background: color,
        boxShadow: `0 0 0 0 ${color}`,
        margin: theme.icons.mainStyle.margin,
      }}
    ></div>
  );
}

export default PulsatingBlob;
