import { fetchAndUpdate } from "../lib/api";
import { openNotification, queryPermission } from "../lib/services-ext";
import optionsStorage, { OptionsPageStorageV1 } from "../lib/storage/options";

export default defineBackground(async () => {
  // Open options page after extension installed
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
      console.debug("[background] Opening options page after install");
      browser.runtime.openOptionsPage();
    }
  });

  // TODO: need to somehow handle this in mv3
  // window.addEventListener("online", startPollData);
  // window.addEventListener("offline", startPollData);

  // Callback for notification click
  const onNotificationClick = (id: string) => {
    openNotification(id);
  };
  if (await queryPermission("notifications")) {
    browser.notifications.onClicked.addListener(onNotificationClick);
  }

  // Poll data loop
  const startPollData = async () => {
    console.debug("[background] Starting poll data loop");
    await browser.alarms.clearAll();
    fetchAndUpdate();
  };

  const options = await optionsStorage.getValue();
  // Initially, start polling data if token and rootUrl are set
  if (options.token && options.rootUrl) {
    console.debug("[background] Token and rootUrl already set", options);
    startPollData();
  }
  browser.alarms.onAlarm.addListener(fetchAndUpdate);
  // If api related configuration changed, re-fetch data immediately
  storage.watch<OptionsPageStorageV1>(
    "local:optionsStorage",
    async (newValue, oldValue) => {
      if (newValue?.token && newValue?.rootUrl) {
        console.debug("[background] Token and rootUrl changed", newValue);
        startPollData();
      }
    }
  );
});
