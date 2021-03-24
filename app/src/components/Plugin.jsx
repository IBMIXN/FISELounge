import React, { useEffect } from "react";

function Plugin({ iframeId }) {
  useEffect(() => {
    const iframeDoc = document.getElementById(iframeId).contentWindow.document;

    const cssLink = iframeDoc.createElement("link");
    cssLink.href = `${process.env.PUBLIC_URL}/plugins.css`;
    cssLink.rel = "stylesheet";
    cssLink.type = "text/css";
    iframeDoc.head.appendChild(cssLink);

    const bbcNewsFeedScript = document.createElement("script");
    const bbcHealthFeedScript = document.createElement("script");

    bbcNewsFeedScript.src =
      "//rss.bloople.net/?url=http%3A%2F%2Ffeeds.bbci.co.uk%2Fnews%2Frss.xml&limit=5&type=js";
    bbcHealthFeedScript.src =
      "//rss.bloople.net/?url=http%3A%2F%2Ffeeds.bbci.co.uk%2Fnews%2Fvideo_and_audio%2Fhealth%2Frss.xml&limit=5&type=js";
    bbcNewsFeedScript.async = true;
    bbcHealthFeedScript.async = true;

    iframeDoc.body.appendChild(bbcNewsFeedScript);
    iframeDoc.body.appendChild(bbcHealthFeedScript);
  });

  return (
    <div>
      <h1>
        <span role="img" aria-label="bowling-emoji">
          🎳
        </span>{" "}
        Games
      </h1>
      <ul>
        <li>
          <a href="https://playpager.com/embed/chess/index.html"> Chess </a>
        </li>
        <li>
          <a href="https://playpager.com/embed/reversi/index.html"> Reversi </a>
        </li>
        <li>
          <a href="https://playpager.com/embed/checkers/index.html">
            {" "}
            Checkers{" "}
          </a>
        </li>
        <li>
          <a href=" https://playpager.com/play-1970s-quiz/index.html">
            1970's TV show quiz
          </a>
        </li>
      </ul>

      <h1>
        <span role="img" aria-label="redball-emoji">
          🔴
        </span>{" "}
        Covid information
      </h1>
      <ul>
        <li>
          <a href="https://www.youtube.com/embed/QV_UnPl8qMA">
            Most frequently asked questions about covid-19
          </a>
        </li>
        <li>
          <a href="https://www.youtube.com/embed/2HzPuwVOeRE">
            NHS COVID-19 app - the basics
          </a>
        </li>
        <li>
          <a href="https://www.youtube.com/embed/S9XR8RZxKNo">
            How to do a COVID-19 Self Test (rapid antigen test)
          </a>
        </li>
      </ul>

      <div id="bbc-feed"></div>

      <h1>
        {" "}
        <span role="img" aria-label="redball-emoji">
          &#127757;
        </span>{" "}
        BBC News Feeds
      </h1>
      {/* <ul>
        <script src="//rss.bloople.net/?url=http%3A%2F%2Ffeeds.bbci.co.uk%2Fnews%2Frss.xml&limit=5&type=js"></script>
        <script src="//rss.bloople.net/?url=http%3A%2F%2Ffeeds.bbci.co.uk%2Fnews%2Fvideo_and_audio%2Fhealth%2Frss.xml&limit=5&type=js"></script>
      </ul> */}
    </div>
  );
}

export default Plugin;
