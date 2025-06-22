import { Step } from "react-joyride";

// Storage key for persisting tour completion status
export const TOUR_STORAGE_KEY = "expensemgr_tour_done";

// Target element selectors for tour steps
export enum TourStepTargets {
  WELCOME = "body", // For the intro modal step
  DASHBOARD_METRICS = "#dashboard-metrics-grid",
  CHARTS = "#spending-charts",
  DASHBOARD_BUDGET = "#dashboard-budget-progress",
  NAV_DESKTOP = ".main-nav",
  NAV_MOBILE = ".mobile-hamburger",
  TXN_TABLE = "#transaction-table",
  TXN_FILTERS = "#transaction-filters",
  TXN_ADD = "#add-transaction-btn",
  TXN_IMPORT = "#import-transaction-btn",
  ACCOUNTS = "#accounts-section",
  CATEGORIES = "#categories-section",
  BUDGETS = "#budgets-section",
  BUDGET_PROGRESS = "#budget-progress",
  ADD_BUDGET = "#add-budget-btn",
  BUDGET_LIST = "#budget-list",
  BUDGET_DATE_FILTER = "#budget-date-filter"
}

// Extended Step type with unique ID for each step
export type TourStep = Step & {
  id: string;
};

// Define all tour steps with detailed descriptions
export const tourSteps: TourStep[] = [
  {
    id: "welcome",
    target: TourStepTargets.WELCOME,
    content: "Welcome to Expense Manager! This guided tour will help you learn how to track your finances effectively.",
    placement: "center",
    disableBeacon: true,
    title: "Welcome to Expense Manager",
    spotlightClicks: false,
  },
  {
    id: "dashboard-metrics",
    target: TourStepTargets.DASHBOARD_METRICS,
    content: "This dashboard shows your financial overview. The cards display your remaining balance, total income, and expenses for the selected period.",
    placement: "bottom",
    title: "Financial Overview",
    spotlightClicks: false,
  },
  {
    id: "charts",
    target: TourStepTargets.CHARTS,
    content: "These charts visualize your spending trends over time and category distribution, helping you identify where your money goes.",
    placement: "top",
    title: "Financial Charts",
    spotlightClicks: false,
  },
  {
    id: "dashboard-budget",
    target: TourStepTargets.DASHBOARD_BUDGET,
    content: "Track your budget progress right from the dashboard. The colored indicators show if you're under budget (green), approaching your limit (yellow), or over budget (red).",
    placement: "left",
    title: "Budget Overview",
    spotlightClicks: false,
  },
  {
    id: "navigation",
    target: TourStepTargets.NAV_DESKTOP,
    content: "Use this navigation menu to switch between different sections: Dashboard, Transactions, Accounts, and Categories.",
    placement: "bottom",
    title: "Navigation Menu",
    spotlightClicks: false,
  },
  {
    id: "mobile-navigation",
    target: TourStepTargets.NAV_MOBILE,
    content: "On mobile devices, tap this menu icon to access navigation options.",
    placement: "bottom",
    title: "Mobile Navigation",
    spotlightClicks: true,
  },
  {
    id: "transactions-table",
    target: TourStepTargets.TXN_TABLE,
    content: "All your transactions appear in this table. You can sort, filter, and select multiple transactions for actions like deletion.",
    placement: "bottom",
    title: "Transaction History",
    spotlightClicks: false,
  },
  {
    id: "transaction-filters",
    target: TourStepTargets.TXN_FILTERS,
    content: "Filter your transactions by date range or specific accounts to find exactly what you're looking for.",
    placement: "bottom",
    title: "Transaction Filters",
    spotlightClicks: true,
  },
  {
    id: "add-transaction",
    target: TourStepTargets.TXN_ADD,
    content: "Click here to add a new transaction manually. You can specify the amount, category, account, date, and more.",
    placement: "left",
    title: "Add Transaction",
    spotlightClicks: true,
  },
  {
    id: "import-transaction",
    target: TourStepTargets.TXN_IMPORT,
    content: "Import transactions in bulk from a CSV file to save time when adding multiple entries.",
    placement: "bottom",
    title: "Import Transactions",
    spotlightClicks: true,
  },
  {
    id: "accounts",
    target: TourStepTargets.ACCOUNTS,
    content: "Manage your different financial accounts like cash, checking, savings, or credit cards. Create new accounts or edit existing ones.",
    placement: "bottom",
    title: "Account Management",
    spotlightClicks: false,
  },
  {
    id: "categories",
    target: TourStepTargets.CATEGORIES,
    content: "Organize your finances by customizing expense and income categories to match your specific needs.",
    placement: "bottom",
    title: "Category Management",
    spotlightClicks: false,
  },
  {
    id: "budgets-section",
    target: TourStepTargets.BUDGETS,
    content: "The budget section helps you set spending limits and track your progress towards financial goals.",
    placement: "top",
    title: "Budget Management",
    spotlightClicks: false,
  },
  {
    id: "budget-progress",
    target: TourStepTargets.BUDGET_PROGRESS,
    content: "Monitor your budget progress in real-time. Green indicates you're within budget, yellow means you're approaching the limit, and red shows you've exceeded it.",
    placement: "bottom",
    title: "Budget Progress Tracking",
    spotlightClicks: false,
  },
  {
    id: "add-budget",
    target: TourStepTargets.ADD_BUDGET,
    content: "Create new budget goals by clicking here. You can set monthly amounts for specific categories or overall spending.",
    placement: "left",
    title: "Create Budget",
    spotlightClicks: true,
  },
  {
    id: "budget-list",
    target: TourStepTargets.BUDGET_LIST,
    content: "View all your budgets here. You can edit or delete existing budgets by selecting them from this list.",
    placement: "bottom",
    title: "Budget List",
    spotlightClicks: false,
  },
  {
    id: "budget-date-filter",
    target: TourStepTargets.BUDGET_DATE_FILTER,
    content: "Filter your budgets by month to view and manage budgets for different time periods.",
    placement: "bottom",
    title: "Budget Month Filter",
    spotlightClicks: true,
  }
];

