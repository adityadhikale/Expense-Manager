"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { Skeleton } from "@/components/ui/skeleton";

export const AccountFilter = () => {
  // Track client-side mounting to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { isLoading: isLoadingSummary } = useGetSummary();
  
  // Only access URL parameters after client-side mounting
  const accountId = isMounted ? searchParams.get("accountId") || "all" : "all";
  const from = isMounted ? searchParams.get("from") || "" : "";
  const to = isMounted ? searchParams.get("to") || "" : "";
  
  // Set mounted state after client-side hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const onChange = (newValue: string) => {
    // Only handle changes after mounting
    if (!isMounted) return;
    
    const query = {
      accountId: newValue,
      from,
      to,
    };

    if (newValue === "all") query.accountId = "";

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  };

  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts();
  // Show skeleton during SSR and initial client render
  if (!isMounted) {
    return (
      <Skeleton className="h-9 w-32 lg:w-40 rounded-md bg-white/10" />
    );
  }
  
  return (
    <Select
      value={accountId}
      onValueChange={onChange}
      disabled={isLoadingAccounts || isLoadingSummary}
    >
      <SelectTrigger className="h-9 w-full rounded-md border-none bg-white/10 px-3 font-normal text-white outline-none transition hover:bg-white/30 hover:text-white focus:bg-white/30 focus:ring-transparent focus:ring-offset-0 lg:w-auto">
        <SelectValue placeholder="Select account" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">All accounts</SelectItem>

        {accounts?.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
