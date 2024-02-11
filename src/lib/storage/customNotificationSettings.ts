export type RepoSettingV1 = {
  /**
   * Notify when someone labeled [good-first-issue, help-wanted, etc]
   */
  labeled: string[];
  /**
   * Notify when someone mentioned [username, xyz, etc], usernames without `@`
   */
  mentioned: string[]; // @username, @xyz
  /**
   * Notify when someone commented with [urgent, qiwei-yang, etc]
   * Here, 'custom' means it it not GitHub's default event `commented` event type.
   */
  customCommented: string[]; // text to match in comment body: XXComponent, urgent, etc
};

export type CustomNotificationSettingsV1 = {
  /**
   * { repoFullName: RepoSetting, ... }
   */
  repos: Record<string, RepoSettingV1>;
};

const customNotificationSettings =
  storage.defineItem<CustomNotificationSettingsV1>(
    "local:customNotificationSettings",
    {
      defaultValue: {
        repos: {
          // FIXME: This is just for testing, it should be empty by default
          "qiweiii/github-custom-notifier": {
            labeled: ["good-first-issue", "help-wanted"],
            mentioned: ["qiweiii"],
            customCommented: ["urgent"],
          },
        },
      },
    }
  );

export default customNotificationSettings;
