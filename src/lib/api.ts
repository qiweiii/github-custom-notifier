/**
 * Api module has the main functions that will be used by the extension entrypoints,
 * it accesses storages and integrate functions in `services-github/` and `services-ext/`.
 */

import { getOctokit } from './octokit';
import optionsStorage, { OptionsPageStorageV1 } from './storage/options';
import userInfoStorage, { userInfoStorageV1 } from './storage/user';
import customNotifications, {
  CustomNotificationsV1,
  NotifyItemV1,
  saveNotifyItemByRepo,
  getUnreadInfo,
} from './storage/customNotifications';
import customNotificationSettings, {
  CustomNotificationSettingsV1,
  RepoSettingV1,
} from './storage/customNotificationSettings';
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
} from './services-github';
import { renderCount } from './services-ext/badge';
import { playNotificationSound, showNotifications } from './services-ext';
import { getGitHubOrigin, getISO8601String, logger } from './util';

// export const TIMELINE_EVENT_TYPES = new Set(["commented"]);
// export const ISSUE_EVENT_TYPES = new Set(["labeled", "mentioned"]);

/**
 * Call github api to get events data, process them to notifications, and store them in storage.
 * Willed be used in background entrypoint to periodically poll data.
 *
 * IMPT: this function may take some time if there are too many events to process.
 */
