import { Octokit } from 'octokit';

import optionsStorage, { OptionsPageStorageV1 } from './storage/options';
import { getApiUrl } from './util';

let octokit: Octokit | null = null;

storage.watch<OptionsPageStorageV1>('local:optionsStorage', (newValue, oldValue) => {
  if (newValue) {
    octokit = new Octokit({
      auth: newValue.token,
      baseUrl: getApiUrl(newValue.rootUrl),
    });
  }
});

export async function getOctokit() {
  const { token, rootUrl } = await optionsStorage.getValue();
  if (!octokit) {
    if (token && rootUrl) {
      octokit = new Octokit({
        auth: token,
        baseUrl: getApiUrl(rootUrl),
      });
    } else {
      throw new Error('API not initialized, please make sure GitHub PAT and and root URL are set in the options page.');
    }
  }
  return octokit;
}
