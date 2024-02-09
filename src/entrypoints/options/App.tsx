import { useEffect, useState } from "react";
import optionsStorage, {
  OptionsPageStorageV1,
} from "@/src/lib/storage/options";
import { getApiUrl } from "@/src/lib/util";
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
    console.log("Saving options", state);
    await optionsStorage.setValue({
      ...state,
      token: state.token?.trim(),
      interval: state.interval || 2,
      rootUrl: getApiUrl(state.rootUrl || "https://github.com"),
    });
  };

  return (
    <div className="text-left">
      <section>
        <div className="flex justify-between">
          <h3 className="text-xl">API Access</h3>
          <a
            href="https://github.com/qiweiii/github-custom-notifier/tree/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source Code
          </a>
        </div>

        <label>
          <h4 className="text-lg my-2">Root URL</h4>
          <input
            className="w-96 border text-sm rounded-md block p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-180 focus:ring-blue-500 focus:border-blue-500"
            type="url"
            name="rootUrl"
            placeholder="e.g. https://github.yourco.com"
            value={state.rootUrl}
            onChange={(e) => {
              setState((state) => ({ ...state, rootUrl: e.target.value }));
            }}
          />
        </label>
        <p>
          Specify the root URL to your GitHub Enterprise (defaults to
          https://github.com)
        </p>

        <label>
          <h4 className="text-lg my-2">
            Token (<span className="text-red-500">required</span>)
          </h4>
          <input
            className="w-96 border text-sm rounded-md block p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-180 focus:ring-blue-500 focus:border-blue-500"
            type="text"
            name="token"
            placeholder="ghp_a1b2c3d4e5f6g7h8i9j0a1b2c3d4e5f6g7h8"
            pattern="[\da-f]{40}|ghp_\w{36,251}"
            spellCheck="false"
            required
            value={state.token}
            onChange={(e) => {
              setState((state) => ({ ...state, token: e.target.value }));
            }}
          />
        </label>
        <p>
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=GitHub Custom Notifier extension"
            target="_blank"
          >
            Create a token
          </a>{" "}
          with the <strong>repo</strong> permission.
        </p>
      </section>

      <hr className="my-5" />

      <section>
        <h3 className="text-xl my-2">Polling Interval</h3>
        <label>
          Get data every{" "}
          <input
            className="w-12 border text-sm rounded-md p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            type="number"
            name="interval"
            min="2"
            max="60"
            value={state.interval}
            onChange={(e) => {
              setState((state) => ({
                ...state,
                interval: parseInt(e.target.value, 10),
              }));
            }}
          />{" "}
          minutes (defaults to 2 minutes)
        </label>
      </section>

      <section>
        <h3 className="text-xl my-2">Notifications</h3>
        <label className="flex items-center">
          <input
            className="w-10 border text-sm rounded-md p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            type="checkbox"
            name="showDesktopNotif"
            data-request-permission="notifications"
            checked={state.showDesktopNotif}
            onChange={(e) => {
              setState((state) => ({
                ...state,
                showDesktopNotif: e.target.checked,
              }));
            }}
          />
          Show desktop notifications
        </label>
        <label className="flex items-center">
          <input
            className="w-10 border text-sm rounded-md p-1.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            type="checkbox"
            name="playNotifSound"
            checked={state.playNotifSound}
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

      <hr className="my-5" />

      <section>
        <h3 className="text-xl">Buy Me a Coffee!</h3>
        <p>
          If you like this extension, consider buying me a coffee. Your support
          will help me to continue maintaining this extension for{" "}
          <strong>free</strong>.
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

      <hr className="my-5" />

      <p>
        Please save and click on Github Custom Notifier icon in the browser
        toolbar to configure which repos to receive notifications from.
      </p>

      <button
        onClick={onSave}
        disabled={!state.token}
        className={`mt-5 ${
          state.token ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
        Save
      </button>
    </div>
  );
}

export default App;
