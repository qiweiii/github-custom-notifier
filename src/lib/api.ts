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
  fetchNIssueComments,
  fetchRepoDetails,
  searchRepos,
  searchUsers,
  OctokitIssueEvent,
} from "./services-github";
import { renderCount } from "./services-ext/badge";
import { playNotificationSound, showNotifications } from "./services-ext";
import { getGitHubOrigin } from "./util";

// export const TIMELINE_EVENT_TYPES = new Set(["commented"]);
// export const ISSUE_EVENT_TYPES = new Set(["labeled", "mentioned"]);

/**
 * Call github api to get events data, process them to notifications, and store them in storage.
 *
 * Willed be used in background entrypoint to periodically poll data
 */
export const fetchAndUpdate = async () => {
  const newUpdatedAt = Date.now();
  const { lastFetched } = await customNotifications.getValue();
  const lastFetchedISO = new Date(lastFetched).toISOString();

  const { repos } = await customNotificationSettings.getValue();
  const newEvents: any[] = [];

  for (const [repoFullName, repoSetting] of Object.entries(repos)) {
    const { labeled, mentioned, customCommented } = repoSetting;
    if (customCommented?.length) {
      // comments is special, not using events APIs, need to use issue comments API to reduce number of requests
      let comments = [];
      if (!lastFetched || newUpdatedAt - lastFetched > 2 * 60 * 60 * 1000) {
        // fetch more issue comments if lastFetched is not set or lastFetched is more than 2 hours ago
        // TODO: test using 2, actually should be 80
        comments = await fetchNIssueComments(repoFullName, undefined, 2);
      } else {
        // otherwise, fetch based on lastFetched time
        // TODO: test using 1, actually should be 40
        comments = await fetchNIssueComments(repoFullName, lastFetchedISO, 1);
      }
      for (const comment of comments) {
        const { updated_at, body, html_url, user } = comment;
        // "html_url": "https://github.com/octocat/Hello-World/issues/1347#issuecomment-1",
        const issueNumber = html_url.match(/\/issues\/(\d+)#issuecomment/)?.[1];
        newEvents.push({
          id: comment.id,
          event: "custom-commented",
          repoFullName,
          issueNumber,
          link: html_url,
          body,
          user: user?.login,
          updated_at,
          filter: { match: customCommented },
        });
      }
    } else {
      // issue events API handling
      const events = await fetchIssueEventsByRepo(repoFullName);
      for (const event of events) {
        newEvents.push({
          ...event,
          repoFullName,
          issueNumber: event?.issue?.number,
          issueTitle: event?.issue?.title,
          filter: {
            match:
              event.event === "labeled"
                ? labeled
                : event.event === "mentioned"
                ? mentioned
                : [],
          },
        });
      }
    }
  }

  // Process newEvents array to NotifyItems
  for (const event of newEvents) {
    switch (event.event) {
      case "custom-commented":
        await onCustomCommented(event);
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
  await customNotifications.setValue({
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

/**
 * Update cound on badge also trigger notification sound and desktop notification if needed.
 */
const updateCount = async () => {
  const { unReadCount, hasUpdatesAfterLastFetchedTime, items } =
    await getUnreadInfo();
  renderCount(unReadCount);
  const { playNotifSound, showDesktopNotif } = await optionsStorage.getValue();
  if (unReadCount && hasUpdatesAfterLastFetchedTime) {
    if (playNotifSound) {
      playNotificationSound();
    }
    if (showDesktopNotif) {
      showNotifications(items);
    }
  }
};

export const getUnreadInfo = async () => {
  const { lastFetched } = await customNotifications.getValue();
  const { data } = await customNotifications.getValue();
  let unReadCount = 0;
  let hasUpdatesAfterLastFetchedTime = false;
  const items: NotifyItemV1[] = [];
  for (const repoName in data) {
    const repoData = data[repoName];
    const notifyItems = repoData.notifyItems;
    for (const item of notifyItems) {
      unReadCount++;
      items.push(item);
      if (item.createdAt > lastFetched) {
        hasUpdatesAfterLastFetchedTime = true;
      }
    }
  }
  return { unReadCount, hasUpdatesAfterLastFetchedTime, items };
};

/**
 * Event Handler for `commented`, process the comment and store it in storage as a customNotification.
 */
export const onCustomCommented = async (event: {
  id: number;
  event: string;
  repoFullName: string;
  issueNumber: string;
  filter: { match: string[] };
  link: string;
  body: string;
  user: string;
  updated_at: string;
}) => {
  if (event.event !== "custom-commented") return;
  console.log("custom commented event: ", event);

  const {
    id,
    event: eventType,
    repoFullName,
    issueNumber,
    link,
    body,
    filter,
    user,
    updated_at,
  } = event;
  // filter
  const { match } = filter;
  if (!match.length) return;
  let matched = "";
  for (const m of match) {
    if (body.includes(m)) {
      matched = m;
      break;
    }
  }
  if (!matched) return;

  const oldNotifications = await customNotifications.getValue();

  await customNotifications.setValue({
    ...oldNotifications,
    data: {
      ...oldNotifications.data,
      [repoFullName]: {
        ...oldNotifications.data[repoFullName],
        notifyItems: [
          ...oldNotifications.data[repoFullName].notifyItems,
          {
            id: `issuecomment-${id}`,
            eventType,
            reason: `@${user} commented with ...${matched}... on issue #${issueNumber} in ${repoFullName}`,
            createdAt: new Date(updated_at).getTime(),
            repoName: repoFullName,
            link: link,
            issue: {
              number: parseInt(issueNumber),
              title: "",
            },
          },
        ],
      },
    },
  });
};

/**
 * Event Handler for `labeled`, process the label and store it in storage as a customNotification.
 */
export const onLabeled = async (
  event: OctokitIssueEvent & {
    repoFullName: string;
    issueNumber: string;
    issueTitle: string;
    filter: { match: string[] };
  }
) => {
  if (event.event !== "labeled") {
    return;
  }
  console.log("labeled event: ", event);
  const {
    id,
    event: eventType,
    repoFullName,
    issueNumber,
    issueTitle,
    filter,
  } = event;

  // filter
  const { match } = filter;
  if (!match.length) return;
  let matched = "";
  for (const m of match) {
    if (
      event.issue?.labels.find(
        (l) => l === m || (typeof l !== "string" && l.name === m)
      )
    ) {
      matched = m;
      break;
    }
  }
  if (!matched) return;

  const oldNotifications = await customNotifications.getValue();
  const origin = await getGitHubOrigin();
  await customNotifications.setValue({
    ...oldNotifications,
    data: {
      ...oldNotifications.data,
      [repoFullName]: {
        ...oldNotifications.data[repoFullName],
        notifyItems: [
          ...oldNotifications.data[repoFullName].notifyItems,
          {
            id: `issueevent-${id}`,
            eventType,
            reason: `Issue #${issueNumber} in ${repoFullName} is labeled with ${matched}`,
            createdAt: Date.now(),
            repoName: repoFullName,
            link: `${origin}/${repoFullName}/issues/${issueNumber}`,
            issue: {
              number: parseInt(issueNumber),
              title: issueTitle,
            },
          },
        ],
      },
    },
  });
};

/**
 * Event Handler for `mentioned`, process the mention and store it in storage as a customNotification.
 */
export const onMentioned = async (
  event: OctokitIssueEvent & {
    repoFullName: string;
    issueNumber: string;
    issueTitle: string;
    filter: { match: string[] };
  }
) => {
  if (event.event !== "mentioned") {
    return;
  }
  console.log("mentioned event: ", event);

  const {
    event: eventType,
    repoFullName,
    issueNumber,
    issueTitle,
    filter,
    id,
  } = event;
  // filter

  const { match } = filter;
  if (!match.length) return;
  let matched = "";
  for (const m of match) {
    if (event.actor?.login === m) {
      matched = m;
      break;
    }
  }
  if (!matched) return;

  const oldNotifications = await customNotifications.getValue();
  const origin = await getGitHubOrigin();
  await customNotifications.setValue({
    ...oldNotifications,
    data: {
      ...oldNotifications.data,
      [repoFullName]: {
        ...oldNotifications.data[repoFullName],
        notifyItems: [
          ...oldNotifications.data[repoFullName].notifyItems,
          {
            id: `issueevent-${id}`,
            eventType,
            reason: `@${match} mentioned in issue #${issueNumber} in ${repoFullName}`,
            createdAt: Date.now(),
            repoName: repoFullName,
            link: `${origin}/${repoFullName}/issues/${issueNumber}`,
            issue: {
              number: parseInt(issueNumber),
              title: issueTitle,
            },
          },
        ],
      },
    },
  });
};
