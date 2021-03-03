import React from "react";

const domain = process.env.REACT_APP_PLUGIN_URL; 

const PluginComponent = () => {

    const iFrameStyle = {
        width: "100%",
        height: "100%",
        border: "none",
        //background: #FFFFFF,
    };

    return (
        <iframe
            src={domain}
            title="iframeTest"
            frameborder="0"
            id="iframe"
            scrolling="no"
            objectFit="scale-down"
            style={iFrameStyle}
        ></iframe>
    );
}

export default PluginComponent;
