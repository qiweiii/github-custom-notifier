export type CustomNotificationsV1 = {
  updatedAt: number;
  data: {
    [repoName: string]: {
      issuesOrPr: {
        [issueNumber: string]: {
          title: string;
          body: string;
          comments: {
            [commentId: string]: {
              body: string;
            };
          };
        };
      };
      prs: {
        [prNumber: string]: {
          title: string;
          body: string;
          comments: {
            [commentId: string]: {
              body: string;
            };
          };
        };
      };
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
