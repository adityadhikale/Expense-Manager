"use client";

import { useState, useEffect } from "react";
import { FileSearch, Loader2, PiggyBank, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { useGetBudgetProgress } from "@/features/budgets/api/use-get-budget-progress";
import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useGetAppPreferences } from "@/features/app-preferences/api/use-get-app-preferences";

export const BudgetProgressCard = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading, error } = useGetBudgetProgress();
  const { data: preferences } = useGetAppPreferences();
  const currency = preferences?.currency ?? "INR";
  const router = useRouter();
  const newBudget = useNewBudget();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If not mounted or loading, show skeleton
  if (!isMounted || isLoading) {
    return <BudgetProgressCardLoading />;
  }

  // If error, show error state
  if (error) {
    return (
      <Card className="border-none drop-shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Budget Goals</CardTitle>
          <CardDescription>
            Track your spending against budget goals
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <FileSearch className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Failed to load budget data
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please try again later
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no budgets, show empty state
  if (!data || data.data.length === 0) {
    return (
      <Card className="border-none drop-shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Budget Goals</CardTitle>
          <CardDescription>
            Track your spending against budget goals
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-slate-100 p-3">
            <PiggyBank className="h-6 w-6 text-[#45ad93]" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">No budget goals set</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a budget to track your spending
            </p>
          </div>
          <Button
            onClick={newBudget.onOpen}
            size="sm"
            className="mt-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Determine variant based on status
  const getVariant = (status: string) => {
    switch (status) {
      case "danger":
        return "danger";
      case "warning":
        return "warning";
      default:
        return "success";
    }
  };

  const summary = data.summary;
  const budgets = data.data;

  return (
    <Card className="border-none drop-shadow-sm" id="budget-progress">
      <CardHeader>
        <CardTitle className="text-xl">Budget Goals</CardTitle>
        <CardDescription>
          Track your spending against budget goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          {/* Overall budget progress */}
          <div className="flex flex-col items-center">
            <CircularProgress
              value={summary.percentage}
              variant={getVariant(summary.status)}
              size={120}
              strokeWidth={12}
            />
            <div className="mt-4 text-center">
              <p className="text-sm font-medium">Overall Budget</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.totalSpent, currency)} of {formatCurrency(summary.totalBudget, currency)}
              </p>
            </div>
          </div>

          {/* Individual budget progress bars */}
          <div className="w-full flex-1 space-y-4">
            {budgets.slice(0, 3).map((budget) => (
              <div key={budget.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{budget.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(budget.spent, currency)} of {formatCurrency(budget.budgetAmount, currency)}
                  </span>
                </div>
                <Progress
                  value={budget.percentage}
                  variant={getVariant(budget.status)}
                  className="h-2"
                />
              </div>
            ))}

            {budgets.length > 3 && (
              <div className="text-xs text-center text-muted-foreground pt-2">
                {budgets.length - 3} more budget(s) not shown
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() => router.push("/budgets")}
          size="sm"
          variant="outline"
        >
          View All Budgets
        </Button>
      </CardFooter>
    </Card>
  );
};

export const BudgetProgressCardLoading = () => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="flex flex-col items-center">
            <Skeleton className="h-[120px] w-[120px] rounded-full" />
            <Skeleton className="mt-4 h-4 w-24" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
          <div className="w-full flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Skeleton className="h-9 w-32" />
      </CardFooter>
    </Card>
  );
};

