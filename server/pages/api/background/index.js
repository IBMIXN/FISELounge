// Background route

import { getSession } from "../../../lib/iron";
import { connectToDatabase } from "../../../utils/mongodb";
import uuid from "node-uuid";

// max size of each background image
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb' // default
    },
  },
};

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
          const { imageFile, imageName, isVR, consumer_id } = body;

          if (!imageName || !consumer_id || !imageFile)
            throw new Error("Missing params");

          var newBackground = {
            _id: uuid.v4(),
            name: imageName,
            data: imageFile,
            isVR: isVR,
          };

          let consumer = user.consumers.find((c) => c._id === consumer_id);
          consumer.backgrounds.push(newBackground);
          await users.updateOne({ email }, { $set: user });

          return res
            .status(200)
            .json({ message: "New background uploaded successfully" });
        } catch (err) {
          console.error(`api.background.POST: ${err}`);
          return res
            .status(500)
            .json({ message: `Uncaught Server Error: ${err.message}` });
        }
        break;
      case "DELETE":
        // ---------------- DELETE
        // Deletes selected background
        try {
          const { image_id, consumer_id } = body;

          let consumer = user.consumers.find((c) => c._id === consumer_id);
          // const targetIndex = consumer.ar_scenes.indexOf(image_id);
          // consumer.ar_scenes.splice(targetIndex, 1);
          consumer.backgrounds.splice(
            consumer.backgrounds.findIndex(({ _id }) => _id === image_id),
            1
          );

          await users.updateOne({ email }, { $set: user });

          return res.status(200).json({
            message: "Background deleted successfully",
          });
        } catch (err) {
          console.error(`api.background.DELETE: ${err}`);
          return res.status(500).json({ message: "Uncaught Server Error" });
        }

      case "GET":
      // ---------------- GET
      case "PUT":
      // ---------------- PUT
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
