import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api["app-preferences"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api["app-preferences"]["$patch"]>["json"];

export const useUpdateAppPreferences = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api["app-preferences"]["$patch"]({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Currency updated");
      queryClient.invalidateQueries({ queryKey: ["app-preferences"] });
    },
    onError: () => {
      toast.error("Failed to update currency");
    },
  });

  return mutation;
};
