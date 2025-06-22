"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Joyride, { ACTIONS, CallBackProps, STATUS } from "react-joyride";
import { usePathname } from "next/navigation";
import { useMedia } from "react-use";

import {
  TourStep,
  getStepsForRoute,
  hasTourBeenCompleted,
  markTourAsCompleted,
  resetTourCompletion,
  TOUR_STORAGE_KEY
} from "@/lib/tour/steps";

// Context type definition
type TourContextType = {
  startTour: () => void;
  resetTour: () => void;
  hasFinishedTour: boolean;
  isRunning: boolean;
  pathname: string;
  setTourCompleted: (value: boolean) => void;
  setIsTourRunning: (value: boolean) => void;
};

// Create the context with default values
const TourContext = createContext<TourContextType>({
  startTour: () => {},
  resetTour: () => {},
  hasFinishedTour: true,
  isRunning: false,
  pathname: "/",
  setTourCompleted: () => {},
  setIsTourRunning: () => {},
});

// Import auth state hook
import { useAuthState } from "@/components/auth-loading";

// Client-side only Joyride wrapper component
const JoyrideWrapper = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  
  // Get auth state from context
  const { isAuthReady, isAuthenticated, isStable } = useAuthState();
  
  const { 
    isRunning, 
    pathname, 
    setTourCompleted, 
    setIsTourRunning 
  } = useContext(TourContext);
  
  // Use media query only after mounting
  const isMobile = useMedia("(max-width: 768px)", false);
  
  // Set mounted state after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Initialize tour state only after auth is ready, stable and user is authenticated
  useEffect(() => {
    // Only proceed if mounted, auth is ready, stable, and user is authenticated
    if (isMounted && isAuthReady && isAuthenticated && isStable && typeof window !== 'undefined') {
      try {
        const completed = hasTourBeenCompleted();
        setTourCompleted(completed);
        
        // Auto-start tour for first-time users on dashboard
        if (!completed && pathname === "/") {
          // Add a small delay to ensure DOM is ready for tour
          const tourTimer = setTimeout(() => {
            setIsTourRunning(true);
          }, 1000);
          
          return () => clearTimeout(tourTimer);
        }
      } catch (error) {
        console.error("Error initializing tour:", error);
      }
    }
  }, [isMounted, isAuthReady, isAuthenticated, isStable, pathname]);
  
  // Update steps based on current route and device type - only after mounting
  useEffect(() => {
    if (isMounted) {
      setSteps(getStepsForRoute(pathname, isMobile));
    }
  }, [pathname, isMobile, isMounted]);
  
  // Handle route changes during active tour
  useEffect(() => {
    if (isMounted && isRunning) {
      setSteps(getStepsForRoute(pathname, isMobile));
    }
  }, [pathname, isMobile, isRunning, isMounted]);
  
  // Tour callback handler
  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, status } = data;

    // Handle tour completion or manual close
    if (
      ([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status) || 
      (action === ACTIONS.CLOSE)
    ) {
      setIsTourRunning(false);
      
      // Only mark as completed after mounting
      if (isMounted && typeof window !== 'undefined') {
        markTourAsCompleted();
        setTourCompleted(true);
      }
    }
  }, [isMounted, setIsTourRunning, setTourCompleted]);
  
  // Don't render anything during SSR, initial render, or if auth is not ready/authenticated/stable
  if (!isMounted || !isAuthReady || !isAuthenticated || !isStable) return null;
  
  // Don't run tour if there are no steps or if we're not in a valid route
  if (!steps || steps.length === 0) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      hideBackButton={false}
      showProgress
      showSkipButton
      steps={steps}
      run={isRunning}
      scrollToFirstStep
      spotlightPadding={isMobile ? 5 : 10}
      disableOverlayClose
      disableScrolling={false}
      styles={{
        options: {
          primaryColor: "#45ad93", // App theme color
          zIndex: 1000,
          arrowColor: "#fff",
          backgroundColor: "#fff",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          textColor: "#333",
          // fontFamily is not supported in Joyride's StyleOptions type
          // Custom styles can be applied via CSS separately
        },
        spotlight: {
          borderRadius: 4,
        },
        tooltip: {
          borderRadius: 8,
          fontSize: isMobile ? "14px" : "16px",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        },
        buttonNext: {
          backgroundColor: "#45ad93",
          borderRadius: 4,
          color: "#fff",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
          fontWeight: 500,
          // Hover styles aren't supported in this format
          // Apply hover effects through global CSS instead if needed
        },
        buttonBack: {
          marginRight: 8,
          color: "#45ad93",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
          fontWeight: 500,
        },
        buttonSkip: {
          color: "#6B7280", // Gray-500 from Tailwind
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        },
      }}
    />
  );
};

// Provider component
export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  // Get auth state from context
  const authState = useAuthState();
  
  // State management with SSR-safe defaults
  const [tourCompleted, setTourCompleted] = useState<boolean>(true); // Default to true to prevent flicker
  const [isTourRunning, setIsTourRunning] = useState<boolean>(false);
  
  // Function to start the tour - only works if authenticated
  const startTour = useCallback(() => {
    if (authState.isAuthReady && authState.isAuthenticated) {
      setIsTourRunning(true);
    }
  }, [authState.isAuthReady, authState.isAuthenticated]);
  
  // Function to reset the tour (for use in settings or help section)
  const resetTour = useCallback(() => {
    if (typeof window !== 'undefined' && authState.isAuthReady && authState.isAuthenticated) {
      resetTourCompletion();
      setTourCompleted(false);
    }
  }, [authState.isAuthReady, authState.isAuthenticated]);
  
  // Context value
  const tourContextValue: TourContextType = {
    startTour,
    resetTour,
    hasFinishedTour: tourCompleted,
    isRunning: isTourRunning,
    pathname,
    setTourCompleted,
    setIsTourRunning,
  };
  
  return (
    <TourContext.Provider value={tourContextValue}>
      <JoyrideWrapper />
      {children}
    </TourContext.Provider>
  );
};

// Custom hook for accessing the tour context
export const useTour = () => {
  const context = useContext(TourContext);
  
  // Return only the public API, not the internal context properties
  return {
    startTour: context.startTour,
    resetTour: context.resetTour,
    hasFinishedTour: context.hasFinishedTour,
    isRunning: context.isRunning,
  };
};
