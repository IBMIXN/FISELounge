import { createUser } from '../../lib/user'

export default async function signup(req, res) {
  console.log(req.body);
  try {
    await createUser(req.body)
    res.status(200).send({ done: true })
  } catch (error) {
    console.error(error)
    res.status(500).end(error.message)
  }
}
