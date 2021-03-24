// Watson Routes

import Cors from "cors";
import TextToSpeechV1 from "ibm-watson/text-to-speech/v1";
import { IamAuthenticator } from "ibm-watson/auth";
import { connectToDatabase } from "../../../../../utils/mongodb";

const cors = Cors({
  methods: ["GET", "HEAD", "POST"],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const tts = new TextToSpeechV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.TTS_API_KEY,
  }),
  url: process.env.TTS_ENDPOINT,
});

const tts_options = {
  text: "",
  accept: "audio/wav",
  voice: "en-US_MichaelVoice",
};

const handler = async (req, res) => {
  // Run the middleware
  await runMiddleware(req, res, cors);

  const { body, method, query } = req;
  const { otc: rawOtc } = query;

  const otc = rawOtc
    .trim()
    .split(/[\s-]+/)
    .join("")
    .toLowerCase();

  const { client } = await connectToDatabase();
  const db = await client.db(process.env.MONGODB_DB);
  const usersDB = await db.collection("users");

  const users = await usersDB.find({}).toArray();
  const user = users.find(
    (u) =>
      u.consumers.findIndex((c) => {
        return c.otc.split("-").join("") === otc;
      }) != -1
  );

  if (!user)
    return res
      .status(403)
      .json({ message: "You don't have access to this page" });

  const consumer = user.consumers.find(
    (c) => c.otc.split("-").join("") === otc
  );

  if (consumer) {
    switch (method) {
      case "POST":
        // ---------------- POST
        try {
          const { text } = body;

          tts_options.text = text || "I could not understand";

          const speech_res = await tts.synthesize(tts_options);
          const buffer = await tts.repairWavHeaderStream(speech_res.result);

          res.setHeader("Content-Type", "audio/wav");
          res.status(200).send(buffer);
          res.end();
        } catch (err) {
          console.error(`api.otc.watson.text-to-speech.POST: ${err}`);
          return res
            .status(500)
            .json({ message: "Uncaught Server Error", data: `${err}` });
        }
        break;
      case "GET":
      // ---------------- GET
      case "PUT":
      // ---------------- PUT
      case "DELETE":
      // ---------------- DELETE
      default:
        return res.status(405).json({ message: "This route does not exist" });
        break;
    }
  } else {
    return res
      .status(403)
      .json({ message: "You don't have access to this page" });
  }
};

export default handler;
