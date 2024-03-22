import { fetchAndUpdate, playSound, startPollData } from '../lib/api';
import { openNotification, queryPermission } from '../lib/services-ext';
import optionsStorage, { OptionsPageStorageV1 } from '../lib/storage/options';
import { logger } from '../lib/util';

export default defineBackground(() => {
  // Open options page after extension installed
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      logger.info('[background] Opening options page after install');
      browser.runtime.openOptionsPage();
    }
  });

  // Callback for notification (os notification) click
  const onNotificationClick = (id: string) => {
    openNotification(id);
  };
  queryPermission('notifications').then((granted) => {
    if (granted) {
      browser.notifications.onClicked.addListener(onNotificationClick);
    }
  });

  // Initially, start polling data if token and rootUrl are set
  optionsStorage.getValue().then((options) => {
    if (options.token && options.rootUrl) {
      logger.info({ options }, '[background] Token and rootUrl already set');
      startPollData();
    }
  });
  // on alarm
  browser.alarms.onAlarm.addListener(fetchAndUpdate);

  // If api related configuration changed, re-fetch data immediately
  storage.watch<OptionsPageStorageV1>('local:optionsStorage', (newValue, oldValue) => {
    if (newValue?.token && newValue?.rootUrl) {
      logger.info({ newValue }, '[background] Token and rootUrl changed');
      startPollData();
    }
  });

  // Seems any chrome.runtime API event can help wake up the service worker.
  // See <https://groups.google.com/a/chromium.org/g/chromium-extensions/c/ASRLlIZVb6I>
  // But this does not work all the time... so added the content script
  browser.runtime.onStartup.addListener(() => {
    // do nothing
  });

  browser.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'ping') {
      // do nothing
    }
  });
});
