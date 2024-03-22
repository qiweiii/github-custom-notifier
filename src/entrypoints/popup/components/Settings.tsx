import { useCallback, useEffect, useState } from 'react';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { debounce } from '@mui/material/utils';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import { Button, SxProps, styled } from '@mui/material';

import useSettings from '@/src/lib/hooks/useSettings';
import { RepoSettingV1 } from '@/src/lib/storage/customNotificationSettings';
import { fetchLabels, searchRepos, searchUsers } from '@/src/lib/services-github';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...(props || {})} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...(props || {})} />
))(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, .05)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

const CssTextField = styled(TextField)`
  label.Mui-focused {
    color: #a0aab4;
  }
  label.MuiInputLabel-root {
    font-size: 14px;
  }
  .MuiInput-underline:after {
    border-bottom-color: #b2bac2;
  }
  .MuiFilledInput-root {
    font-size: 12px;
  }
`;

function CustomSearchInput({
  id,
  handleSelected,
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
  handleSelected?: (value: string[]) => void;
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

  const labelText = {
    labeled: 'Labeled',
    mentioned: 'Mentioned',
    customCommented: 'Commented',
    name: 'Search',
  }[part];

  const fetchOptions = useCallback(
    debounce(async (text: string) => {
      setLoading(true);
      if (part === 'name') {
        const data = await searchRepos(text);
        setOptions(data.items.map((repo) => repo.full_name));
      } else if (part === 'labeled') {
        const data = await fetchLabels(repoName || '');
        setOptions(data.map(({ name }) => name) || []);
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
    setOptions([]);

    if (!inputValue) {
      fetchOptions.clear();
      setLoading(false);
      return;
    }

    fetchOptions(inputValue);
  }, [inputValue]);

  return (
    <Autocomplete
      multiple={multiple}
      includeInputInList
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
      onFocus={() => {
        setOpen(true);
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
        if (reason === 'selectOption') {
          // only call changed callbacks when selected
          if (multiple && handleSelected && Array.isArray(newValue)) {
            // multiple select
            handleSelected(newValue);
          } else if (handleSingleChanged && !Array.isArray(newValue)) {
            // single select
            handleSingleChanged(newValue);
          }
        } else if (reason === 'removeOption') {
          if (multiple && handleSelected && Array.isArray(newValue)) {
            handleSelected(newValue);
          } else if (handleSingleChanged) {
            handleSingleChanged('');
          }
        } else if (reason === 'clear') {
          if (multiple && handleSelected) {
            handleSelected([]);
          } else if (handleSingleChanged) {
            handleSingleChanged('');
          }
        }
      }}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip variant='outlined' size='small' label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <CssTextField {...params} size={params.size} variant='filled' label={labelText} placeholder={placeholder} />
      )}
    />
  );
}

function RepoItem({
  repoName,
  settings,
  deleteItem,
  handleChange,
}: {
  repoName: string;
  settings?: RepoSettingV1;
  deleteItem: (name: string) => void;
  handleChange: (settings: Omit<RepoSettingV1, 'createdAt'>) => void;
}) {
  return (
    <Accordion
      sx={{
        'h5,h6': {
          margin: 0,
        },
      }}
    >
      <AccordionSummary aria-controls={`${repoName}-content`} id={`${repoName}-header`}>
        <h5>{repoName}</h5>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          mb: '8px',
        }}
      >
        <CancelOutlinedIcon
          onClick={() => deleteItem(repoName)}
          sx={{ position: 'absolute', top: '12px', right: '12px', cursor: 'pointer' }}
        />
        <Box
          sx={{
            mt: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            rowGap: '4px',
          }}
        >
          <h5>Labeled</h5>
          <CustomSearchInput
            repoName={repoName}
            id={`gh-custom-notifier-labels-${repoName || ''}`}
            handleSelected={(labeled) => {
              handleChange({
                mentioned: settings?.mentioned || [],
                customCommented: settings?.customCommented || [],
                labeled,
              });
            }}
            value={settings?.labeled}
            multiple
            part='labeled'
            placeholder='e.g. good first issue, help wanted'
            sx={{ ml: 2, width: '205px' }}
          />
        </Box>
        <Box
          sx={{
            mt: '8px',
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
            handleSelected={(mentioned) => {
              handleChange({
                labeled: settings?.labeled || [],
                customCommented: settings?.customCommented || [],
                mentioned,
              });
            }}
            value={settings?.mentioned}
            multiple
            part='mentioned'
            placeholder='e.g. qiweiii'
            sx={{ ml: 2, width: '205px' }}
          />
        </Box>
        <Box
          sx={{
            mt: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            rowGap: '4px',
          }}
        >
          <h5 style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Commented {/* <span> */}
            <Tooltip
              title={`Use * to match any text`}
              arrow
              placement='top'
              sx={{
                fontSize: 12,
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: '0.9rem' }} />
            </Tooltip>
            {/* </span> */}
          </h5>
          <CustomSearchInput
            repoName={repoName}
            id={`gh-custom-notifier-commented-${repoName || ''}`}
            handleSelected={(customCommented) => {
              handleChange({
                labeled: settings?.labeled || [],
                mentioned: settings?.mentioned || [],
                customCommented,
              });
            }}
            value={settings?.customCommented}
            multiple
            part='customCommented'
            placeholder='e.g. urgent, important'
            sx={{ ml: 2, width: '205px' }}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default function Settings() {
  const [repoNameInput, setRepoNameInput] = useState('');
  const [openAlert, setOpenAlert] = useState(false);
  const [settings, setSettings] = useSettings({ onSave: () => setOpenAlert(true) });

  const valdiateRepoName = (name: string) => {
    if (name.includes('/')) {
      return true;
    }
    return false;
  };

  const addItem = (name: string) => {
    if (!settings) return;
    // if exists, do nothing
    if (Object.keys(settings.repos).includes(name)) return;

    setSettings((settings) => ({
      repos: {
        ...settings?.repos,
        [name]: {
          labeled: [],
          mentioned: [],
          customCommented: [],
          createdAt: Date.now(),
        },
      },
    }));
  };

  const deleteItem = (name: string) => {
    if (!settings) return;
    setSettings((settings) => {
      const newRepos = { ...settings?.repos };
      delete newRepos[name];
      return {
        repos: newRepos,
      };
    });
  };

  return (
    <div>
      <Box
        sx={{
          my: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openAlert}
          onClose={() => setOpenAlert(false)}
          autoHideDuration={3000}
        >
          <Alert onClose={() => setOpenAlert(false)} severity='success' variant='filled' sx={{ width: '80%' }}>
            Saved! 🎉 (Applies to Future Updates)
          </Alert>
        </Snackbar>

        <CustomSearchInput
          id={`gh-custom-notifier-repo-name`}
          handleSingleChanged={(name) => setRepoNameInput(name)}
          part='name'
          placeholder='e.g. qiweiii/github-custom-notifier'
          sx={{
            width: '200px',
            mr: '10px',
          }}
        />
        <Button
          onClick={() => addItem(repoNameInput)}
          disabled={!valdiateRepoName(repoNameInput)}
          variant='outlined'
          sx={{ textTransform: 'none', padding: '8px', fontSize: 14 }}
        >
          Add Repository
        </Button>
      </Box>

      {Object.entries(settings?.repos || {})
        .sort((a, b) => a[1].createdAt - b[1].createdAt)
        .map(([repoName, settings]) => (
          <RepoItem
            key={repoName}
            repoName={repoName}
            settings={settings}
            deleteItem={deleteItem}
            handleChange={(settings) => {
              setSettings((prevState) => {
                if (!prevState) return prevState;
                return {
                  ...prevState,
                  repos: {
                    ...prevState.repos,
                    [repoName]: {
                      ...prevState.repos[repoName],
                      ...settings,
                    },
                  },
                };
              });
            }}
          />
        ))}
    </div>
  );
}
