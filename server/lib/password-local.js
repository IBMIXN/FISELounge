import Local from "passport-local";
import { findUser } from "./user";

export const localStrategy = new Local.Strategy(async function (
  username,
  password,
  done
) {
  findUser({ username, password })
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      // Process invalid credentials
      done(error);
    });
});
