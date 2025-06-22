"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

/**
 * UserButtonWrapper component
 * 
 * Client-side only wrapper for Clerk's UserButton to prevent hydration mismatches
 */
export const UserButtonWrapper = () => {
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after client-side hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading state during SSR and initial client render
  if (!isMounted) {
    return (
      <div className="size-8 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-300" />
      </div>
    );
  }

  // Render the UserButton component after mounting
  return <UserButton afterSignOutUrl="/" />;
};

