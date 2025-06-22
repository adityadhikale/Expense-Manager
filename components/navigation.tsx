"use client";

import { useState, useEffect } from "react";
import { Menu, Home, Wallet, CreditCard, Tags, PiggyBank } from "lucide-react";
import { useMedia } from "react-use";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { NavButton } from "@/components/nav-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const routes = [
    {
        href: "/",
        label: "Overview",
    },
    {
        href: "/transactions",
        label: "Transactions"
    },
    {
        href: "/accounts",
        label: "Accounts"
    },
    {
        href: "/categories",
        label: "Categories"
    },
    {
        href: "/budgets",
        label: "Budgets"
    },
];

// Client-side only navigation wrapper to prevent hydration mismatch
const ClientSideNavigation = () => {
  const routeIcons: { [key: string]: JSX.Element } = {
    "/": <Home className="h-4 w-4" />,
    "/transactions": <Wallet className="h-4 w-4" />,
    "/accounts": <CreditCard className="h-4 w-4" />,
    "/categories": <Tags className="h-4 w-4" />,
    "/budgets": <PiggyBank className="h-4 w-4" />,
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMedia("(max-width: 1024px)", false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  // During SSR or before mounting, return a placeholder that matches the desktop view
  // This prevents hydration mismatch since we'll always start with desktop view
  if (!isMounted) {
    return (
      <nav className="main-nav hidden lg:flex items-center gap-x-2 overflow-auto">
        {routes.map((route) => (
          <NavButton 
            key={route.href} 
            href={route.href} 
            label={route.label} 
            icon={routeIcons[route.href]} 
            isActive={pathname === route.href} 
          />
        ))}
      </nav>
    );
  }

  // Mobile view (only rendered client-side after mounting)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger>
          <Button
            variant="outline"
            size="sm"
            className="mobile-hamburger font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition"
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="px-2">
          <nav className="flex flex-col gap-y-2 pt-6">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.href === pathname ? "secondary" : "ghost"}
                onClick={() => onClick(route.href)}
                className="w-full justify-start"
              >
                <span className="mr-2">{routeIcons[route.href]}</span>
                {route.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view (only rendered client-side after mounting)
  return (
    <nav className="main-nav hidden lg:flex items-center gap-x-2 overflow-auto">
      {routes.map((route) => (
        <NavButton 
          key={route.href} 
          href={route.href} 
          label={route.label} 
          icon={routeIcons[route.href]} 
          isActive={pathname === route.href} 
        />
      ))}
    </nav>
  );
};

// The exported component is a simple wrapper around the client-side navigation
export const Navigation = () => {
  return <ClientSideNavigation />;
};
