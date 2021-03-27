import Recorder from "./recorder";
import MicRecorder from "mic-recorder-to-mp3";
import { resampleBufferToWav16kHz } from "./utils";

export class RecorderAdapter {
  config = {
    source: null,
    isCloudEnabled: false,
    sampleRate: 48000,
  };

  mp3Recorder = null;
  wavRecorder = null;

  constructor(cfg) {
    Object.assign(this.config, cfg);
    if (this.config.isCloudEnabled) {
      this.mp3Recorder = new MicRecorder({ bitRate: 128 });
    } else {
      this.wavRecorder = new Recorder(this.config.source, {
        type: "audio/wav",
      });
    }
  }

  async start() {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.config.isCloudEnabled) {
          await this.mp3Recorder.start();
          resolve();
        } else {
          await this.wavRecorder.record();
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async stop() {
    if (this.config.isCloudEnabled) {
      return this.mp3Recorder
        .stop()
        .getMp3()
        .then(async ([buffer, blob]) => {
          const file = new File(buffer, "voice-command.mp3", {
            type: blob.type,
            lastModified: Date.now(),
          });

          return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = async () => {
              const mp3_base64 = btoa(reader.result);
              resolve(mp3_base64);
            };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
          });
        });
    } else {
      return new Promise((resolve, reject) => {
        try {
          this.wavRecorder.stop();
          this.wavRecorder.getBuffer(async (buffers) => {
            const leftChannelBuffer = buffers[0];
            const wavFile = resampleBufferToWav16kHz(
              this.config.sampleRate,
              leftChannelBuffer
            );
            resolve(wavFile);
          });
        } catch (err) {
          reject(err);
        }
      });
    }
  }

  clear() {
    if (!this.config.isCloudEnabled) {
      this.wavRecorder.clear();
    }
  }
}
