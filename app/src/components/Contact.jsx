/** @jsx jsx */
/** @jsxFrag React.Fragment */
import React, { useState } from "react";
import { jsx, css } from "@emotion/core";

const Contact = (props) => (
  <div
    css={css`
      width: 100%;
      height: 11em;
      clip-path: circle();
    `}
  >
    <img
      {...props}
      alt="p"
      css={css`
        width: 100%;
        object-fit: cover;
      `}
    />
  </div>
);

export default Contact;
