import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.budgets["bulk-delete"]["$post"]>;
type RequestType = {
  ids: string[];
};

export const useBulkDeleteBudgets = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.budgets["bulk-delete"].$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Budgets deleted");
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets/progress"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => {
      toast.error("Failed to delete budgets!");
    },
  });

  return mutation;
};

