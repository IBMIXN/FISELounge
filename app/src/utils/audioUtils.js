import { WaveFile } from "wavefile";
import convert from "pcm-convert";

export function playAudio(chunk) {
  const blob = new Blob([chunk], { type: "audio/wav" });
  const url = window.URL.createObjectURL(blob);
  window.audio = new Audio();
  window.audio.src = url;
  window.audio.play();
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
