import { useState } from "react";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";

import "./App.css";
import useOptions from "@/src/lib/hooks/useOptions";
import Updates from "./components/Updates";
import Settings from "./components/Settings";

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
          No access token, please set it in{" "}
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
          {...a11yProps(1)}
          label="Settings"
          sx={{ textTransform: "none" }}
        />
      </Tabs>

      <CustomTabPanel value={tabIdx} index={0}>
        <Updates setTabIdx={setTabIdx} />
      </CustomTabPanel>
      <CustomTabPanel value={tabIdx} index={1}>
        <Settings />
      </CustomTabPanel>
    </>
  );
}

export default App;
