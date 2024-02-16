import { useEffect, useMemo, useState } from "react";
import { debounce } from "@mui/material/utils";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";

import useSettingsState from "@/src/lib/hooks/useSettingsState";
import { RepoSettingV1 } from "@/src/lib/storage/customNotificationSettings";
import {
  fetchLabels,
  searchRepos,
  searchUsers,
} from "@/src/lib/services-github";

function CustomSearchInput({
  id,
  handleChanged,
  handleSingleChanged,
  repoName,
  value,
  part,
  multiple = false,
  disabled = false,
  placeholder = "Search",
}: {
  id: string;
  handleChanged?: (value: string[]) => void;
  handleSingleChanged?: (value: string) => void;
  repoName?: string;
  value?: string[];
  part: "labeled" | "mentioned" | "customCommented" | "name";
  multiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  const fetchOptions = useMemo(
    () =>
      debounce(async () => {
        if (part === "name") {
          const data = await searchRepos(inputValue);
          setOptions(data.items.map((repo) => repo.full_name));
        } else if (part === "labeled") {
          const data = await fetchLabels(inputValue);
          setOptions(data.map((label) => label.name));
        } else if (part === "mentioned") {
          const data = await searchUsers(inputValue);
          setOptions(data.items.map((user) => user.login));
        } else if (part === "customCommented") {
          setOptions([inputValue]);
        }
      }, 400),
    [part]
  );

  useEffect(() => {
    if (!repoName || !inputValue) {
      return;
    }

    fetchOptions();
  }, [inputValue]);

  return (
    <Autocomplete
      multiple={multiple}
      // includeInputInList
      freeSolo
      id={id}
      aria-placeholder={placeholder}
      disabled={disabled}
      // defaultValue={values}
      value={value}
      noOptionsText="No Options"
      // on user input change, search
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      // on selected or value change
      onChange={(event, newValue) => {
        if (!newValue) return;

        if (!multiple && handleSingleChanged && !Array.isArray(newValue)) {
          handleSingleChanged(newValue);
        } else if (handleChanged && Array.isArray(newValue)) {
          handleChanged(newValue);
        }
      }}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          label={part}
          placeholder="Search"
        />
      )}
    />
  );
}

function RepoItem({
  repoName,
  settings,
  save,
  handleChanged,
}: {
  repoName: string;
  settings?: RepoSettingV1;
  save: () => Promise<void>;
  handleChanged: (settings: RepoSettingV1) => void;
}) {
  return (
    <div>
      <label>
        <h4>{repoName}</h4>
      </label>
      <label>
        <h4>Labeled</h4>
        <CustomSearchInput
          repoName={repoName}
          id={`gh-custom-notifier-labels-${repoName || ""}`}
          handleChanged={(labeled) => {
            handleChanged({
              mentioned: settings?.mentioned || [],
              customCommented: settings?.customCommented || [],
              labeled,
            });
          }}
          value={settings?.labeled}
          multiple
          part="labeled"
          placeholder="e.g. good first issue, help wanted"
        />
      </label>
      <label>
        <h4>Mentioned</h4>
        <CustomSearchInput
          repoName={repoName}
          id={`gh-custom-notifier-mentions-${repoName || ""}`}
          handleChanged={(mentioned) => {
            handleChanged({
              labeled: settings?.labeled || [],
              customCommented: settings?.customCommented || [],
              mentioned,
            });
          }}
          value={settings?.mentioned}
          multiple
          part="mentioned"
          placeholder="e.g. qiweiii"
        />
      </label>
      <label>
        <h4>Commented (matched)</h4>
        <CustomSearchInput
          repoName={repoName}
          id={`gh-custom-notifier-commented-${repoName || ""}`}
          handleChanged={(customCommented) => {
            handleChanged({
              labeled: settings?.labeled || [],
              mentioned: settings?.mentioned || [],
              customCommented,
            });
          }}
          value={settings?.customCommented}
          multiple
          part="customCommented"
          placeholder="e.g. urgent, important"
        />
      </label>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings, save] = useSettingsState();
  const [repoNameInput, setRepoNameInput] = useState("");

  useEffect(() => {
    return () => {
      save(); // auto async save on unmount
    };
  }, []);

  const valdiateRepoName = (name: string) => {
    if (name.includes("/")) {
      return true;
    }
    return false;
  };

  const addItem = (name: string) => {
    setSettings(({ repos }) => ({
      repos: {
        ...repos,
        [name]: {
          labeled: [],
          mentioned: [],
          customCommented: [],
        },
      },
    }));
  };

  return (
    <div>
      {Object.entries(settings.repos).map(([name, settings]) => (
        <RepoItem
          key={name}
          repoName={name}
          settings={settings}
          save={save}
          handleChanged={(settings) => {
            setSettings(({ repos }) => ({
              repos: {
                ...repos,
                [name]: settings,
              },
            }));
          }}
        />
      ))}
      <label>
        <CustomSearchInput
          id={`gh-custom-notifier-repo-name`}
          handleSingleChanged={(name) => setRepoNameInput(name)}
          part="name"
          placeholder="e.g. qiweiii/github-custom-notifier"
        />
        <button
          onClick={() => addItem(repoNameInput)}
          disabled={!valdiateRepoName(repoNameInput)}
        >
          Add Item
        </button>
      </label>
    </div>
  );
}
