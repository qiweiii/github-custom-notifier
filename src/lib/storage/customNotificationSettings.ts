export type CustomNotificationSettingsV1 = {
  repos: {
    repoName: string;
    /**
     * Notify when someone labeled [good-first-issue, help-wanted, etc]
     */
    labeled: string[];
    /**
     * Notify when someone mentioned [username, xyz, etc]
     */
    mentioned: string[]; // @username, @xyz
    /**
     * Notify when someone commented with [urgent, qiwei-yang, etc]
     */
    commented: string[]; // text to match in comment body: XXComponent, urgent, etc
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
