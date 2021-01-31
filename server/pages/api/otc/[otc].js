// Otc Routes

import Cors from "cors";
import nodemailer from "nodemailer";
import { connectToDatabase } from "../../../utils/mongodb";
import { capitalize } from "../../../utils";

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

  if (consumer) {
    switch (method) {
      case "GET":
        // ---------------- GET
        try {
          return res
            .status(200)
            .json({ message: "Data found", data: consumer });
        } catch (err) {
          console.error(`api.otc.consumer.GET: ${err}`);
          return res.status(500).json({ message: "Uncaught Server Error" });
        }
        break;
      case "POST":
        // ---------------- POST
        try {
          const { contact_id } = body;
          if (!contact_id)
            return res.status(400).json({ message: "Missing Params" });

          const contact = consumer.contacts.find((c) => c._id === contact_id);

          if (!contact)
            return res.status(400).json({ message: "Missing Params" });

          let transporter = nodemailer.createTransport(
            process.env.EMAIL_SERVER
          );

          const message = {
            from: process.env.EMAIL_FROM,
            to: contact.email,
            subject: `${capitalize(
              consumer.name
            )} would like to speak to you on Lounge`,
            text: `Hi ${capitalize(contact.name)}, ${capitalize(
              consumer.name
            )} would like to speak to you on Lounge.`,
            html: `<p>Hi there ${capitalize(contact.name)},<br /> ${capitalize(
              consumer.name
            )} would like to speak to you on Lounge. Click <a href="${
              process.env.JITSI_MEET_URL
            }/${
              contact._id
            }">here</a> to join.<br /><br />Thanks,<br />FISE Lounge Team</p>`,
          };

          transporter.sendMail(message);

          return res.status(200).json({ message: "Invite Sent successfully" });
        } catch (err) {
          console.error(`api.otc.consumer.POST: ${err}`);
          return res.status(500).json({ message: "Uncaught Server Error" });
        }
        break;
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
