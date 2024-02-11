import { getOctokit } from "../octokit";
import userInfoStorage from "../storage/user";

export async function fetchAuthedUser(update: boolean) {
  const octokit = await getOctokit();
  let user = await userInfoStorage.getValue();
  if (update || !user) {
    const { data } = await octokit.request("GET /user");
    await userInfoStorage.setValue(data);
  }
  return user;
}

export async function getAnyUser(text: string) {
  const octokit = await getOctokit();
  const { data } = await octokit.request("GET /users/{username}", {
    username: text,
  });
  return data;
}