// Define route-specific step groups for different pages
export const dashboardSteps = ["welcome", "dashboard-metrics", "charts", "dashboard-budget", "navigation"];
export const transactionSteps = ["transactions-table", "transaction-filters", "add-transaction", "import-transaction"];
export const accountSteps = ["accounts"];
export const categorySteps = ["categories"];
export const budgetSteps = ["budgets-section", "budget-date-filter", "add-budget", "budget-list", "budget-progress"];

// Mobile-specific step groups
export const mobileDashboardSteps = ["welcome", "dashboard-metrics", "charts", "mobile-navigation"];

// Helper function to get steps by IDs
export const getStepsByIds = (ids: string[]): TourStep[] => {
  return tourSteps.filter((step) => ids.includes(step.id));
};

// Helper function to check if tour has been completed
export const hasTourBeenCompleted = (): boolean => {
  // Default to false for SSR
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === "1";
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return false;
  }
};

// Helper function to mark tour as completed
export const markTourAsCompleted = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "1");
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }
};

// Helper function to reset tour completion status
export const resetTourCompletion = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(TOUR_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  }
};

// Function to get steps based on current route and device type
export const getStepsForRoute = (pathname: string, isMobile: boolean = false): TourStep[] => {
  try {
    // Root dashboard path
    if (pathname === "/") {
      return getStepsByIds(isMobile ? mobileDashboardSteps : dashboardSteps);
    }
    
    // Transaction path
    if (pathname.includes("/transactions")) {
      return getStepsByIds(transactionSteps);
    }
    
    // Accounts path
    if (pathname.includes("/accounts")) {
      return getStepsByIds(accountSteps);
    }
    
    // Categories path
    if (pathname.includes("/categories")) {
      return getStepsByIds(categorySteps);
    }
    
    // Budgets path
    if (pathname.includes("/budgets")) {
      return getStepsByIds(budgetSteps);
    }
    
    // Default to empty array if no matching route
    return [];
  } catch (error) {
    console.error("Error getting tour steps:", error);
    return [];
  }
};

