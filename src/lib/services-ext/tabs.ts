import { isChrome } from '../util';
import { queryPermission } from './permissions';

export const emptyTabUrls = isChrome() ? ['chrome://newtab/', 'chrome-search://local-ntp/local-ntp.html'] : [];

async function createTab(url: string) {
  return browser.tabs.create({ url });
}

export async function updateTab(tabId: number, options: any) {
  return browser.tabs.update(tabId, options);
}

export async function queryTabs(urlList: string[]) {
  const currentWindow = true;
  return browser.tabs.query({ currentWindow, url: urlList });
}

export async function openTab(url: string) {
  return createTab(url);
}
