import { useEffect, useState } from "react";
import customNotifications, {
  CustomNotificationsV1,
} from "../storage/customNotifications";

export default function useNotifyItems() {
  const [state, setState] = useState<CustomNotificationsV1>({
    data: {},
    lastFetched: 0,
  });

  useEffect(() => {
    customNotifications.watch((value, oldValue) => {
      if (value) setState(value);
    });
  }, []);

  return state;
}
