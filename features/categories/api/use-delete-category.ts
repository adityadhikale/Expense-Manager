import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.categories[":id"]["$delete"]>;

export const useDeleteCategory = (id? : string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
    ResponseType,
    Error
    >({
        mutationFn: async () => {
            const response = await client.api.categories[":id"]["$delete"]({
            param: {id},
            });
            const result = await response.json();

            if (!response.ok) {
                const message = "error" in result ? result.error : "Failed to delete category";
                throw new Error(message);
            }

            return result;
        },
        onSuccess: () => {
            toast.success("Category deleted");
            queryClient.invalidateQueries({queryKey: ["category",{id}]});
            queryClient.invalidateQueries({queryKey: ["categories"]});
            queryClient.invalidateQueries({queryKey: ["transactions"]});
            queryClient.invalidateQueries({queryKey: ["summary"]});
            queryClient.invalidateQueries({queryKey: ["budgets"]});
            queryClient.invalidateQueries({queryKey: ["budgets/progress"]});
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete category!");
        }
    });

    return mutation;
}