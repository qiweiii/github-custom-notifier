export type OptionsPageStorageV1 = {
  token: string;
  /**
   * This is GitHub Origin url, not API url, use `getApiUrl()` to get api url
   */
  rootUrl: string;
  /**
   * min is 2 to prevent exceed rate limit
   */
  interval: number;
  playNotifSound: boolean;
  showDesktopNotif: boolean;
};

const optionsStorage = storage.defineItem<OptionsPageStorageV1>('local:optionsStorage', {
  defaultValue: {
    token: '',
    rootUrl: 'https://github.com',
    interval: 2,
    playNotifSound: false,
    showDesktopNotif: false,
  },
});

export default optionsStorage;
