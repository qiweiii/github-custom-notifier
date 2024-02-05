import { fetchAndUpdate } from "../lib/api";
import optionsStorage, { OptionsPageStorageV1 } from "../lib/storage/options";

export default defineBackground(async () => {
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
      browser.runtime.openOptionsPage();
    }
  });

  // TODO: need to somehow handle this in mv3
  // window.addEventListener("online", startPollData);
  // window.addEventListener("offline", startPollData);

  // Poll data loop
  const options = await optionsStorage.getValue();
  // Initially, start polling data if token and rootUrl are set
  if (options.token && options.rootUrl) {
    await browser.alarms.clearAll();
    fetchAndUpdate();
  }
  browser.alarms.onAlarm.addListener(fetchAndUpdate);

  // If api configuration changed, re-fetch data immediately
  storage.watch<OptionsPageStorageV1>(
    "local:optionsStorage",
    async (newValue, oldValue) => {
      if (newValue?.token && newValue?.rootUrl) {
        await browser.alarms.clearAll();
        fetchAndUpdate();
      }
    }
  );
});
