"use client";

import { Settings, Loader2, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTour } from "@/provider/tour-provider";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * SettingsButton component
 * 
 * A dropdown menu button placed in the header that provides access to app settings,
 * including the ability to start the app tour at any time.
 */
export const SettingsButton = () => {
  const { startTour, resetTour } = useTour();
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTour = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to start the tour");
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // First reset the tour state
      resetTour();
      
      // Give the DOM time to update and ensure tour targets are present
      setTimeout(() => {
        try {
          console.log("Starting tour for path:", pathname);
          startTour();
          setIsLoading(false);
        } catch (error) {
          console.error("Error starting tour:", error);
          toast.error("Failed to start tour. Please try again.");
          setIsLoading(false);
        }
      }, 300);
    } catch (error) {
      console.error("Error resetting tour:", error);
      toast.error("Failed to initialize tour. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Settings className="size-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Settings & Help</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={handleStartTour}
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <HelpCircle className="mr-2 size-4" />
            )}
            {isLoading ? "Starting Tour..." : "Start Tour"}
          </DropdownMenuItem>
          {/* Additional settings options can be added here in the future */}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

