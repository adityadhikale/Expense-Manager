"use client";

import { format, subDays } from "date-fns";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { useState, useEffect, useMemo } from "react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateRange } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const DateFilter = () => {
  // Track client-side mounting to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoize default dates to prevent recreation on every render
  const defaultDates = useMemo(() => {
    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 60);
    
    return {
      defaultTo,
      defaultFrom,
      // Also include the initial state to avoid recreating it later
      initialState: {
        from: defaultFrom,
        to: defaultTo,
      }
    };
  }, []); // Empty dependency array means this only runs once
  
  // Only access URL parameters after mounting
  const accountId = isMounted ? searchParams.get("accountId") : null;
  const from = isMounted ? searchParams.get("from") || "" : "";
  const to = isMounted ? searchParams.get("to") || "" : "";
  
  // Memoize the URL-based state calculation to prevent unnecessary re-renders
  const mountedParamState = useMemo(() => {
    if (!isMounted) return defaultDates.initialState;
    
    return {
      from: from ? new Date(from) : defaultDates.defaultFrom,
      to: to ? new Date(to) : defaultDates.defaultTo,
    };
  }, [isMounted, from, to, defaultDates]);

  // Initialize state with consistent defaults for SSR
  const [date, setDate] = useState<DateRange | undefined>(defaultDates.initialState);
  
  // Update date state after mounting with URL parameters
  // Handle mounting separately to avoid dependency issues
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Handle URL parameters after component has mounted
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Date calculations are lightweight and acceptable to recreate
  useEffect(() => {
    if (isMounted && (from || to)) {
      setDate(mountedParamState);
    }
  }, [isMounted, from, to, mountedParamState]);

  const pushToUrl = (dateRange: DateRange | undefined) => {
    const query = {
      from: format(dateRange?.from || defaultDates.defaultFrom, "yyyy-MM-dd"),
      to: format(dateRange?.to || defaultDates.defaultTo, "yyyy-MM-dd"),
      accountId,
    };

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  };

  const onReset = () => {
    setDate(undefined);
    pushToUrl(undefined);
  };

  // Show skeleton during SSR and initial client render
  if (!isMounted) {
    return (
      <Skeleton className="h-9 w-40 lg:w-48 rounded-md bg-white/10" />
    );
  }
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={false}
          size="sm"
          variant="outline"
          className="h-9 w-full rounded-md border-none bg-white/10 px-3 font-normal text-white outline-none transition hover:bg-white/30 hover:text-white focus:bg-white/30 focus:ring-transparent focus:ring-offset-0 lg:w-auto"
        >
          <span>{formatDateRange(mountedParamState)}</span>

          <ChevronDown className="ml-2 size-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0 lg:w-auto" align="start">
        <Calendar
          disabled={false}
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />

        <div className="flex w-full items-center gap-x-2 p-4">
          <PopoverClose asChild>
            <Button
              onClick={onReset}
              disabled={!date?.from || !date?.to}
              className="w-full"
              variant="outline"
            >
              Reset
            </Button>
          </PopoverClose>

          <PopoverClose asChild>
            <Button
              onClick={() => pushToUrl(date)}
              disabled={!date?.from || !date?.to}
              className="w-full"
            >
              Apply
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};