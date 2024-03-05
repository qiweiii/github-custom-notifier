/**
 * Store info related to notification list in popup.
 *
 * Only matched events will be stored in this storage.
 * Item will be removed when open item in new page or on mark read
 */

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
  data: {
    [repoName: string]: {
      notifyItems: NotifyItemV1[];
    };
  };
};

const customNotifications = storage.defineItem<CustomNotificationsV1>('local:customNotifications', {
  defaultValue: {
    lastFetched: 0,
    data: {},
  },
});

/**
 * Save notification item by repo.
 * Deduplication is handled in this functions, if item already exists then it will be replaced.
 */
export const saveNotifyItemByRepo = async (repoName: string, notifyItem: NotifyItemV1) => {
  const { data, lastFetched } = await customNotifications.getValue();
  if (!data[repoName]) {
    data[repoName] = {
      notifyItems: [],
    };
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
  await customNotifications.setValue({ data, lastFetched });
};

/**
 * Remove notification item by id.
 */
export const removeNotifyItemById = async (notifyItemId: string) => {
  const { data } = await customNotifications.getValue();
  for (const repoName in data) {
    const notifyItems = data[repoName].notifyItems;
    const index = notifyItems.findIndex((item) => item.id === notifyItemId);
    if (index !== -1) {
      notifyItems.splice(index, 1);
      break;
    }
  }

  logger.info({ data }, `[storage:customNotifications] Removed notification item by id: ${notifyItemId}`);

  await customNotifications.setValue({ data, lastFetched: Date.now() });
};

export default customNotifications;
