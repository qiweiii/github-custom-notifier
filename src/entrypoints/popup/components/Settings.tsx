import { useCallback, useEffect, useState } from 'react';
import { debounce } from '@mui/material/utils';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { Button, SxProps } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import useSettingsState from '@/src/lib/hooks/useSettingsState';
import { RepoSettingV1 } from '@/src/lib/storage/customNotificationSettings';
import { fetchLabels, searchRepos, searchUsers } from '@/src/lib/services-github';

function CustomSearchInput({
  id,
  handleChanged,
  handleSingleChanged,
  repoName,
  value,
  part,
  sx,
  multiple = false,
  disabled = false,
  placeholder = 'Search',
}: {
  id: string;
  handleChanged?: (value: string[]) => void;
  handleSingleChanged?: (value: string) => void;
  repoName?: string;
  value?: string[];
  part: 'labeled' | 'mentioned' | 'customCommented' | 'name';
  multiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
  sx?: SxProps;
}) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchOptions = useCallback(
    debounce(async (text: string) => {
      setLoading(true);
      if (part === 'name') {
        const data = await searchRepos(text);
        setOptions(data.items.map((repo) => repo.full_name));
      } else if (part === 'labeled') {
        const data = await fetchLabels(text);
        setOptions(data.map((label) => label.name));
      } else if (part === 'mentioned') {
        const data = await searchUsers(text);
        setOptions(data.items.map((user) => user.login));
      } else if (part === 'customCommented') {
        setOptions([text]);
      }
      setLoading(false);
    }, 400),
    []
  );

  useEffect(() => {
    if (!inputValue) {
      return;
    }

    fetchOptions(inputValue);
  }, [inputValue]);

  return (
    <Autocomplete
      multiple={multiple}
      // includeInputInList
      freeSolo
      id={id}
      size='small'
      aria-placeholder={placeholder}
      disabled={disabled}
      sx={{
        ...sx,
      }}
      value={value}
      loading={loading}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      noOptionsText='No Options'
      // on user input change, search
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      // on selected or value change
      onChange={(event, newValue, reason) => {
        if (!newValue) return;
        // only call changed callbacks when selected
        if (reason !== 'selectOption') return;

        if (!multiple && handleSingleChanged && !Array.isArray(newValue)) {
          handleSingleChanged(newValue);
        } else if (handleChanged && Array.isArray(newValue)) {
          handleChanged(newValue);
        }
      }}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip variant='outlined' label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant='filled'
          label={part[0].toUpperCase() + part.slice(1)}
          placeholder={placeholder}
        />
      )}
    />
  );
}

function RepoItem({
  repoName,
  settings,
  save,
  delete,
  handleChanged,
}: {
  repoName: string;
  settings?: RepoSettingV1;
  save: () => Promise<void>;
  delete: (name: string) => void;
  handleChanged: (settings: RepoSettingV1) => void;
}) {
  return (
    <Box
      sx={{
        padding: '8px',
        width: 320,
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      <label>
        <h4 style={{ margin: 0 }}>{repoName}</h4>
      </label>
      <Box
        sx={{
          mt: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          rowGap: '4px',
        }}
      >
        <CancelOutlinedIcon />
        <h5>Labeled</h5>
        <CustomSearchInput
          repoName={repoName}
          id={`gh-custom-notifier-labels-${repoName || ''}`}
          handleChanged={(labeled) => {
            handleChanged({
              mentioned: settings?.mentioned || [],
              customCommented: settings?.customCommented || [],
              labeled,
            });
          }}
          value={settings?.labeled}
          multiple
          part='labeled'
          placeholder='e.g. good first issue, help wanted'
          sx={{ ml: 2, width: '200px' }}
        />
      </Box>
      <Box
        sx={{
          mt: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          rowGap: '4px',
        }}
      >
        <h5>Mentioned</h5>
        <CustomSearchInput
          repoName={repoName}
          id={`gh-custom-notifier-mentions-${repoName || ''}`}
          handleChanged={(mentioned) => {
            handleChanged({
              labeled: settings?.labeled || [],
              customCommented: settings?.customCommented || [],
              mentioned,
            });
          }}
          value={settings?.mentioned}
          multiple
          part='mentioned'
          placeholder='e.g. qiweiii'
          sx={{ ml: 2, width: '200px' }}
        />
      </Box>
      <Box
        sx={{
          mt: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          rowGap: '4px',
        }}
      >
        <h5>Commented</h5>
        <CustomSearchInput
          repoName={repoName}
          id={`gh-custom-notifier-commented-${repoName || ''}`}
          handleChanged={(customCommented) => {
            handleChanged({
              labeled: settings?.labeled || [],
              mentioned: settings?.mentioned || [],
              customCommented,
            });
          }}
          value={settings?.customCommented}
          multiple
          part='customCommented'
          placeholder='e.g. urgent, important'
          sx={{ ml: 2, width: '200px' }}
        />
      </Box>
    </Box>
  );
}

export default function Settings() {
  const [settings, setSettings, save] = useSettingsState();
  const [repoNameInput, setRepoNameInput] = useState('');

  useEffect(() => {
    return () => {
      save(); // auto save on unmount
    };
  }, []);

  const valdiateRepoName = (name: string) => {
    if (name.includes('/')) {
      return true;
    }
    return false;
  };

  const addItem = (name: string) => {
    // if exists, do nothing
    if (Object.keys(settings.repos).includes(name)) return;

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

    // auto save
    save();
  };

  const deleteItem = (name: string) => {
    setSettings(({ repos }) => {
      const newRepos = { ...repos };
      delete newRepos[name];
      return {
        repos: newRepos,
      };
    });

    // auto save
    save();
  }

  return (
    <div>
      <Box
        sx={{
          mt: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CustomSearchInput
          id={`gh-custom-notifier-repo-name`}
          handleSingleChanged={(name) => setRepoNameInput(name)}
          part='name'
          placeholder='e.g. qiweiii/github-custom-notifier'
          sx={{
            width: '200px',
            mr: '12px',
          }}
        />
        <Button
          onClick={() => addItem(repoNameInput)}
          disabled={!valdiateRepoName(repoNameInput)}
          variant='outlined'
          sx={{ textTransform: 'none', padding: '8px' }}
        >
          Add Repository
        </Button>
      </Box>

      <Stack
        gap={1}
        sx={{
          mt: '16px',
          alignItems: 'center',
          maxHeight: '380px',
          overflowY: 'auto',
        }}
      >
        {Object.entries(settings.repos).map(([name, settings]) => (
          <RepoItem
            key={name}
            repoName={name}
            settings={settings}
            save={save}
            delete={deleteItem}
            handleChanged={(settings) => {
              setSettings(({ repos }) => ({
                repos: {
                  ...repos,
                  [name]: settings,
                },
              }));
              // auto save
              save();
            }}
          />
        ))}
      </Stack>
    </div>
  );
}
