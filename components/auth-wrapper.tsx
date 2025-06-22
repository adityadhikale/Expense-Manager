"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SignIn, SignUp } from "@clerk/nextjs";

type AuthWrapperProps = {
  type: "sign-in" | "sign-up";
};

/**
 * AuthWrapper component
 * 
 * Client-side only wrapper for Clerk authentication components to prevent hydration mismatches
 */
export const AuthWrapper = ({ type }: AuthWrapperProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after client-side hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Before mounting, show a loading spinner that matches the size and spacing of the auth component
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center w-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // After mounting, render the appropriate auth component
  return (
    <>
      {type === "sign-in" ? (
        <SignIn path="/sign-in" />
      ) : (
        <SignUp path="/sign-up" />
      )}
    </>
  );
};

