import { useState, useEffect } from "react";
import { useDataProvider } from "react-admin";

import { useAppContext } from "../../../Context";
import { ServerCommand } from "../../../synapse/dataProvider";
import { GetInstanceConfig } from "../InstanceConfig";

export const useServerCommands = () => {
  const icfg = GetInstanceConfig();
  const { palpoAdmin } = useAppContext();
  const [isLoading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [serverCommands, setServerCommands] = useState<Record<string, ServerCommand>>({});
  const dataProvider = useDataProvider();

  useEffect(() => {
    const fetchServerCommands = async () => {
      const serverCommandsResponse = await dataProvider.getServerCommands(palpoAdmin);
      if (serverCommandsResponse?.maintenance) {
        setMaintenance(true);
        setLoading(false);
        return;
      }
      if (serverCommandsResponse) {
        const serverCommands = serverCommandsResponse.commands;
        Object.keys(serverCommandsResponse.commands).forEach((command: string) => {
          serverCommands[command].additionalArgs = "";
        });

        if (icfg.disabled.payments || icfg.disabled.attributions) {
          delete serverCommands["price"];
          delete serverCommands["payments"];
        }

        setServerCommands(serverCommands);
      }
      setLoading(false);
    };
    fetchServerCommands();
  }, [dataProvider, palpoAdmin]);

  return { isLoading, maintenance, serverCommands, setServerCommands };
};
