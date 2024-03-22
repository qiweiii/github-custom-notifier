chrome.runtime.onMessage.addListener((msg) => {
  if ('play' in msg) playAudio(msg.play);
});

// Play sound with access to DOM APIs
function playAudio({ source, volume }) {
  const audio = new Audio(source);
  audio.volume = volume;
  audio.play();
}
