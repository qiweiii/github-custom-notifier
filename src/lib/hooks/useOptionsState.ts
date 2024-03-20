import { useState, useEffect } from 'react';
import optionsStorage, { OptionsPageStorageV1 } from '../storage/options';
import { logger, getApiUrl } from '../util';
import { requestPermission } from '../services-ext';

export default function useOptionsState() {
  const [state, setState] = useState<OptionsPageStorageV1>({
    token: '',
    rootUrl: '',
    interval: 2,
    playNotifSound: false,
    showDesktopNotif: false,
  });

  useEffect(() => {
    optionsStorage.getValue().then((value) => {
      if (value) setState(value);
    });
    optionsStorage.watch((value, oldValue) => {
      if (value) setState(value);
    });
  }, []);

  const save = async () => {
    logger.info({ state }, '[options page] Saving options');
    await optionsStorage.setValue({
      ...state,
      token: state.token?.trim(),
      interval: state.interval || 2,
      rootUrl: getApiUrl(state.rootUrl || 'https://github.com'),
    });

    if (state.showDesktopNotif) {
      requestPermission('notifications');
    }
  };

  return [state, setState, save] as const;
}
