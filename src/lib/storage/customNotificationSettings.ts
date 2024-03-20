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
  /**
   * Timestamp when this setting was created by user
   */
  createdAt: number;
};

export type CustomNotificationSettingsV1 = {
  /**
   * { repoFullName: RepoSetting, ... }
   */
  repos: Record<string, RepoSettingV1>;
};

const customNotificationSettings = storage.defineItem<CustomNotificationSettingsV1>(
  'local:customNotificationSettings',
  {
    defaultValue: {
      repos: {},
    },
  }
);

export default customNotificationSettings;
