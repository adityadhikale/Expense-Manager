"use client";

import { useSearchParams } from "next/navigation";
import { FaPiggyBank } from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { useEffect, useState } from "react";

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { formatDateRange } from "@/lib/utils";

import { DataCard, DataCardLoading } from "@/components/data-card";

export const DataGrid = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading } = useGetSummary();
  const searchParams = useSearchParams();
  
  // Only access searchParams after component has mounted on client
  const to = isMounted ? searchParams.get("to") || undefined : undefined;
  const from = isMounted ? searchParams.get("from") || undefined : undefined;
  
  const dateRangeLabel = formatDateRange({ to, from });
  
  // Set isMounted to true after component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Always show loading state during SSR and initial client render
  // This ensures consistent rendering between server and client
  if (!isMounted || isLoading)
    return (
      <>
        <div className="mb-8 grid grid-cols-1 gap-8 pb-2 lg:grid-cols-3">
          <DataCardLoading />
          <DataCardLoading />
          <DataCardLoading />
        </div>
      </>
    );

  return (
    <>
      <div id="dashboard-metrics-grid" className="mb-8 grid grid-cols-1 gap-8 pb-2 lg:grid-cols-3">
        <DataCard
          title="Remaining"
          value={data?.remainingAmount}
          percentageChange={data?.remainingChange}
          icon={FaPiggyBank}
          variant="default"
          dateRange={dateRangeLabel}
        />

        <DataCard
          title="Income"
          value={data?.incomeAmount}
          percentageChange={data?.incomeChange}
          icon={FaArrowTrendUp}
          variant="success"
          dateRange={dateRangeLabel}
        />

        <DataCard
          title="Expenses"
          value={data?.expensesAmount}
          percentageChange={data?.expensesChange}
          icon={FaArrowTrendDown}
          variant="danger"
          dateRange={dateRangeLabel}
        />
      </div>
    </>
  );
};
