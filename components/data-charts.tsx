"use client";

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useEffect, useState } from "react";

import { Chart, ChartLoading } from "@/components/chart";
import { SpendingPie, SpendingPieLoading } from "@/components/spending-pie";

export const DataCharts = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data, isLoading } = useGetSummary();
  
  // Set isMounted to true after component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Always show loading state during SSR and initial client render
  if (!isMounted || isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
        <div className="col-span-1 lg:col-span-3 xl:col-span-4">
          <ChartLoading />
        </div>

        <div className="col-span-1 lg:col-span-3 xl:col-span-2">
          <SpendingPieLoading />
        </div>
      </div>
    );
  }

  return (
    <div id="spending-charts" className="grid grid-cols-1 gap-8 lg:grid-cols-6">
      <div className="col-span-1 lg:col-span-3 xl:col-span-4">
        <Chart data={data?.days} />
      </div>

      <div className="col-span-1 lg:col-span-3 xl:col-span-2">
        <SpendingPie data={data?.categories} />
      </div>
    </div>
  );
};