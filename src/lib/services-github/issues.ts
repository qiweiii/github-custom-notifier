import { getOctokit } from "../octokit";

export async function fetchNIssues(
  repoFullName: string,
  since?: string, // in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
  n: number = 20,
  sort: "updated" | "created" | "comments" = "updated"
) {
  const octokit = getOctokit();
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/issues", {
    owner: repoFullName.split("/")[0],
    repo: repoFullName.split("/")[1],
    state: "open", // can make this an option in future
    since,
    sort,
    page: 1,
    per_page: n,
  });
  return data;
}

export async function fetchIssueDetails(
  repoFullName: string,
  issueNumber: number
) {
  const octokit = getOctokit();
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}",
    {
      owner: repoFullName.split("/")[0],
      repo: repoFullName.split("/")[1],
      issue_number: issueNumber,
    }
  );
  return data;
}
