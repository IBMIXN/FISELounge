export { playAudio, resampleBufferToWav16kHz } from "./audioUtils";
export { handleError } from "./errorHandler";

export function encodeURI(json) {
  const formBody = Object.entries(json)
    .map(
      ([key, value]) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(value)
    )
    .join("&");
  return formBody;
}

export function capitalize(string) {
  if (!string) {
    return;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
