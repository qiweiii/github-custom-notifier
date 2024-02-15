import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useNotifyItems from "@/src/lib/hooks/useNotifyItems";

export default function Updates({
  setTabIdx,
}: {
  setTabIdx: (idx: number) => void;
}) {
  const notifyItems = useNotifyItems();

  return (
    <>
      {notifyItems.length === 0 ? (
        <Box
          sx={{
            width: "100%",
            height: "300px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p>No updates</p>
          <Button
            size="small"
            variant="contained"
            onClick={() => setTabIdx(1)}
            sx={{ textTransform: "none" }}
          >
            Go to Settings
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            mt: "4px",
            maxHeight: "450px",
            overflowY: "auto",
          }}
        >
          {notifyItems.map((item) => (
            <Tooltip
              title={`"Click" to open and mark as read`}
              arrow
              key={item.id}
              placement="top"
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
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
                onClick={() => {
                  browser.tabs.create({ url: item.link });
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  p: "8px",
                  border: "1px solid #333",
                  borderRadius: "4px",
                  cursor: "pointer",
                  ":hover": {
                    backgroundColor: "#333",
                  },
                }}
              >
                <Typography sx={{ fontSize: 11, color: "#444" }}>
                  {new Date(item.createdAt).toLocaleDateString() +
                    " " +
                    new Date(item.createdAt).toLocaleTimeString()}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    textDecoration: "underline",
                    display: "inline",
                  }}
                >
                  <strong>{item.repoName}</strong>
                </Typography>

                <Typography sx={{ fontSize: 11, textDecoration: "underline" }}>
                  <Typography
                    sx={{ fontSize: 12, color: "gray", display: "inline" }}
                  >
                    #{item.issue.number}{" "}
                  </Typography>
                  {item.issue.title}
                </Typography>

                <Typography sx={{ fontSize: 12 }}>
                  <strong>{item.reason}</strong>
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}
    </>
  );
}
