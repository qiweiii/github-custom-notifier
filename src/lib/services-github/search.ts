import { getOctokit } from "../octokit";

export async function searchUsers(text: string) {
  const octokit = await getOctokit();
  const { data } = await octokit.request("GET /search/users", {
    q: text,
    per_page: 20,
  });
  return data;
}

export async function searchRepos(text: string) {
  const octokit = await getOctokit();
  const { data } = await octokit.request("GET /search/repositories", {
    q: text,
    per_page: 20,
  });
  return data;
}
