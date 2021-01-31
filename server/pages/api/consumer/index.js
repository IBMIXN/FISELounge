// New Consumer Routes

import { getSession } from "../../../lib/iron";
import { connectToDatabase } from "../../../utils/mongodb";
import randomWords from "random-words";
import uuid from "node-uuid";
import { sanitizeName } from "../../../utils";

const handler = async (req, res) => {
  const session = await getSession(req);

  if (session) {
    const email = session.username;
    const { body, method } = req;

    const { client } = await connectToDatabase();
    const db = await client.db(process.env.MONGODB_DB);
    const users = db.collection("users");

    const user = await users.findOne({ email: email });

    switch (method) {
      case "POST":
        // ---------------- POST
        try {
          const { name, isCloudEnabled } = body;
          if (!name || !isCloudEnabled) throw new Error("Missing params");
          var consumer = {
            _id: uuid.v4(),
            name: sanitizeName(name),
            isCloudEnabled: isCloudEnabled,
            otc: randomWords(3).join("-"),
            ar_scenes: [],
            contacts: [],
          };

          user.consumers.push(consumer);

          await users.updateOne({ email }, { $set: user });
          return res
            .status(200)
            .json({ message: "Consumer added successfully", data: consumer });
        } catch (err) {
          console.error(`api.consumer.POST: ${err}`);
          return res.status(500).json({ message: "Uncaught Server Error" });
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
