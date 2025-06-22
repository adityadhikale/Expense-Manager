"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { format } from "date-fns";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/date-picker";

import { useGetBudgets } from "@/features/budgets/api/use-get-budgets";
import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";
import { useBulkDeleteBudgets } from "@/features/budgets/api/use-bulk-delete-budgets";
import { columns } from "./columns";
import { useSearchParams, useRouter } from "next/navigation";

const BudgetsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const newBudget = useNewBudget();
  const deleteBudgets = useBulkDeleteBudgets();
  const budgetsQuery = useGetBudgets();
  
  const budgets = budgetsQuery.data || [];
  
  const isDisabled = budgetsQuery.isLoading || deleteBudgets.isPending;
  
  const handleMonthChange = (date?: Date) => {
    setSelectedMonth(date);
    
    // Update URL with the selected month for persistence
    if (date) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", format(date, "yyyy-MM-dd"));
      router.push(`/budgets?${params.toString()}`);
    }
  };
  
  if (budgetsQuery.isLoading) {
    return (
      <div className="mx-auto -mt-24 w-full max-w-screen-2xl pb-10">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="flex h-[500px] w-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-slate-300" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="mx-auto -mt-24 w-full max-w-screen-2xl pb-10">
      <Card className="border-none drop-shadow-sm" id="budgets-section">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="line-clamp-1 text-xl">
            Budget Goals
          </CardTitle>
          
          <div className="flex flex-col gap-y-2 lg:flex-row lg:items-center lg:gap-x-2">
            <div className="w-full lg:w-40" id="budget-date-filter">
              <DatePicker
                value={selectedMonth}
                onChange={handleMonthChange}
              />
            </div>
            <Button
              size="sm"
              onClick={newBudget.onOpen}
              className="w-full lg:w-auto"
              id="add-budget-btn"
            >
              <Plus className="mr-2 size-4" /> Add Budget
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center" id="budget-list">
              <div className="rounded-full bg-slate-100 p-3 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-[#45ad93]"
                >
                  <path d="M18 8V7c0-1.1-.9-2-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-1" />
                  <path d="M14 8h7a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-7" />
                  <path d="M6 10v4" />
                  <path d="M10 10v4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-1">No budget goals yet</h3>
              <p className="text-muted-foreground text-sm max-w-md mb-4">
                Create your first budget goal to track your spending and save money
              </p>
              <Button onClick={newBudget.onOpen} size="sm">
                <Plus className="mr-2 size-4" /> Add Budget
              </Button>
            </div>
          ) : (
            <DataTable
              id="budget-list"
              filterKey="name"
              columns={columns}
              data={budgets}
              onDelete={(row) => {
                const ids = row.map((r) => r.original.id);
                deleteBudgets.mutate({ ids });
              }}
              disabled={isDisabled}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetsPage;
