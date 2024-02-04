/**
 * Api module has the main functions that will be used by the extension entrypoints,
 * it accesses storages/ and integrate functions in `services-github/` and `services-ext/`.
 */

import { getOctokit } from "./octokit";

import optionsStorage, { OptionsPageStorageV1 } from "./storage/options";
import userInfoStorage, { userInfoStorageV1 } from "./storage/user";
import customNotifications, {
  CustomNotificationsV1,
  NotifyItemV1,
} from "./storage/customNotifications";
import customNotificationSettings, {
  CustomNotificationSettingsV1,
  RepoSettingV1,
} from "./storage/customNotificationSettings";
import {
  fetchTimelineEvents,
  fetchIssueEventsByRepo,
  fetchAuthedUser,
  fetchIssueDetails,
  fetchNIssues,
  fetchRepoDetails,
  searchRepos,
  searchUsers,
} from "./services-github";
import { renderCount } from "./services-ext/badge";
import { playNotificationSound } from "./services-ext";

export const TIMELINE_EVENT_TYPES = new Set(["commented"]);
export const ISSUE_EVENT_TYPES = new Set(["labeled", "mentioned"]);

/**
 * Call github api to get events data, process them to notifications, and store them in storage.
 *
 * Willed be used in background entrypoint to periodically poll data
 */
export const fetchAndUpdate = async () => {
  // - prepare
  //   - 📝 note: that events api has issue events and timeline events, depends on event type, need to see which api to use for the event. E.g commented event need to use timeline event api which only work on issue level ⇒ that means still need to get issues first….
  //   - a set of unique issue ids that added in this round of poll, so avoid add dup to newEvents array (some events are both timeline event and issue event)
  //   - timeline event only types: `comment`, `commited`, `reviewed`, etc
  //   - issue events: `mentioned`, `labeled`, etc
  // - For each setting item (each repo)
  //     - if have timeline events
  //         - get data: if lastFetched > 2hr or null, get latest 20 issues (1 page, 20 per page), else get (cap to 10) latest open issues sort by updated time after `since` using lastFetched time
  //             - for each issue, get 20 timeline events, filter only configured types, and push to newEvents
  //     - if have issue events
  //         - get data: if don’t care abt lastFetched, get latest 50 events, filter only configured types, push to newEvents
  // - for each event in newEvents, based on event type, pass each to configured handler and process it, and save as a NotifyItem in storage
  //     - 📝 note: if any event need another request, don’t do it in poll, do it when user click the link….so it won’t waste request
  // - update lastFetched = newUpdatedAt

  const newUpdatedAt = Date.now();
  const { lastFetched } = await customNotifications.getValue();
  const lastFetchedISO = new Date(lastFetched).toISOString();

  const { repos } = await customNotificationSettings.getValue();
  const newEvents: any[] = [];
  const addedEventIds = new Set<number>();
  for (const [repoFullName, repoSetting] of Object.entries(repos)) {
    const { labeled, mentioned, commented } = repoSetting;
    const [owner, repo] = repoFullName.split("/");
    if (commented?.length) {
      // timeline only events (only have `commented` for now)
      let issues = [];
      if (!lastFetched || newUpdatedAt - lastFetched > 2 * 60 * 60 * 1000) {
        // TODO: test using 2, actually should be 20
        issues = await fetchNIssues(repoFullName, undefined, 2);
      } else {
        // TODO: test using 1, actually should be 10
        issues = await fetchNIssues(repoFullName, lastFetchedISO, 1);
      }
      for (const issue of issues) {
        const { number } = issue;
        const events = await fetchTimelineEvents(repoFullName, number);
        for (const event of events) {
          if (
            TIMELINE_EVENT_TYPES.has(event.event) &&
            !addedEventIds.has(event.id)
          ) {
            newEvents.push(event);
            addedEventIds.add(event.id);
          }
        }
      }
    } else {
      const events = await fetchIssueEventsByRepo(repoFullName);
      for (const event of events) {
        if (
          ISSUE_EVENT_TYPES.has(event.event) &&
          !addedEventIds.has(event.id)
        ) {
          newEvents.push(event);
          addedEventIds.add(event.id);
        }
      }
    }
  }

  // Process newEvents array to NotifyItems
  for (const event of newEvents) {
    switch (event.event) {
      case "commented":
        await onCommented(event);
        break;
      case "labeled":
        await onLabeled(event);
        break;
      case "mentioned":
        await onMentioned(event);
        break;
      default:
        break;
    }
  }

  // Update extension icon badge and play a sound
  updateCount();

  // update lastFetched time
  customNotifications.setValue({
    ...(await customNotifications.getValue()),
    lastFetched: newUpdatedAt,
  });
  // schedule next fetch at the end
  scheduleNextFetch();
};

const scheduleNextFetch = async () => {
  const { interval } = await optionsStorage.getValue();
  await browser.alarms.clearAll();
  browser.alarms.create("fetch-data", { delayInMinutes: interval });
};

const updateCount = async () => {
  const { unReadCount, hasUpdatesAfterLastFetchedTime } = await getUnreadInfo();
  renderCount(unReadCount);
  const { playNotifSound } = await optionsStorage.getValue();
  if (unReadCount && playNotifSound && hasUpdatesAfterLastFetchedTime) {
    playNotificationSound();
  }
};

export const getUnreadInfo = async () => {
  const { lastFetched } = await customNotifications.getValue();
  const { data } = await customNotifications.getValue();
  let unReadCount = 0;
  let hasUpdatesAfterLastFetchedTime = false;
  for (const repoData of data) {
    const repoName = Object.keys(repoData)[0];
    const notifyItems = repoData[repoName].notifyItems;
    for (const item of notifyItems) {
      unReadCount++;
      if (item.time > lastFetched) {
        hasUpdatesAfterLastFetchedTime = true;
      }
    }
  }
  return { unReadCount, hasUpdatesAfterLastFetchedTime };
};

/**
 * Event Handler for `commented`, process the comment and store it in storage as a customNotification.
 */
export const onCommented = async (event: any) => {};

/**
 * Event Handler for `labeled`, process the label and store it in storage as a customNotification.
 */
export const onLabeled = async (event: any) => {};

/**
 * Event Handler for `mentioned`, process the mention and store it in storage as a customNotification.
 */
export const onMentioned = async (event: any) => {};
