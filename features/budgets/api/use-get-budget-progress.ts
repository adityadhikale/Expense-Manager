import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { convertAmountFromMilliunits } from "@/lib/utils";

// API response types
export type BudgetProgress = {
  id: string;
  name: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  categoryId: string | null;
  categoryName: string | null;
  status: 'success' | 'warning' | 'danger';
};

export type BudgetProgressSummary = {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  status: 'success' | 'warning' | 'danger';
};

export type BudgetProgressResponse = {
  data: BudgetProgress[];
  summary: BudgetProgressSummary;
};

// Error response type
export type ErrorResponse = {
  error: string;
  details?: string;
  path?: string;
  month?: string;
};

/**
 * React hook to fetch budget progress data
 * @returns Query result with budget progress data, loading state, and error information
 */
export const useGetBudgetProgress = () => {
  const params = useSearchParams();
  const month = params.get("month") || "";

  return useQuery<BudgetProgressResponse, Error>({
    queryKey: ["budgets/progress", { month }],
    queryFn: async () => {
      console.log(`Fetching budget progress for month: ${month || 'current'}`);
      
      try {
        // Build URL with query parameters
        const url = new URL('/api/budgets/progress', window.location.origin);
        if (month) url.searchParams.append('month', month);
        
        // Fetch data with proper error handling
        const response = await fetch(url.toString(), {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Handle non-200 responses
        if (!response.ok) {
          const errorData: ErrorResponse = await response.json().catch(() => ({
            error: `HTTP error ${response.status}`,
          }));
          
          throw new Error(
            errorData.details || 
            errorData.error || 
            `Failed to fetch budget progress: ${response.statusText}`
          );
        }

        // Parse successful response
        const result = await response.json();
        
        // Ensure we have the expected data structure
        if (!result.data || !result.summary) {
          throw new Error('Unexpected response format from API');
        }
        
      // IMPORTANT: The API now returns properly converted display amounts
      // No need to convert again here, as that would cause double-conversion
      const data = result.data;
      const summary = result.summary;
      
      // Add debug logging to help trace the values
      console.log('Budget progress data:', data);
      console.log('Budget progress summary:', summary);

        return { data, summary };
      } catch (error) {
        console.error("Error fetching budget progress:", error);
        throw error instanceof Error 
          ? error 
          : new Error('Unknown error fetching budget progress');
      }
    },
    // Retry failed requests, but not for 4xx errors
    retry: (failureCount, error) => {
      // Don't retry if error message contains HTTP 4xx status
      if (error.message && /HTTP error 4\d\d/.test(error.message)) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

