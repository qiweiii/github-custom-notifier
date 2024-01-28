export type CustomNotificationSettingsV1 = {
  repos: {
    repoName: string;
    labelssToListen: string[]; // good-first-issue, help wanted, etc
    atToListen: string[]; // @username
    textToListen: string[]; // XXComponent, urgent, etc
  }[];
};

const customNotificationSettings =
  storage.defineItem<CustomNotificationSettingsV1>(
    "local:customNotificationSettings",
    {
      defaultValue: {
        repos: [],
      },
    }
  );

export default customNotificationSettings;
