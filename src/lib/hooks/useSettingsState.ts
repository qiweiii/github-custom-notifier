import { useState, useEffect, useCallback } from 'react';
import { logger } from '../util';
import customNotificationSettings, { CustomNotificationSettingsV1 } from '../storage/customNotificationSettings';

/**
 * Settings hook with auto saving
 */
export default function useSettings() {
  const [state, setState] = useState<CustomNotificationSettingsV1 | null>(null);

  useEffect(() => {
    customNotificationSettings.getValue().then((value) => {
      if (value) setState(value);
    });
    // customNotificationSettings.watch((value, oldValue) => {
    //   if (value) setState(value);
    // });
  }, []);

  const save = useCallback(async (state: CustomNotificationSettingsV1) => {
    // filter out empty repo names
    const repos = Object.fromEntries(Object.entries(state.repos).filter(([repoName]) => repoName));
    logger.info({ repos: repos }, '[popup page] Saving custom notification settings');
    await customNotificationSettings.setValue({ repos });
  }, []);

  // auto save
  useEffect(() => {
    if (state) save(state);
  }, [state, save]);

  return [state, setState, save] as const;
}
