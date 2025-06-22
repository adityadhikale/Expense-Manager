"use client";

import React, { Component, createContext, useContext, useEffect, useState, useTransition } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Create context to share auth state with child components
export type AuthContextType = {
  isAuthReady: boolean;
  isAuthenticated: boolean;
  isStable: boolean;
  authError: Error | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthReady: false,
  isAuthenticated: false,
  isStable: false,
  authError: null,
});

// Custom hook to access auth context
export const useAuthState = () => useContext(AuthContext);

type AuthLoadingProps = {
  children: React.ReactNode;
}

// Loading placeholder that matches layout structure
const LoadingPlaceholder = () => (
  <div className="h-screen w-screen flex flex-col">
    {/* Mimic header with gradient */}
    <div className="bg-gradient-to-b from-[#45ad93] to-[#a4ddcf] px-4 py-8 lg:px-14 pb-36">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="h-10 w-32 bg-white/20 rounded-md animate-pulse"></div>
          <div className="h-8 w-8 rounded-full bg-white/20 animate-pulse"></div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="h-8 w-64 bg-white/20 rounded-md animate-pulse"></div>
          <div className="h-6 w-48 bg-white/10 rounded-md animate-pulse"></div>
        </div>
        <div className="flex space-x-3">
          <div className="h-9 w-40 bg-white/10 rounded-md animate-pulse"></div>
          <div className="h-9 w-48 bg-white/10 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
    
    {/* Mimic main content */}
    <div className="flex-grow px-3 lg:px-14 -mt-24">
      <div className="max-w-screen-2xl mx-auto w-full pb-10">
        <div className="grid grid-cols-1 gap-8 pb-2 lg:grid-cols-3">
          <div className="h-[192px] bg-white/5 rounded-md animate-pulse"></div>
          <div className="h-[192px] bg-white/5 rounded-md animate-pulse"></div>
          <div className="h-[192px] bg-white/5 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error }: { error: Error | null }) => (
  <div className="h-screen w-screen flex items-center justify-center">
    <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
      <p className="text-gray-700 mb-4">
        {error?.message || "There was an error loading the application."}
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-[#45ad93] text-white rounded-md hover:bg-[#3d9783]"
      >
        Try again
      </button>
    </div>
  </div>
);

// Properly implemented Error Boundary as a class component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * AuthLoading component
 * 
 * Prevents hydration mismatches by showing a consistent loading state during initial
 * authentication check. Only renders children after client-side mounting is complete
 * and auth state is stable. Provides auth state to children via context.
 */
export const AuthLoading = ({ children }: AuthLoadingProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [isStable, setIsStable] = useState(false);
  const [isTransitionComplete, setIsTransitionComplete] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Set mounted state after client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add a stability check to ensure auth state is settled
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      if (isLoaded && isUserLoaded) {
        // Add a small delay to ensure auth state is stable
        const stabilityTimer = setTimeout(() => {
          setIsStable(true);
          
          // Start transition for smooth content reveal
          startTransition(() => {
            // Add a delay for the transition effect
            setTimeout(() => {
              setIsTransitionComplete(true);
            }, 300);
          });
        }, 600);
        
        return () => clearTimeout(stabilityTimer);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error : new Error("Authentication error"));
    }
  }, [isMounted, isLoaded, isUserLoaded, isSignedIn]);

  // Compute authentication ready state
  const isAuthReady = isMounted && isLoaded && isUserLoaded;
  const isAuthenticated = isAuthReady && !!isSignedIn && !!user;
  
  // Authentication error handling
  if (authError) {
    return <ErrorFallback error={authError} />;
  }

  // Show loading placeholder when:
  // 1. Component isn't mounted yet (server-side or initial client render)
  // 2. Auth state isn't loaded yet
  // 3. Auth state isn't stable yet
  if (!isAuthReady || !isStable) {
    return <LoadingPlaceholder />;
  }

  // Authentication is ready and stable, provide auth context to children
  return (
    <ErrorBoundaryComponent fallback={<ErrorFallback error={new Error("Error rendering content")} />}>
      <AuthContext.Provider value={{ isAuthReady, isAuthenticated, isStable, authError }}>
        <div 
          className={`transition-opacity duration-500 ease-in-out ${
            isTransitionComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          {children}
        </div>
      </AuthContext.Provider>
    </ErrorBoundaryComponent>
  );
};

