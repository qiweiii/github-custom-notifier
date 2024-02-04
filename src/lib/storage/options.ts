export type OptionsPageStorageV1 = {
  token: string;
  rootUrl: string;
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
