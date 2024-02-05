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
      {/* TODO: rmb set a tooltip to these options on which browser permission is required */}
    </div>
  );
}

export default App;