export const fetchAndUpdate = async () => {
  logger.info('[api] Fetching and updating data');
  const newUpdatedAt = Date.now();
  const { lastFetched } = await customNotifications.getValue();
  const lastFetchedISO = getISO8601String(new Date(lastFetched));

  const { repos } = await customNotificationSettings.getValue();
  const newEvents: any[] = [];

  for (const [repoFullName, repoSetting] of Object.entries(repos)) {
    const { labeled, mentioned, customCommented } = repoSetting;

    // comments is special, cannot use issue events APIs, need to use issue comments API
    if (customCommented?.length) {
      let comments = [];
      if (!lastFetched || newUpdatedAt - lastFetched > 2 * 60 * 60 * 1000) {
        // fetch more issue comments if lastFetched is not set or lastFetched is more than 2 hours ago
        // FIXME: test using 2, actually should be 60
        // FIXME: only fetch open issues?
        comments = await fetchNIssueComments(repoFullName, undefined, 2);
      } else {
        // otherwise, fetch based on lastFetched time
        // FIXME: test using 1, actually should be 30
        // FIXME: only fetch open issues?
        comments = await fetchNIssueComments(repoFullName, lastFetchedISO, 1);
      }
      logger.info(
        {
          lastFetchedISO,
          newUpdatedAt: getISO8601String(new Date(newUpdatedAt)),
          comments,
        },
        `[api] Comments fetched for (since=${lastFetchedISO})`
      );

      for (const comment of comments) {
        const { updated_at, body, html_url, user } = comment;
        // "html_url": "https://github.com/octocat/Hello-World/issues/1347#issuecomment-1",
        const issueNumber = html_url.match(/\/issues\/(\d+)#issuecomment/)?.[1];
        newEvents.push({
          id: comment.id,
          event: 'custom-commented',
          repoFullName,
          issueNumber,
          link: html_url,
          body,
          user: user?.login,
          updated_at,
          filter: { match: customCommented },
        });
      }
    }

    {
      // issue events API handling
      // NOTE: issue events endpoint does not provide a `since` param, so get latest 40 and dedup before adding to strage.
      const events = await fetchIssueEventsByRepo(repoFullName);
      logger.info(
        {
          repoFullName,
          events,
        },
        '[api] Latest Issue Events fetched'
      );
      for (const event of events) {
        newEvents.push({
          ...event,
          repoFullName,
          issueNumber: event?.issue?.number,
          issueTitle: event?.issue?.title,
          filter: {
            match: event.event === 'labeled' ? labeled : event.event === 'mentioned' ? mentioned : [],
          },
        });
      }
    }
  }

  // Process newEvents array to NotifyItems
  for (const event of newEvents) {
    // skip if event is earlier than lastFetched
    if (lastFetched && new Date(event.created_at).getTime() < lastFetched) {
      continue;
    }
    // process new event
    switch (event.event) {
      case 'custom-commented':
        await onCustomCommented(event);
        break;
      case 'labeled':
        await onLabeled(event);
        break;
      case 'mentioned':
        await onMentioned(event);
        break;
      default:
        break;
    }
  }

  // Log the storage after update
  logger.info(
    {
      storage: await customNotifications.getValue(),
    },
    '[api] customNotifications storage after update'
  );

  // Update extension icon badge and play a sound
  await updateCount();

  // update lastFetched time
  await customNotifications.setValue({
    ...(await customNotifications.getValue()),
    lastFetched: newUpdatedAt,
  });
  // schedule next fetch at the end
  await scheduleNextFetch();
};

const scheduleNextFetch = async () => {
  const { interval } = await optionsStorage.getValue();
  await browser.alarms.clearAll();
  browser.alarms.create('fetch-data', { delayInMinutes: interval });
  logger.info(`[api] Next fetch scheduled in ${interval} minutes`);
};

/**
 * Update cound on badge also trigger notification sound and desktop notification if needed.
 */
const updateCount = async () => {
  const { unReadCount, hasUpdatesAfterLastFetchedTime, items } = await getUnreadInfo();
  logger.info(
    {
      unReadCount,
      hasUpdatesAfterLastFetchedTime,
      items,
    },
    '[api] Update count: unReadCount, hasUpdatesAfterLastFetchedTime'
  );

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
  if (event.event !== 'custom-commented') return;
  logger.info({ event }, '[api] Event: custom commented');

  const { id, event: eventType, repoFullName, issueNumber, link, body, filter, user, updated_at } = event;
  // filter
  const { match } = filter;
  if (!match.length) return;
  let matched = '';
  for (const m of match) {
    if (body.includes(m)) {
      matched = m;
      break;
    }
  }
  if (!matched) return;

  await saveNotifyItemByRepo(repoFullName, {
    id: `issuecomment-${id}`,
    eventType,
    reason: `@${user} commented: "${matched}"`,
    createdAt: new Date(updated_at).getTime(),
    repoName: repoFullName,
    link: link,
    issue: {
      number: parseInt(issueNumber),
      title: 'Issue Number:',
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
  if (event.event !== 'labeled') {
    return;
  }
  logger.info({ event }, '[api] Event: labeled');
  const { id, event: eventType, repoFullName, issueNumber, issueTitle, filter, created_at } = event;

  // filter
  const { match } = filter;
  if (!match.length) return;
  let matched = '';
  for (const m of match) {
    if (event.label?.name?.toLowerCase() === m.toLowerCase()) {
      matched = m;
      break;
    }
  }
  if (!matched) return;

  const origin = await getGitHubOrigin();

  await saveNotifyItemByRepo(repoFullName, {
    id: `issueevent-${id}`,
    eventType,
    reason: `Added label: "${matched}"`,
    // since label only has created_at, use it as createdAt
    createdAt: new Date(created_at).getTime(),
    repoName: repoFullName,
    link: `${origin}/${repoFullName}/issues/${issueNumber}`,
    issue: {
      number: parseInt(issueNumber),
      title: issueTitle,
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
  if (event.event !== 'mentioned') {
    return;
  }
  logger.info({ event }, '[api] Event: mentioned');

  const { event: eventType, repoFullName, issueNumber, issueTitle, filter, id, created_at } = event;
  // filter

  const { match } = filter;
  if (!match.length) return;
  let matched = '';
  for (const m of match) {
    if (event.actor?.login === m) {
      matched = m;
      break;
    }
  }
  if (!matched) return;

  const origin = await getGitHubOrigin();

  await saveNotifyItemByRepo(repoFullName, {
    id: `issueevent-${id}`,
    eventType,
    reason: `@${match} was mentioned in the issue`,
    // since label only has created_at, use it as createdAt
    createdAt: new Date(created_at).getTime(),
    repoName: repoFullName,
    link: `${origin}/${repoFullName}/issues/${issueNumber}`,
    issue: {
      number: parseInt(issueNumber),
      title: issueTitle,
    },
  });
};
