import { type IconType } from "react-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

import { CountUp } from "@/components/count-up";
import { useGetAppPreferences } from "@/features/app-preferences/api/use-get-app-preferences";

const boxVariant = cva("shrink-0 rounded-md p-3", {
  variants: {
    variant: {
      default: "bg-blue-500/20",
      success: "bg-emerald-500/20",
      danger: "bg-rose-500/20",
      warning: "bg-yellow-500/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const iconVariant = cva("size-6", {
  variants: {
    variant: {
      default: "fill-blue-500",
      success: "fill-emerald-500",
      danger: "fill-rose-500",
      warning: "fill-yellow-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BoxVariants = VariantProps<typeof boxVariant>;
type IconVariants = VariantProps<typeof iconVariant>;

type DataCardProps = BoxVariants &
  IconVariants & {
    icon: IconType;
    title: string;
    value?: number;
    dateRange: string;
    percentageChange?: number;
  };

export const DataCard = ({
  title,
  value = 0,
  percentageChange = 0,
  icon: Icon,
  variant,
  dateRange,
}: DataCardProps) => {
  // Track client-side mounting to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const { data: preferences } = useGetAppPreferences();
  const currency = preferences?.currency ?? "INR";
  
  // Set mounted state after client-side hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Format the static value the same way CountUp would
  const formattedValue = formatCurrency(value, currency);
  
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-x-4">
        <div className="space-y-2">
          <CardTitle className="line-clamp-1 text-2xl">{title}</CardTitle>

          <CardDescription className="line-clamp-1">
            {dateRange}
          </CardDescription>
        </div>

        <div className={cn(boxVariant({ variant }))}>
          <Icon className={cn(iconVariant({ variant }))} />
        </div>
      </CardHeader>

      <CardContent>
        <h1 className="mb-2 line-clamp-1 break-all text-2xl font-bold">
          {/* Show static value during SSR and initial render */}
          {!isMounted ? (
            formattedValue
          ) : (
            /* Only enable CountUp animation after client-side mounting */
            <CountUp
              preserveValue
              start={0}
              end={value}
              decimals={2}
              decimalPlaces={2}
              formattingFn={(val) => formatCurrency(val, currency)}
            />
          )}
        </h1>

        <p
          className={cn(
            "line-clamp-1 text-sm text-muted-foreground",
            percentageChange > 0 && "text-emerald-500",
            percentageChange < 0 && "text-rose-500"
          )}
        >
          {formatPercentage(percentageChange, { addPrefix: true })} from last
          period.
        </p>
      </CardContent>
    </Card>
  );
};

export const DataCardLoading = () => {
  return (
    <Card className="h-[192px] border-none drop-shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-40" />
        </div>

        <Skeleton className="size-12" />
      </CardHeader>

      <CardContent>
        <Skeleton className="mb-2 h-10 w-24 shrink-0" />
        <Skeleton className="h-4 w-40 shrink-0" />
      </CardContent>
    </Card>
  );
};