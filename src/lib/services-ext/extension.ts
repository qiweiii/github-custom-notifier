import { NotifyItemV1 } from "../storage/customNotifications";
import { queryPermission } from "./permissions";
import { openTab } from "./tabs";

export function playNotificationSound() {
  const audio = new Audio();
  audio.src = browser.runtime.getURL("/bell.ogg");
  audio.play();
}

export async function closeNotification(notificationId: string) {
  return browser.notifications.clear(notificationId);
}

export async function openNotification(notificationId: string) {
  const notifyItem = await storage.getItem<NotifyItemV1>(notificationId);
  await closeNotification(notificationId);
  await removeNotification(notificationId);

  if (notifyItem) {
    return openTab(notifyItem.link);
  }
}

export async function removeNotification(notificationId: string) {
  await storage.removeItem(notificationId);
}

export function getNotificationObject(notifyItem: NotifyItemV1) {
  return {
    title: notifyItem.reason,
    iconUrl: browser.runtime.getURL("/icon/128.png"),
    type: "basic" as "basic",
    message: notifyItem.repoName,
    contextMessage: `${notifyItem.issue.title} ${notifyItem.issue.title}`,
  };
}

export async function showNotifications(notifyItems: NotifyItemV1[]) {
  const permissionGranted = await queryPermission("notifications");
  if (!permissionGranted) {
    return;
  }

  for (const notification of notifyItems) {
    const notificationId = `local:GH-CUSTOM-NOTIFIER-${notification.id}`;
    const notificationObject = getNotificationObject(notification);

    await browser.notifications.create(notificationId, notificationObject);
    await storage.setItem(notificationId, notification);

    await delay(50);
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
