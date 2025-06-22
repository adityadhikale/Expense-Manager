import { DataCharts } from "@/components/data-charts";
import { DataGrid } from "@/components/data-grid";
import { BudgetProgressCard } from "@/components/budget-progress-card";

export default function DashboardPage() {
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <div id="dashboard-metrics-grid">
        <DataGrid />
      </div>
      <div id="spending-charts">
        <DataCharts />
      </div>
      <div id="dashboard-budget-progress" className="mt-8">
        <BudgetProgressCard />
      </div>
    </div>
  );
}
