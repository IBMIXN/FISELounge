export { playAudio, resampleBufferToWav16kHz } from "./audioUtils";

export function capitalize(string) {
  if (!string) {
    return;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
