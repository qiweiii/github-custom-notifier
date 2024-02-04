export type OptionsPageStorageV1 = {
  token: string;
  rootUrl: string;
  /**
   * min is 2 to prevent exceed rate limit
   */
  interval: number;
  playNotifSound: boolean;
  showDesktopNotif: boolean;
};

const optionsStorage = storage.defineItem<OptionsPageStorageV1>(
  "local:optionsStorage",
  {
    defaultValue: {
      token: "",
      rootUrl: "https://api.github.com/",
      interval: 2,
      playNotifSound: false,
      showDesktopNotif: false,
    },
  }
);

export default optionsStorage;
