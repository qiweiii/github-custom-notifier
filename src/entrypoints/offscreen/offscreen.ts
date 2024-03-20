export default defineUnlistedScript(() => {
  // Listen for messages from the extension
  browser.runtime.onMessage.addListener((msg) => {
    if ('play' in msg) playAudio(msg.play);
  });

  // Play sound with access to DOM APIs
  function playAudio({ source, volume }: any) {
    const audio = new Audio(source);
    audio.volume = volume;
    audio.play();
  }
});
