export function playNotificationSound() {
  const audio = new Audio();
  audio.src = browser.runtime.getURL("/bell.ogg");
  audio.play();
}
