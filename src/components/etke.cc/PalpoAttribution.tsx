import { PropsWithChildren } from "react";

import { GetInstanceConfig } from "./InstanceConfig";

export const PalpoAttribution: React.FC<PropsWithChildren> = ({ children }) => {
  const icfg = GetInstanceConfig();

  if (icfg.disabled.attributions) {
    return null;
  }

  return <>{children}</>;
};
