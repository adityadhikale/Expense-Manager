import { toast } from "sonner";
import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.budgets[":id"]["$patch"]>;
type RequestType = {
  name: string;
  amount: number;
  month: Date;
  categoryId?: string | null;
};

export const useUpdateBudget = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.budgets[":id"]["$patch"]({
        json,
        param: { id },
      });
      const result = await response.json();

      if (!response.ok) {
        const message = "error" in result ? result.error : "Failed to update budget";
        throw new Error(message);
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Budget updated");
      queryClient.invalidateQueries({ queryKey: ["budget", { id }] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets/progress"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update budget!");
    },
  });

  return mutation;
};

