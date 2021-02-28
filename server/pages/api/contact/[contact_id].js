// Contact Routes

import { getSession } from "../../../lib/iron";
import { sanitizeName } from "../../../utils";
import { connectToDatabase } from "../../../utils/mongodb";
import relations from "../../../utils/relations";

const getContact = (user, contact_id) => {
  const consumer = user.consumers.find(
    (cons) => cons.contacts.findIndex((c) => c._id === c) !== -1
  );
  return consumer.contacts.find((contact) => contact._id === contact_id);
};

const handler = async (req, res) => {
  const session = await getSession(req);

  if (session) {
    const email = session.username;
    const {
      query: { contact_id },
      body,
      method,
    } = req;

    const { client } = await connectToDatabase();
    const db = await client.db(process.env.MONGODB_DB);
    const users = db.collection("users");

    const user = await users.findOne({ email: email });

    let consumer = user.consumers.find(
      (cons) => cons.contacts.findIndex((c) => c._id === contact_id) !== -1
    );

    if (!consumer)
      return res
        .status(403)
        .json({ message: "You don't have access to this contact" });

    let contactIndex = consumer.contacts.findIndex((c) => c._id === contact_id);

    if (contactIndex < 0)
      return res
        .status(403)
        .json({ message: "You don't have access to this contact" });

    switch (method) {
      case "GET":
        // ---------------- GET
        try {
          const contact = consumer.contacts[contactIndex];
          return res.status(200).json({
            message: "Contact Data found",
            data: {
              ...contact,
              consumer_id: consumer._id,
              consumer_name: consumer.name,
            },
          });
        } catch (err) {
          console.error(`api.contact.GET: ${err}`);
          return res.status(500).json({ message: "Unexpected error" });
        }
        break;
      case "PUT":
        // ---------------- PUT
        try {
          const {
            name,
            email: contactEmail,
            profileImage: profileImage,
            relation: relationStr,
            phone: phone
          } = body;

          const relation = relations.indexOf(relationStr);

          if (relation < 0) throw new Error("Invalid relation");

          consumer.contacts[contactIndex] = {
            ...consumer.contacts[contactIndex],
            ...(name && { name: sanitizeName(name) }),
            ...(contactEmail && { email: contactEmail.toLowerCase() }),
            ...({ profileImage }),
            ...(phone && { phone }),
            ...(relation && { relation }),
          };

          await users.updateOne({ email }, { $set: user });
          return res.status(200).json({
            message: "Contact updated successfully",
            data: {
              ...consumer.contacts[contactIndex],
              consumer_id: consumer._id,
            },
          });
        } catch (err) {
          console.error(`api.contact.PUT: ${err}`);
          return res.status(500).json({ message: "Uncaught Server Error" });
        }
        break;
      // ---------------- DELETE
      case "DELETE":
        try {
          consumer.contacts.splice(contactIndex, 1);
          await users.updateOne({ email }, { $set: user });
          return res.status(200).json({
            message: "Contact Deleted successfully",
            data: { consumer_id: consumer._id },
          });
        } catch (err) {
          console.error(`api.contact.DELETE: ${err}`);
          return res.status(500).json({ message: "Uncaught Server Error" });
        }
        break;
      case "POST":
      // ---------------- POST
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
