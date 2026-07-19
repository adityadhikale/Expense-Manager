import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.budgets.$post>;
type RequestType = {
  name: string;
  amount: number;
  month: Date;
  categoryId?: string | null;
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.budgets.$post({ json });
      const result = await response.json();

      if (!response.ok) {
        const message = "error" in result ? result.error : "Failed to create budget";
        throw new Error(message);
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Budget created");
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets/progress"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create budget!");
    },
  });

  return mutation;
};

