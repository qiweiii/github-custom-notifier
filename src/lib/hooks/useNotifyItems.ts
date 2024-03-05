import { useEffect, useState } from 'react';
import customNotifications, { CustomNotificationsV1, NotifyItemV1 } from '../storage/customNotifications';

const getItems = (value: CustomNotificationsV1) => {
  const { data, lastFetched } = value;
  let unReadCount = 0;
  // let hasUpdatesAfterLastFetchedTime = false;
  const items: NotifyItemV1[] = [];
  for (const repoName in data) {
    const repoData = data[repoName];
    const notifyItems = repoData.notifyItems;
    for (const item of notifyItems) {
      unReadCount++;
      items.push(item);
      // if (item.createdAt > lastFetched) {
      //   hasUpdatesAfterLastFetchedTime = true;
      // }
    }
  }
  return items;
};

export default function useNotifyItems() {
  const [state, setState] = useState<NotifyItemV1[]>([]);

  useEffect(() => {
    customNotifications
      .getValue()
      .then((value) => {
        if (value) setState(getItems(value));
      })
      .then(() => {
        customNotifications.watch((value, oldValue) => {
          if (value) {
            setState(getItems(value));
          }
        });
      });
  }, []);

  return state;
}
