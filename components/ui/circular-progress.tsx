import * as React from "react";
import { cn } from "@/lib/utils";

type CircularProgressProps = React.SVGAttributes<SVGElement> & {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "success" | "warning" | "danger";
  showPercentage?: boolean;
  className?: string;
};

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  variant = "default",
  showPercentage = true,
  className,
  ...props
}: CircularProgressProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "stroke-emerald-500";
      case "warning":
        return "stroke-amber-500";
      case "danger":
        return "stroke-red-500";
      default:
        return "stroke-primary";
    }
  };

  const getTextColorClass = () => {
    switch (variant) {
      case "success":
        return "text-emerald-500";
      case "warning":
        return "text-amber-500";
      case "danger":
        return "text-red-500";
      default:
        return "text-primary";
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(getVariantClass())}
          fill="transparent"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-bold", getTextColorClass())}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

