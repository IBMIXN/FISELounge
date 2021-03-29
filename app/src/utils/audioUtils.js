import { WaveFile } from "wavefile";
import convert from "pcm-convert";

export function playAudio(chunk) {
  const blob = new Blob([chunk], { type: "audio/wav" });
  const url = window.URL.createObjectURL(blob);

  if (!window.audioPlayer) {
    window.audioPlayer = new Audio();
  }
  window.audioPlayer.src = url;
  window.audioPlayer.play();
}

export function isAudioPlaying() {
  if (window.audioPlayer && !window.audioPlayer.paused) {
    return true;
  }
  return false;
}

export function stopAudio() {
  if (window.audioPlayer) {
    window.audioPlayer.pause();
  }
}

export function resampleBufferToWav16kHz(fromSampleRate, buffer) {
  var w = new WaveFile();

  var int16Pcm = convert(
    buffer,
    {
      dtype: "float32",
      channels: 1,
    },
    {
      dtype: "int16",
    }
  );

  w.fromScratch(1, fromSampleRate, "16", [int16Pcm], {
    container: "RIFF",
  });
  w.toSampleRate(16000);

  var wavFile = new File([w.toBuffer()], "request.wav", {
    type: "audio/wav",
  });

  return wavFile;
}
