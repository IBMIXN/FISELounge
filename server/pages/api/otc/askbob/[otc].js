// Watson Routes

import Cors from "cors";
import SpeechToTextV1 from "ibm-watson/speech-to-text/v1";
import { IamAuthenticator } from "ibm-watson/auth";
import { connectToDatabase } from "../../../../utils/mongodb";
import stringSimilarity from "string-similarity";

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

const stt = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.STT_API_KEY,
  }),
  url: process.env.STT_ENDPOINT,
});

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
          const recognizeParams = {
            audio: new Buffer(body, "base64"),
            contentType: "audio/mp3",
          };

          const data = {
            action: "",
            contact_id: "",
            text: "",
            reply: "",
          };

          const {
            result: { results },
          } = await stt.recognize(recognizeParams);

          if (results.length) {
            const { transcript } = results[0].alternatives[0];
            data.text = transcript;

            const askBobResponse = await fetch(
              `${process.env.ASKBOB_ENDPOINT}/query`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `message=${transcript}&sender=${user.name}`,
              }
            ).then((r) => {
              if (r.ok) {
                return r.json();
              }
              throw r;
            });

            const messages = askBobResponse ? askBobResponse.messages : [];

            const askBobText = messages.find((msg) => msg.text);
            data.reply = askBobText ? askBobText.text : "";

            const askBobCustom = messages.find((msg) => msg.custom);
            const intent = askBobCustom ? askBobCustom.custom.type : null;

            switch (intent) {
              case "call_user":
                data.action = "startCall";

                const contactToCall = askBobCustom.custom
                  ? askBobCustom.custom.callee.toLowerCase()
                  : null;

                const contactNames = consumer.contacts.map((c) => c.name);
                const { bestMatchIndex } = stringSimilarity.findBestMatch(
                  contactToCall,
                  contactNames
                );
                const contact_id = consumer.contacts[bestMatchIndex]._id;
                data.contact_id = contact_id;
                break;
              case "change_background":
                data.action = "changeBackground";
                break;
              default:
                data.action = "respondAudioOnly";
                break;
            }
          }

          if (data.action) {
            return res.status(200).json({
              message: "AskBob recognized your request",
              data,
            });
          } else {
            return res.status(200).json({
              message: "AskBob couldn't recognize intents",
              data,
            });
          }
        } catch (err) {
          console.error(`api.otc.watson.POST: ${err}`);
          return res
            .status(500)
            .json({ message: "Uncaught Server Error", data: err });
        }
      case "GET":
      // ---------------- GET
      case "PUT":
      // ---------------- PUT
      case "DELETE":
      // ---------------- DELETE
      default:
        return res.status(405).json({ message: "This route does not exist" });
    }
  } else {
    return res
      .status(403)
      .json({ message: "You don't have access to this page" });
  }
};

export default handler;
