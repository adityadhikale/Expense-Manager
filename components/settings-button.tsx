"use client";

import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetAppPreferences } from "@/features/app-preferences/api/use-get-app-preferences";
import { useUpdateAppPreferences } from "@/features/app-preferences/api/use-update-app-preferences";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"] as const;

const CURRENCY_SYMBOLS: Record<(typeof CURRENCIES)[number], string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

/**
 * SettingsButton component
 *
 * A dropdown menu button placed in the header that provides access to app settings.
 * Currently includes a Currency picker; additional settings options can be added here in the future.
 */
export const SettingsButton = () => {
  const { data: preferences } = useGetAppPreferences();
  const updatePreferences = useUpdateAppPreferences();

  const currentCurrency = preferences?.currency ?? "INR";

  const handleCurrencyChange = (value: string) => {
    updatePreferences.mutate({ currency: value as (typeof CURRENCIES)[number] });
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
              >
                <Settings className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          align="end"
          className="w-52 rounded-xl shadow-lg"
        >
          <DropdownMenuLabel>Currency</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={currentCurrency}
            onValueChange={handleCurrencyChange}
          >
            {CURRENCIES.map((currency) => (
              <DropdownMenuRadioItem
                key={currency}
                value={currency}
                className="rounded-lg"
              >
                <span className="mr-2 w-5 text-center text-muted-foreground">
                  {CURRENCY_SYMBOLS[currency]}
                </span>
                {currency}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};
