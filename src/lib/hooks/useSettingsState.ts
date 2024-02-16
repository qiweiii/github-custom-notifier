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
    // filter out empty repo names
    const repos = Object.fromEntries(
      Object.entries(state.repos).filter(([repoName]) => repoName)
    );
    logger.info(
      { repos: repos },
      "[popup page] Saving custom notification settings"
    );
    await customNotificationSettings.setValue({ repos });
  };

  return [state, setState, save] as const;
}
