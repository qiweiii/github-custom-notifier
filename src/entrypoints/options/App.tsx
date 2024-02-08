import { useEffect, useState } from "react";
import optionsStorage, {
  OptionsPageStorageV1,
} from "@/src/lib/storage/options";
import "./App.css";

function App() {
  const [state, setState] = useState<OptionsPageStorageV1>({
    token: "",
    rootUrl: "",
    interval: 2,
    playNotifSound: false,
    showDesktopNotif: true,
  });

  useEffect(() => {
    optionsStorage.getValue().then((value) => {
      setState(value);
    });
  }, []);

  const onSave = async () => {
    await optionsStorage.setValue(state);
  };

  return (
    <div>
      <section>
        <h3>API Access</h3>

        <label>
          <h4>Root URL</h4>
          <input
            type="url"
            name="rootUrl"
            placeholder="e.g. https://github.yourco.com/"
            onChange={(e) => {
              setState((state) => ({ ...state, rootUrl: e.target.value }));
            }}
          />
        </label>
        <p className="text-sm">
          Specify the root URL to your GitHub Enterprise (leave this blank if
          you are not using GitHub Enterprise).
        </p>

        <label>
          <h4>Token</h4>
          <input
            type="text"
            name="token"
            placeholder="ghp_a1b2c3d4e5f6g7h8i9j0a1b2c3d4e5f6g7h8"
            pattern="[\da-f]{40}|ghp_\w{36,251}"
            spellCheck="false"
            onChange={(e) => {
              setState((state) => ({ ...state, token: e.target.value }));
            }}
          />
        </label>
        <p className="text-sm">
          <a
            href="https://github.com/settings/tokens/new?scopes=notifications&description=GitHub Custom Notifier extension"
            target="_blank"
          >
            Create a token
          </a>{" "}
          with the <strong>repo</strong> permission.
        </p>
      </section>

      <hr />

      <section>
        <h3>Polling Interval</h3>
        <label>
          <input
            type="number"
            name="interval"
            min="2"
            max="60"
            onChange={(e) => {
              setState((state) => ({
                ...state,
                interval: parseInt(e.target.value, 10),
              }));
            }}
          />
          minutes (Get data every n minutes, default is 2 minutes)
        </label>
      </section>

      <hr />

      <section>
        <h3>Notifications</h3>
        <label>
          <input
            type="checkbox"
            name="showDesktopNotif"
            data-request-permission="notifications"
            onChange={(e) => {
              setState((state) => ({
                ...state,
                showDesktopNotif: e.target.checked,
              }));
            }}
          />
          Show desktop notifications
        </label>
        <label>
          <input
            type="checkbox"
            name="playNotifSound"
            onChange={(e) => {
              setState((state) => ({
                ...state,
                playNotifSound: e.target.checked,
              }));
            }}
          />
          Enable notification sound
        </label>
      </section>

      <hr />

      <section>
        <h3>Buy Me a Coffee!</h3>
        <p>
          If you like this extension, consider buying me a coffee. Your support
          will help me to continue maintaining this extension for free.
        </p>
        <a
          href="https://www.buymeacoffee.com/qiwei"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me A Coffee"
            style={{ width: "150px" }}
          />
        </a>
      </section>

      <hr />

      <p>
        Please save and click on Github Custom Notifier icon in the browser
        toolbar to configure which repos to receive notifications from.
      </p>
      <button onClick={onSave}>Save</button>
    </div>
  );
}

export default App;
