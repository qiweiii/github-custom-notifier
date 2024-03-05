import { Endpoints } from '@octokit/types';
import { getOctokit } from '../octokit';

export type OctokitTimelineEvent =
  Endpoints['GET /repos/{owner}/{repo}/issues/{issue_number}/events']['response']['data'][0];

export async function fetchTimelineEvents(repoFullName: string, issueNumber: number): Promise<OctokitTimelineEvent[]> {
  const octokit = await getOctokit();
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/events', {
    owner: repoFullName.split('/')[0],
    repo: repoFullName.split('/')[1],
    issue_number: issueNumber,
    per_page: 20,
  });
  return data;
}

export type OctokitIssueEvent = Endpoints['GET /repos/{owner}/{repo}/issues/events']['response']['data'][0];

export async function fetchIssueEventsByRepo(repoFullName: string): Promise<OctokitIssueEvent[]> {
  const octokit = await getOctokit();
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues/events', {
    owner: repoFullName.split('/')[0],
    repo: repoFullName.split('/')[1],
    per_page: 40,
  });
  return data;
}
