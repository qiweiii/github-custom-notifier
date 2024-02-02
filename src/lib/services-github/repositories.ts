import { getOctokit } from "../octokit";

/**
 * Get the repo details by repo full_name
 */
export async function fetchRepoDetails(repoFullName: string) {
  const octokit = getOctokit();
  const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
    owner: repoFullName.split("/")[0],
    repo: repoFullName.split("/")[1],
  });
  return data;
}
