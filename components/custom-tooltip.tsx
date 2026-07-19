import { format } from "date-fns";
import type {
  NameType,
  Payload,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useGetAppPreferences } from "@/features/app-preferences/api/use-get-app-preferences";

type CustomTooltipProps = {
  active: boolean | undefined;
  payload: Payload<ValueType, NameType>[] | undefined;
};

export const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload) return null;

  const date = payload[0].payload.date as Date;
  const income = payload[0].value as number;
  const expenses = payload[1].value as number;
  const { data: preferences } = useGetAppPreferences();
  const currency = preferences?.currency ?? "INR";

  return (
    <div className="overflow-hidden rounded-sm border bg-white shadow-sm">
      <div className="bg-muted p-2 px-3 text-sm text-muted-foreground">
        {format(date, "MMM dd, yyyy")}
      </div>

      <Separator />

      <div className="space-y-1 p-2 px-3">
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <div className="size-1.5 rounded-full bg-blue-500" aria-hidden />

            <p className="text-sm text-muted-foreground">Income</p>
          </div>

          <p className="text-right text-sm font-medium">
            {formatCurrency(income, currency)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <div className="size-1.5 rounded-full bg-rose-500" aria-hidden />

            <p className="text-sm text-muted-foreground">Expenses</p>
          </div>

          <p className="text-right text-sm font-medium">
            {formatCurrency(expenses * -1, currency)}
          </p>
        </div>
      </div>
    </div>
  );
};