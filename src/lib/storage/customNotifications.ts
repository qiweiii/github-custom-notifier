/**
 * Store info related to notification list in popup.
 *
 * Only matched events will be stored in this storage.
 * Item will be removed when open item in new page or on mark read
 */

import { renderCount } from '../services-ext';
import { logger } from '../util';

/**
 * @deprecated - event based notification item is btter
 */
type IssueOrPrV1 = {
  number: number;
  isPr: boolean;
  title: string;
  body?: string;
  assignees?: {
    name: string;
    avatar_url: string;
  }[];
  labels?: {
    name: string;
  }[];
  comments?: {
    [id: string]: {
      body: string;
    };
  };
  review_comments?: {
    [id: string]: {
      body: string;
    };
  };
  status: string;
  // notification management fields👇
  read: {
    value: boolean;
    updatedAt: string;
  };
  muted: {
    value: boolean;
    updatedAt: string;
  };
};

/**
 * Event based nofitication item
 */
export type NotifyItemV1 = {
  id: string;
  /**
   * See GitHub issue event types: <https://docs.github.com/en/rest/using-the-rest-api/issue-event-types?apiVersion=2022-11-28>
   */
  eventType: string;
  /**
   * reason of notification to be displayed
   */
  reason: string;
  /**
   * The real created/updated time based on Github event
   */
  createdAt: number;
  /**
   * Repo full name
   */
  repoName: string;
  /**
   * link to comment, label, mention etc
   */
  link: string;
  issue: {
    number: number;
    /**
     * Note that this could be empty string ''
     */
    title: string;
  };
  // Don't need a `read` field anymore since all notifications are unread, read ones are removed
  // read: {
  //   value: boolean;
  //   updatedAt: string;
  // };
};

export type CustomNotificationsV1 = {
  lastFetched: number;
  readItemIn24Hrs:
    | {
        id: string;
        readAt: number;
      }[]
    | undefined;
  data: {
    [repoName: string]: {
      notifyItems: NotifyItemV1[];
    };
  };
};

const customNotifications = storage.defineItem<CustomNotificationsV1>('local:customNotifications', {
  defaultValue: {
    lastFetched: 0,
    readItemIn24Hrs: [],
    data: {},
  },
});

/**
 * Save notification item by repo.
 * Deduplication is handled in this functions, if item already exists then it will be replaced.
 */
export const saveNotifyItemByRepo = async (repoName: string, notifyItem: NotifyItemV1) => {
  const { data, lastFetched, readItemIn24Hrs } = await customNotifications.getValue();
  if (!data[repoName]) {
    data[repoName] = {
      notifyItems: [],
    };
  }

  // marked read (removed) item in 24 hours should be ignored
  if (readItemIn24Hrs?.some((item) => item.id === notifyItem.id)) {
    return;
  }

  // Deduplication
  const notifyItems = data[repoName].notifyItems;
  const index = notifyItems.findIndex((item) => item.id === notifyItem.id);
  if (index !== -1) {
    notifyItems[index] = notifyItem;
  } else {
    notifyItems.push(notifyItem);
  }

  logger.info({ data }, `[storage:customNotifications] Saved notification item by repo: ${repoName}`);

  // Finally save
  await customNotifications.setValue({ data, lastFetched, readItemIn24Hrs });
};

/**
 * Remove notification item by id.
 */
export const removeNotifyItemById = async (notifyItemId: string) => {
  const { data, readItemIn24Hrs } = await customNotifications.getValue();
  for (const repoName in data) {
    const notifyItems = data[repoName].notifyItems;
    const index = notifyItems.findIndex((item) => item.id === notifyItemId);
    if (index !== -1) {
      notifyItems.splice(index, 1);
      break;
    }
  }

  const updatedReadArray =
    readItemIn24Hrs?.slice().filter((item) => item.readAt > Date.now() - 24 * 60 * 60 * 1000) || [];
  updatedReadArray.push({ id: notifyItemId, readAt: Date.now() });

  logger.info({ data }, `[storage:customNotifications] Removed notification item by id: ${notifyItemId}`);

  await customNotifications.setValue({ data, lastFetched: Date.now(), readItemIn24Hrs: updatedReadArray });

  // side effect to update unread cound on extension badge
  const { unReadCount } = await getUnreadInfo();
  renderCount(unReadCount);
};

/**
 * Get unread info from storage.
 */
export const getUnreadInfo = async () => {
  const { lastFetched, data } = await customNotifications.getValue();
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
  logger.info(
    {
      unReadCount,
      hasUpdatesAfterLastFetchedTime,
      items,
    },
    '[storage:customNotifications] Get unread info'
  );
  return { unReadCount, hasUpdatesAfterLastFetchedTime, items };
};

export default customNotifications;
