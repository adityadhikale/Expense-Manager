import { useEffect, useState } from "react";
import { useGetBudgetProgress } from "@/features/budgets/api/use-get-budget-progress";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type ProgressColumnProps = {
  id: string;
  budgetAmount: number;
  month: Date;
  categoryId: string | null;
};

export const ProgressColumn = ({
  id,
  budgetAmount,
  month,
  categoryId,
}: ProgressColumnProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading } = useGetBudgetProgress();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) {
    return (
      <div className="space-y-2 w-[160px]">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  // Find the budget progress data for this budget
  const budgetProgress = data?.data.find(
    (item) => 
      item.id === id || 
      (categoryId === item.categoryId)
  );

  if (!budgetProgress) {
    // If no data, show empty progress (likely a newly created budget)
    return (
      <div className="space-y-1 w-[160px]">
        <Progress
          value={0}
          className="h-2"
          variant="success"
        />
        <p className="text-xs text-muted-foreground">
          {formatCurrency(0)} of {formatCurrency(budgetAmount)}
        </p>
      </div>
    );
  }

  // Determine color based on percentage
  const getVariant = () => {
    if (budgetProgress.percentage >= 100) return "danger";
    if (budgetProgress.percentage >= 80) return "warning";
    return "success";
  };

  return (
    <div className="space-y-1 w-[160px]">
      <Progress
        value={budgetProgress.percentage}
        className="h-2"
        variant={getVariant()}
      />
      <p className="text-xs text-muted-foreground">
        {formatCurrency(budgetProgress.spent)} of {formatCurrency(budgetProgress.budgetAmount)}
      </p>
    </div>
  );
};