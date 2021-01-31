// Admin User Routes

import { getSession } from "../../../lib/iron";
import { connectToDatabase } from "../../../utils/mongodb";

const handler = async (req, res) => {
  const session = await getSession(req);

  if (session) {
    const email = session.username;

    const { client } = await connectToDatabase();
    const db = await client.db(process.env.MONGODB_DB);
    const users = db.collection("users");

    switch (req.method) {
      case "GET":
        // ---------------- GET
        break;
      case "POST":
        // ---------------- POST
        break;
      case "PUT":
        // ---------------- PUT
        break;
      // ---------------- DELETE
      case "DELETE":
        try {
          await users.deleteOne({ email });
          return res.status(200).json({ message: "Deleted successfully" });
        } catch (err) {
          console.error(`api.user.DELETE: ${err}`);
          return res.status(500).json({ message: "Uncaught Server Error" });
        }
        break;

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
