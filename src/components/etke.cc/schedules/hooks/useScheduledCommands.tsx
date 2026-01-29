import { useQuery } from "@tanstack/react-query";
import { useDataProvider } from "react-admin";

import { useAppContext } from "../../../../Context";

export const useScheduledCommands = () => {
  const { palpoAdmin } = useAppContext();
  const dataProvider = useDataProvider();
  const { data, isLoading, error } = useQuery({
    queryKey: ["scheduledCommands"],
    queryFn: () => dataProvider.getScheduledCommands(palpoAdmin),
  });

  return { data, isLoading, error };
};
