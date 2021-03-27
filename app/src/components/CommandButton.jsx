/** @jsx jsx */
/** @jsxFrag React.Fragment */
import { jsx } from "@emotion/core";
import { Box } from "@chakra-ui/core";
import theme from "../theme";

const ROUNDNESS = "70%";

const CommandButton = ({
  rounded,
  top,
  right,
  left,
  bottom,
  onClick,
  ariaLabel,
  children,
}) => {
  const getRoundedProp = (rounded) => {
    switch (rounded) {
      case "bottomLeft":
        return {
          roundedBottomLeft: ROUNDNESS,
        };
      case "bottomRight":
        return {
          roundedBottomRight: ROUNDNESS,
        };
      case "topLeft":
        return {
          roundedTopLeft: ROUNDNESS,
        };
      case "topRight":
        return {
          roundedTopRight: ROUNDNESS,
        };
      default:
        console.error(
          `Unknown CustomButton prop - "${rounded}" - use bottomLeft, "bottomRight", "topLeft", "topRight"`
        );
        return {};
    }
  };

  return (
    <button onClick={onClick} aria-label={ariaLabel}>
      <Box
        pos="absolute"
        top={top}
        bottom={bottom}
        right={right}
        left={left}
        bg={theme.colors.blackGlass}
        pr="1rem"
        pb="1rem"
        pt="0.5rem"
        pl="0.5rem"
        {...getRoundedProp(rounded)}
      >
        {children}
      </Box>
    </button>
  );
};

export default CommandButton;
