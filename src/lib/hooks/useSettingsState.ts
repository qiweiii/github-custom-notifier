import { useState, useEffect } from "react";
import { logger } from "../util";
import customNotificationSettings, {
  CustomNotificationSettingsV1,
} from "../storage/customNotificationSettings";

export default function useSettingsState() {
  const [state, setState] = useState<CustomNotificationSettingsV1>({
    repos: {},
  });

  useEffect(() => {
    customNotificationSettings.getValue().then((value) => {
      if (value) setState(value);
    });
    customNotificationSettings.watch((value, oldValue) => {
      if (value) setState(value);
    });
  }, []);

  const save = async () => {
    logger.info({ state }, "[popup page] Saving custom notification settings");
    await customNotificationSettings.setValue(state);
  };

  return [state, setState, save] as const;
}
