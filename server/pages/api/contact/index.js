// New Contact Route

import { getSession } from "../../../lib/iron";
import { connectToDatabase } from "../../../utils/mongodb";
import uuid from "node-uuid";
import relations from "../../../utils/relations";
import { sanitizeName } from "../../../utils";

const handler = async (req, res) => {
  const session = await getSession(req);

  if (session) {
    const email = session.username;
    const { body, method } = req;

    const { client } = await connectToDatabase();
    const db = await client.db(process.env.MONGODB_DB);
    const users = db.collection("users");

    const user = await users.findOne({ email });

    switch (method) {
      case "POST":
        // ---------------- POST
        try {
          const {
            consumer_id,
            name,
            email: contact_email_raw,
            profileImage,
            relation: relationStr,
          } = body;

          const contact_email = contact_email_raw.toLowerCase();

          const relation = relations.indexOf(relationStr.toLowerCase());

          if (!name || !consumer_id || relation < 0)
            throw new Error("Missing params");

          var newContact = {
            _id: uuid.v4(),
            name: sanitizeName(name),
            email: contact_email,
            relation: relation,
            profileImage: "",
          };

          let consumer = user.consumers.find((c) => c._id === consumer_id);

          if (consumer.contacts.find((c) => c.email === contact_email))
            return res
              .status(400)
              .json({ message: "A contact with that email already exists" });

          consumer.contacts.push(newContact);

          await users.updateOne({ email }, { $set: user });
          return res
            .status(200)
            .json({ message: "Contact added successfully", data: newContact });
        } catch (err) {
          console.error(`api.contact.POST: ${err}`);
          return res
            .status(500)
            .json({ message: `Uncaught Server Error: ${err.message}` });
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
