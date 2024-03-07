import optionsStorage from './storage/options';
import pino from 'pino';

/**
 * Get the GitHub origin from the options storage.
 */
export async function getGitHubOrigin() {
  const { rootUrl } = await optionsStorage.getValue();
  const { origin } = new URL(rootUrl);

  if (origin === 'https://api.github.com' || origin === 'https://github.com') {
    return 'https://github.com';
  }

  return origin;
}

/**
 * Get the GitHub API URL based on origin.
 */
export function getApiUrl(origin: string) {
  const { origin: o } = new URL(origin);
  if (o === 'https://api.github.com' || o === 'https://github.com') {
    return 'https://api.github.com';
  }

  return `${o}/api/v3`;
}

/**
 * Check if the current browser is Chrome.
 */
export function isChrome() {
  return navigator.userAgent.includes('Chrome');
}

/**
 * Parses a GitHub repository full name into owner and repository
 */
export function parseRepoFullName(fullName: string) {
  const [, owner, repository] = fullName.match(/^([^/]*)(?:\/(.*))?/) || [];
  return { owner, repository };
}

export const logger = pino({
  browser: {
    disabled: !process.env.NODE_ENV || process.env.NODE_ENV === 'prod',
    asObject: true,
  },
});

/**
 * format: YYYY-MM-DDTHH:MM:SSZ
 * need to remove milisecond
 */
export function getISO8601String(date: Date) {
  return date.toISOString().split('.')[0] + 'Z';
}
