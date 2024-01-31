import { getOctokit } from "../api";
import userInfoStorage from "../storage/user";

export async function getUser(update: boolean) {
  const octokit = getOctokit();
  let user = await userInfoStorage.getValue();
  if (update || !user) {
    const { data } = await octokit.request("GET /user");
    await userInfoStorage.setValue(data);
  }

  return user;
}

// search users
