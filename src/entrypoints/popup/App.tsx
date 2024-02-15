import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import "./App.css";
import useOptions from "@/src/lib/hooks/useOptions";
import { getUnreadInfo } from "@/src/lib/api";
import { NotifyItemV1 } from "@/src/lib/storage/customNotifications";
import Updates from "./components/Updates";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function App() {
  const [options] = useOptions();
  const [tabIdx, setTabIdx] = useState(0);
  const [notifyItems, setNotifyItems] = useState<NotifyItemV1[]>([]);

  useEffect(() => {
    getUnreadInfo().then((data) => {
      setNotifyItems(data.items);
    });
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIdx(newValue);
  };

  return (
    <>
      {options.token ? null : (
        <Alert
          severity="error"
          onClose={() => {
            browser.runtime.openOptionsPage();
          }}
        >
          No access token, please set it{" "}
          <Link
            onClick={() => browser.runtime.openOptionsPage()}
            sx={{ cursor: "pointer" }}
          >
            Options Page
          </Link>
        </Alert>
      )}

      <Tabs value={tabIdx} onChange={handleTabChange} variant="fullWidth">
        <Tab label="Updates" {...a11yProps(0)} sx={{ textTransform: "none" }} />
        <Tab
          label="Settings"
          {...a11yProps(1)}
          sx={{ textTransform: "none" }}
        />
      </Tabs>

      <CustomTabPanel value={tabIdx} index={0}>
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
          <Updates />
        )}
      </CustomTabPanel>
      <CustomTabPanel value={tabIdx} index={1}>
        Settings
      </CustomTabPanel>
    </>
  );
}

export default App;
