import optionsStorage from "./storage/options";

/**
 * Get the GitHub origin from the options storage.
 */
export async function getGitHubOrigin() {
  const { rootUrl } = await optionsStorage.getValue();
  const { origin } = new URL(rootUrl);

  if (origin === "https://api.github.com" || origin === "https://github.com") {
    return "https://github.com";
  }

  return origin;
}

/**
 * Get the GitHub API URL from the options storage.
 */
export async function getApiUrl() {
  const { rootUrl } = await optionsStorage.getValue();
  const { origin } = new URL(rootUrl);

  if (origin === "https://api.github.com" || origin === "https://github.com") {
    return "https://api.github.com";
  }

  return `${origin}/api/v3`;
}

/**
 * Check if the current browser is Chrome.
 */
export function isChrome() {
  return navigator.userAgent.includes("Chrome");
}

/**
 * Parses a GitHub repository full name into owner and repository
 */
export function parseRepoFullName(fullName: string) {
  const [, owner, repository] = fullName.match(/^([^/]*)(?:\/(.*))?/) || [];
  return { owner, repository };
}
