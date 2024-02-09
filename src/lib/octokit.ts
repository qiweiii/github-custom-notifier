import { Octokit } from "octokit";

import { OptionsPageStorageV1 } from "./storage/options";
import { getApiUrl } from "./util";

let octokit: Octokit | null = null;

storage.watch<OptionsPageStorageV1>(
  "local:optionsStorage",
  (newValue, oldValue) => {
    if (newValue) {
      octokit = new Octokit({
        auth: newValue.token,
        baseUrl: getApiUrl(newValue.rootUrl),
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
