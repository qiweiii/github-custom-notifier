/**
 * Api module has the main functions that will be used by the extension entrypoints,
 * it uses methods in `services-github/` and `services-ext/` under the hood.
 */

import { Octokit } from "octokit";

import optionsStorage, { OptionsPageStorageV1 } from "./storage/options";

let octokit: Octokit | null = null;

storage.watch<OptionsPageStorageV1>(
  "local:optionsStorage",
  (newValue, oldValue) => {
    if (newValue) {
      octokit = new Octokit({
        auth: newValue.token,
        baseUrl: newValue.rootUrl,
      });
    }
  }
);

export function getOctokit() {
  if (!octokit) {
    throw new Error(
      "API not initialized, please make sure GitHub PAT and and root URL are set in the options page."
    );
  }
  return octokit;
}

/**
 * Get all repos info that user configured to listen to
 */
export async function getListeningRepos() {}

/**
 * Get all issues/PRs info from Repos that user configured to listen to
 */
export async function getListeningIssues() {
  // get repos first
}

/**
 * Get each issue/PR details like comments, and filter the ones that user
 * configured to listen to.
 * Return the filtered issues/PRs comment links
 */
export async function getListeningIssueComments() {}
