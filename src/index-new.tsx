import React from "react";
import { createRoot } from "react-dom/client";

import { AppNew } from "./AppNew";
import { AppContext } from "./Context";
import { FetchInstanceConfig } from "./components/etke.cc/InstanceConfig";
import { FetchConfig, GetConfig } from "./utils/config";

import "./index.css";

await FetchConfig();
await FetchInstanceConfig(GetConfig().palpoAdmin);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppContext.Provider value={GetConfig()}>
      <AppNew />
    </AppContext.Provider>
  </React.StrictMode>
);
