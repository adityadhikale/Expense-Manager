import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetAppPreferences = () => {
  const query = useQuery({
    queryKey: ["app-preferences"],
    queryFn: async () => {
      const response = await client.api["app-preferences"].$get();

      if (!response.ok) {
        throw new Error("Failed to fetch app preferences");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
