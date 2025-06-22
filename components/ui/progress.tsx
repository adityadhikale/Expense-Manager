import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: number;
    max?: number;
    variant?: "default" | "success" | "warning" | "danger";
  }
>(({ className, value, max = 100, variant = "default", ...props }, ref) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "bg-emerald-500";
      case "warning":
        return "bg-amber-500";
      case "danger":
        return "bg-red-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 transition-all",
          getVariantClass()
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };

