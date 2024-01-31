/**
 * Store info related to notification list in popup.
 *
 * Only matched events will be stored in this storage.
 * Item will be removed when open item in new page or on mark read
 */

/**
 * @deprecated - event based notification item is btter
 */
type IssueOrPr = {
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
export type NotifyItem = {
  /**
   * See GitHub issue event types: <https://docs.github.com/en/rest/using-the-rest-api/issue-event-types?apiVersion=2022-11-28>
   */
  eventType: string;
  /**
   * reason of notification to be displayed
   */
  reason: string;
  time: string;
  repoName: string;
  /**
   * link to comment, label, mention etc
   */
  eventLink: string;
  issue: {
    number: number;
    title: string;
  };
};

export type CustomNotificationsV1 = {
  updatedAt: number;
  data: {
    [repoName: string]: {
      notifyItems: NotifyItem[];
      // last time we fetched events from this repo
      lastFetched: number;
    }[];
  }[];
};

const customNotifications = storage.defineItem<CustomNotificationsV1>(
  "local:customNotifications",
  {
    defaultValue: {
      updatedAt: 0,
      data: [],
    },
  }
);

export default customNotifications;
