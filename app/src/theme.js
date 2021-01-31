import React from "react";
import { theme as chakraTheme } from "@chakra-ui/core";

const fonts = { ...chakraTheme.fonts, mono: `'Menlo', monospace` };

const breakpoints = ["40em", "52em", "64em", "90em"];
breakpoints.sm = breakpoints[0];
breakpoints.md = breakpoints[1];
breakpoints.lg = breakpoints[2];
breakpoints.xl = breakpoints[3];

const theme = {
  ...chakraTheme,
  colors: {
    ...chakraTheme.colors,
    black: "#16161D",
  },
  fonts,
  breakpoints,
  icons: {
    ...chakraTheme.icons,
    logo: {
      path: (
        <svg
          width="3000"
          height="3163"
          viewBox="0 0 3000 3163"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="3000" height="3162.95" fill="none" />
          <path
            d="M1470.89 1448.81L2170 2488.19H820V706.392H2170L1470.89 1448.81ZM1408.21 1515.37L909.196 2045.3V2393.46H1998.84L1408.21 1515.37Z"
            fill="currentColor"
          />
        </svg>
      ),
      viewBox: "0 0 3000 3163",
    },
    ibm: {
      path: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="344"
          height="138"
          viewBox="0 0 344 138"
          version="1"
        >
          <path
            fill="currentColor"
            fillRule="nonzero"
            d="M1 1v9h67V1H1zm76 0v9h95s-10-9-23-9H77zm113 0v9h58l-3-9h-55zm99 0l-3 9h57V1h-54zM1 19v9h67v-9H1zm76 0v9h106s-1-7-4-9H77zm113 0v9h64l-3-9h-61zm92 0l-3 9h64v-9h-61zM20 37v10h29V37H20zm76 0v10h29V37H96zm57 0v10h29l2-10h-31zm57 0v10h51l-4-10h-47zm66 0l-3 10h51V37h-48zM20 55v10h29V55H20zm76 0v10h74s6-5 8-10H96zm114 0v10h28v-5l2 5h53l2-5v5h29V55h-54l-3 8-3-8h-54zM20 74v9h29v-9H20zm76 0v9h82c-2-5-8-9-8-9H96zm114 0v9h28v-9h-28zm34 0l3 9h40l3-9h-46zm51 0v9h29v-9h-29zM20 92v9h29v-9H20zm76 0v9h29v-9H96zm57 0v9h31l-2-9h-29zm57 0v9h28v-9h-28zm40 0l4 9h26l4-9h-34zm45 0v9h29v-9h-29zM1 110v9h67v-9H1zm76 0v9h102c3-2 4-9 4-9H77zm114 0v9h47v-9h-47zm66 0l3 9h14l3-9h-20zm38 0v9h48v-9h-48zM1 128v10h67v-10H1zm76 0v10h72c13 0 23-10 23-10H77zm114 0v10h47v-10h-47zm72 0l4 10 4-10h-8zm32 0v10h48v-10h-48z"
          />
        </svg>
      ),
      viewBox: "0 0 344 138",
    },
    ucl: {
      path: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 371 109"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M371 0v109h-23V93h-32V36h-25v73h-22a37 37 0 0 0 5-4c4-4 5-8 7-11l-20-10c-1 2-5 12-16 12-12 0-17-10-17-22 0-3 0-12 6-17 2-2 5-4 11-4 10 0 14 8 16 12l20-10-6-9c-8-8-20-12-31-12-27 0-40 21-40 42 0 12 5 25 15 33h-36l2-2c10-9 10-21 10-29V36h-25v49c0 3 0 6-3 9-2 1-4 3-8 3-3 0-6-1-8-3l-3-9V36h-24v46c0 8 0 17 8 25a25 25 0 0 0 3 2H0V0h371zM110 56h1v-2l-13-3-13 3v1l1 1 1 1h-1 1v8h-1v1h-1v2h-1v2h28v-2h-1v-2h-1v-9-1zm-19 0v9h-3v-8-1h3zm4 0v9h-3v-8-1h3zm4 0l1 1h-1 1v8h-3v-8-1h2zm5 0v9h-3v-8-1h3zm4 0v9h-3v-8l1-1h2zM98 37v1h-1v3l-1 1-2 2-1 4h-1v3l6-1 6 1v-3h-1c0-1 1-3-1-4l-2-2-1-1v-3h-1v-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      viewBox: "0 0 371 109",
    },
    nhs: {
      path: (
        <svg
          width="371"
          height="150"
          viewBox="0 0 371 150"
          version="1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M371 0v150H0V0h371zm-51 12c-27 0-54 10-54 41 0 34 47 27 47 46 0 13-16 14-26 14-11 0-23-2-30-6l-7 24c12 4 24 6 37 6 28 0 59-8 59-42 0-36-47-30-47-47 0-10 11-12 24-12 9 0 18 2 26 6l8-24c-8-4-22-6-37-6zM77 14H36L10 135h31l17-83 25 83h40l26-121h-30l-17 84h-1L77 14zm116 0h-32l-25 121h32l11-51h38l-11 51h33l25-121h-32l-10 47h-38l9-47z"
            fill="currentColor"
            fillRule="nonzero"
          />
        </svg>
      ),
      viewBox: "0 0 371 150",
    },
    exit: {
      path: (
        <svg
          version="1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
        >
          <path d="M341 320c-6 0-10 5-10 11v149c0 6-5 11-11 11H64c-6 0-11-5-11-11V32c0-6 5-11 11-11h256c6 0 11 5 11 11v149a11 11 0 0 0 21 0V32c0-18-14-32-32-32H64C46 0 32 14 32 32v448c0 18 14 32 32 32h256c18 0 32-14 32-32V331c0-6-5-11-11-11z" />
          <path d="M476 248l-85-75a11 11 0 0 0-18 8v32H256c-6 0-11 5-11 11v64c0 6 5 11 11 11h117v32a11 11 0 0 0 18 8l85-75c3-2 4-5 4-8s-1-6-4-8zm-81 59v-19c0-6-5-11-11-11H267v-42h117c6 0 11-5 11-11v-19l58 51-58 51z" />
        </svg>
      ),
      viewBox: "0 0 512 512",
    },
    microphone: {
      path: (
        <svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor">
          <path d="M32 40c6 0 11-5 11-11V11c0-6-5-11-11-11S21 5 21 11v18c0 6 5 11 11 11zm-9-29c0-5 4-9 9-9s9 4 9 9v18c0 5-4 9-9 9s-9-4-9-9V11z" />
          <path d="M50 25l-1 1v4c0 9-8 17-17 17s-17-8-17-17v-4a1 1 0 0 0-2 0v4c0 10 8 18 18 19v13H21a1 1 0 0 0 0 2h22a1 1 0 0 0 0-2H33V49c10-1 18-9 18-19v-4l-1-1z" />
        </svg>
      ),
      viewBox: "0 0 64 64",
    },
  },
};

export default theme;
