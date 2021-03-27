// Otc Routes

import Cors from "cors";
import nodemailer from "nodemailer";
import { connectToDatabase } from "../../../../utils/mongodb";
import { capitalize } from "../../../../utils";

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

  const contactPhoneNums = consumer.contacts.map((contact) => contact.phone);
  const contactEmails = consumer.contacts.map((contact) => contact.email);

  if (!contactPhoneNums && !contactEmails) {
    return res.status(400).json({ message: "No contacts found" });
  }

  if (consumer) {
    switch (method) {
      case "GET":
        break;
      case "POST":
        try {
          const { text } = body;

          if (!text) {
            return res.status(400).json({ message: 'Missing "message" param' });
          }

          const emergencyMessage = `EMERGENCY Notification - from ${capitalize(
            consumer.name
          )}: "${text}"`;

          var smsSuccessful = false;
          var emailSuccessful = false;

          await fetch(`${process.env.SMS_ENDPOINT}/sendbatch`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${process.env.SMS_API_KEY}`,
            },
            body: JSON.stringify({
              messages: [
                {
                  to: contactPhoneNums,
                  from: `${capitalize(consumer.name)}`,
                  content: emergencyMessage,
                },
              ],
            }),
          }).then((res) => {
            if (res.ok) {
              smsSuccessful = true;
            }
          });

          let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
              user: process.env.EMAIL_PROVIDER_USERNAME,
              pass: process.env.EMAIL_PROVIDER_PASS,
            },
          });

          const message = {
            from: process.env.EMAIL_FROM,
            to: contactEmails,
            subject: emergencyMessage,
            text: capitalize(text),
          };

          await transporter
            .sendMail(message)
            .then((res) => {
              if (res.accepted && res.accepted.length > 0) {
                emailSuccessful = true;
              }
            })
            .catch((err) => {
              throw err;
            });

          if (!smsSuccessful && !emailSuccessful) {
            return res
              .status(500)
              .json({ message: "No emergency message was sent" });
          }
          return res.status(200).json({ message: "Invite Sent successfully" });
        } catch (err) {
          console.error(`api.otc.consumer.POST: ${err}`);
          return res.status(500).json({ message: "Uncaught Server Error" });
        }
        break;
      case "PUT":
      case "DELETE":
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
