import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { client } from "@/lib/hono";
import { convertAmountFromMilliunits } from "@/lib/utils";

export type Budget = {
  id: string;
  name: string;
  amount: number;
  month: string;
  categoryId: string | null;
  categoryName: string | null;
};

export const useGetBudgets = () => {
  const params = useSearchParams();
  const month = params.get("month") || "";
  const categoryId = params.get("categoryId") || "";

  const query = useQuery({
    queryKey: ["budgets", { month, categoryId }],
    queryFn: async () => {
      const response = await client.api.budgets.$get({
        query: {
          month,
          categoryId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }

      const { data } = await response.json();
      
      // Convert amounts from milliunits with detailed logging
      return data.map((budget: any) => {
        const displayAmount = convertAmountFromMilliunits(budget.amount);
        console.log(`Budget ${budget.name}: ${budget.amount} milliunits → ${displayAmount} display`);
        return {
          ...budget,
          amount: displayAmount,
        };
      });
    },
  });

  return query;
};

