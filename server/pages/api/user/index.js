// Admin User GET

import { getSession } from "../../../lib/iron";
import { connectToDatabase } from "../../../utils/mongodb";

export default async function user(req, res) {
  const session = await getSession(req);

  const email = session?.username;

  const { client } = await connectToDatabase();
  const db = await client.db(process.env.MONGODB_DB);
  const users = db.collection("users");

  const user = await users.findOne({ email: email });
  if (!user)
    return res.status(200).json({ data: null, message: "Unauthorized" });

  const { name, consumers } = user;
  res.status(200).json({ data: { user: { name, email, consumers } } });
}
