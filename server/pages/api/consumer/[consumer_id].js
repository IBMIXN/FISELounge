// Consumer Routes

import { getSession } from "../../../lib/iron";
import { connectToDatabase } from "../../../utils/mongodb";
import randomWords from "random-words";
import { sanitizeName } from "../../../utils";

// max size of each background image //TBD?
export const config = {
  api: {
    bodyParser: {
      sizeLimit: process.env.MAX_IMG_SIZE,
    },
  },
};

const handler = async (req, res) => {
  const session = await getSession(req);
  if (!session)
    return res
      .status(403)
      .json({ message: "You don't have access to this page" });

  const email = session.username;
  const {
    query: { consumer_id },
    body,
    method,
  } = req;

  const { client } = await connectToDatabase();
  const db = await client.db(process.env.MONGODB_DB);
  const users = db.collection("users");

  const user = await users.findOne({ email: email });

  let consumer = user.consumers.find((c) => c._id === consumer_id);

  if (!consumer)
    return res
      .status(403)
      .json({ message: "You don't have access to this consumer" });

  switch (method) {
    case "GET":
      // ---------------- GET
      try {
        return res
          .status(200)
          .json({ message: "Consumer Data found", data: consumer });
      } catch (err) {
        console.error(`api.consumer.GET: ${err}`);
        return res.status(500).json({ message: "Unexpected error" });
      }
      break;
    case "PUT":
      // ---------------- PUT
      try {
        const {
          name,
          isCloudEnabled,
          isSnowEnabled,
          isWatsonTtsEnabled,
        } = body;

        consumer.name = sanitizeName(name) || consumer.name;
        consumer.isCloudEnabled = isCloudEnabled || consumer.isCloudEnabled;
        consumer.isSnowEnabled = isSnowEnabled || consumer.isSnowEnabled;
        consumer.isWatsonTtsEnabled =
          isWatsonTtsEnabled || consumer.isWatsonTtsEnabled;

        await users.updateOne({ email }, { $set: user });
        return res.status(200).json({
          message: "Consumer updated successfully",
          data: { ...consumer, consumer_id },
        });
      } catch (err) {
        console.error(`api.consumer.PUT: ${err}`);
        return res.status(500).json({ message: "Uncaught Server Error" });
      }
      break;
    // ---------------- DELETE
    case "DELETE":
      try {
        const targetIndex = user.consumers.indexOf(consumer);
        user.consumers.splice(targetIndex, 1);

        await users.updateOne({ email }, { $set: user });
        return res
          .status(200)
          .json({ message: "Consumer Deleted successfully" });
      } catch (err) {
        console.error(`api.consumer.DELETE: ${err}`);
        return res.status(500).json({ message: "Uncaught Server Error" });
      }
      break;
    case "POST":
      // ---------------- POST
      // Refresh OTC
      try {
        consumer.otc = randomWords(3).join("-");
        await users.updateOne({ email }, { $set: user });
        return res.status(200).json({
          message: "Consumer updated successfully",
          data: { ...consumer, consumer_id },
        });
      } catch (err) {
        console.error(`api.consumer.PUT: ${err}`);
        return res.status(500).json({ message: "Uncaught Server Error" });
      }
      break;

    default:
      return res.status(405).json({ message: "This route does not exist" });
      break;
  }
};

export default handler;
