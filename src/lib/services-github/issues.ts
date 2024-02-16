import { getOctokit } from "../octokit";

export async function fetchNIssues(
  repoFullName: string,
  since?: string, // in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
  n: number = 20,
  sort: "updated" | "created" | "comments" = "updated"
) {
  const octokit = await getOctokit();
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
  const octokit = await getOctokit();
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

export async function fetchCommentById(
  repoFullName: string,
  commentId: number
) {
  const octokit = await getOctokit();
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/comments/{comment_id}",
    {
      owner: repoFullName.split("/")[0],
      repo: repoFullName.split("/")[1],
      comment_id: commentId,
    }
  );
  return data;
}

// fetchNIssueComments
export async function fetchNIssueComments(
  repoFullName: string,
  since?: string, // in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
  n: number = 40,
  sort: "updated" | "created" = "updated"
) {
  const octokit = await getOctokit();
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/comments",
    {
      owner: repoFullName.split("/")[0],
      repo: repoFullName.split("/")[1],
      since,
      sort,
      page: 1,
      per_page: n,
    }
  );
  return data;
}

/**
 * Get labels by repo full_name
 */
export async function fetchLabels(repoFullName: string) {
  const octokit = await getOctokit();
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/labels", {
    owner: repoFullName.split("/")[0],
    repo: repoFullName.split("/")[1],
    per_page: 80,
  });
  return data;
}
