import { fetchAndUpdate } from '../lib/api';
import { openNotification, queryPermission } from '../lib/services-ext';
import optionsStorage, { OptionsPageStorageV1 } from '../lib/storage/options';
import { logger } from '../lib/util';

export default defineBackground(async () => {
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
  if (await queryPermission('notifications')) {
    browser.notifications.onClicked.addListener(onNotificationClick);
  }

  // Poll data loop
  const startPollData = async () => {
    logger.info('[background] Starting poll data loop');
    await browser.alarms.clearAll();
    fetchAndUpdate();
  };

  // Initially, start polling data if token and rootUrl are set
  const options = await optionsStorage.getValue();
  if (options.token && options.rootUrl) {
    logger.info({ options }, '[background] Token and rootUrl already set');
    await startPollData();
  }
  // on alarm
  browser.alarms.onAlarm.addListener(fetchAndUpdate);

  // If api related configuration changed, re-fetch data immediately
  storage.watch<OptionsPageStorageV1>('local:optionsStorage', async (newValue, oldValue) => {
    if (newValue?.token && newValue?.rootUrl) {
      logger.info({ newValue }, '[background] Token and rootUrl changed');
      await startPollData();
    }
  });

  // Code for keeping service worker running
  async function createOffscreenForAlive() {
    // @ts-ignore
    await browser.offscreen
      .createDocument({
        url: 'offscreen-alive.html',
        reasons: ['BLOBS'],
        justification: 'keep service worker running',
      })
      .catch(() => {});
  }
  browser.runtime.onStartup.addListener(createOffscreenForAlive);
  self.onmessage = (e) => {}; // keepAlive
  createOffscreenForAlive();
});
