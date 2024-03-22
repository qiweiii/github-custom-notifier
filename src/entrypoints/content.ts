// The main purposr of this content script is to wake up background service worker
// when user re-login or re-open the browser.
export default defineContentScript({
  matches: ['<all_urls>'],

  main(ctx) {
    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      onMount: (container) => {
        const intervalId = setInterval(() => {
          try {
            if (!browser.runtime?.id) {
              // The extension was reloaded and this script is orphaned
              clearInterval(intervalId);
              return;
            }
            browser.runtime.sendMessage({ type: 'ping' });
          } catch (e) {}
        }, 10000);
      },
    });

    // Call mount to add the UI to the DOM
    ui.mount();
  },
});
