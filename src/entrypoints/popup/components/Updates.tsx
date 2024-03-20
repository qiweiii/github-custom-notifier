import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { openTab } from '@/src/lib/services-ext';
import { removeNotifyItemById } from '@/src/lib/storage/customNotifications';
import useNotifyItems from '@/src/lib/hooks/useNotifyItems';

const mapEventTypeToColor: { [event: string]: string } = {
  labeled: '#4caf50',
  'custom-commented': '#ff9800',
  mentioned: '#2196f3',
};

const mapEventTypeToText: { [event: string]: string } = {
  labeled: 'Labeled',
  'custom-commented': 'Commented',
  mentioned: 'Mentioned',
};

export default function Updates({ setTabIdx }: { setTabIdx: (idx: number) => void }) {
  const notifyItems = useNotifyItems();

  return (
    <>
      {notifyItems.length === 0 ? (
        <Box
          sx={{
            width: '100%',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <p>No updates</p>
          <Button size='small' variant='contained' onClick={() => setTabIdx(1)} sx={{ textTransform: 'none' }}>
            Go to Settings
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            mt: '4px',
            p: '2px',
            maxHeight: '450px',
            overflowY: 'auto',
          }}
        >
          {notifyItems.map((item) => (
            <Box
              key={item.id}
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                p: '8px',
                border: '1px solid #333',
                borderRadius: '4px',
                cursor: 'pointer',
                ':hover': {
                  backgroundColor: '#333',
                },
              }}
            >
              <Button
                size='small'
                variant='outlined'
                onClick={(e) => {
                  removeNotifyItemById(item.id);
                  e.stopPropagation();
                }}
                sx={{
                  position: 'absolute',
                  textTransform: 'none',
                  fontSize: '0.7rem',
                  right: '4px',
                  top: '4px',
                }}
              >
                Mark Read
              </Button>

              <Tooltip
                title={`Open and mark as read`}
                arrow
                key={item.id}
                placement='top'
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, -18],
                        },
                      },
                    ],
                  },
                }}
              >
                <Box
                  key={item.id}
                  onClick={async () => {
                    await removeNotifyItemById(item.id);
                    openTab(item.link);
                  }}
                >
                  <Stack direction='row' spacing={1} alignItems='center'>
                    {/* A badge for event type */}
                    <Chip
                      label={mapEventTypeToText[item.eventType]}
                      sx={{
                        color: mapEventTypeToColor[item.eventType],
                        width: 'fit-content',
                        fontSize: 11,
                        height: 20,
                      }}
                      size='small'
                      variant='filled'
                    />
                    {/* Time */}
                    <Typography sx={{ fontSize: 11, color: '#9f9f9f' }}>
                      {new Date(item.createdAt).toLocaleDateString() +
                        '  ' +
                        new Date(item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </Typography>
                  </Stack>

                  {/* Repo name */}
                  <Typography
                    sx={{
                      fontSize: 12,
                      textDecoration: 'underline',
                      display: 'inline',
                    }}
                  >
                    {item.repoName}
                  </Typography>

                  {/* Issue title / number */}
                  <Typography sx={{ fontSize: 12, fontStyle: 'italic' }}>
                    {item.issue.title}
                    <Typography component='span' sx={{ fontSize: 12, color: '#9f9f9f', display: 'inline' }}>
                      {' '}
                      <strong>#{item.issue.number}</strong>
                    </Typography>
                  </Typography>

                  {/* Reason */}
                  <Typography sx={{ fontSize: 12 }}>
                    <strong>{item.reason}</strong>
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
