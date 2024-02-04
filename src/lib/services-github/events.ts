import { Endpoints } from "@octokit/types";
import { getOctokit } from "../octokit";

export async function fetchTimelineEvents(
  repoFullName: string,
  issueNumber: number
) {
  const octokit = getOctokit();
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}/events",
    {
      owner: repoFullName.split("/")[0],
      repo: repoFullName.split("/")[1],
      issue_number: issueNumber,
      per_page: 20,
    }
  );
  return data;
}

export async function fetchIssueEventsByRepo(repoFullName: string) {
  const octokit = getOctokit();
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/events",
    {
      owner: repoFullName.split("/")[0],
      repo: repoFullName.split("/")[1],
      per_page: 50,
    }
  );
  return data;
}
