import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {client} from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.categories["bulk-delete"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.categories["bulk-delete"]["$post"]>["json"];

export const useBulkDeleteCategories = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
    >({
        mutationFn: async (json) => {
            const response = await client.api.categories["bulk-delete"]["$post"]({json});
            const result = await response.json();

            if (!response.ok) {
                const message = "error" in result ? result.error : "Failed to delete categories";
                throw new Error(message);
            }

            return result;
        },
        onSuccess: () => {
            toast.success("Categories Deleted");
            queryClient.invalidateQueries({queryKey: ["categories"]});
            queryClient.invalidateQueries({queryKey: ["summary"]});
            queryClient.invalidateQueries({queryKey: ["budgets"]});
            queryClient.invalidateQueries({queryKey: ["budgets/progress"]});
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete categories!");
        }
    });

    return mutation;
}