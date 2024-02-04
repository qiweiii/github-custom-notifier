import { fetchAndUpdate } from "../lib/api";

export default defineBackground(async () => {
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
      browser.runtime.openOptionsPage();
    }
  });

  // TODO: need to somehow handle this in mv3
  // window.addEventListener("online", startPollData);
  // window.addEventListener("offline", startPollData);

  // poll data loop
  browser.alarms.onAlarm.addListener(fetchAndUpdate);
  fetchAndUpdate();
});
