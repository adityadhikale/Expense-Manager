import { hc } from "hono/client";

import {AppType} from "@/app/api/[[...route]]/route";

// Add debugging to help identify client URL issues
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
// Base URL initialization logging removed

// Create client with additional error handling
const baseClient = hc<AppType>(baseUrl);

// Add debug method to log requests using type assertion
// Define the client type to include the fetch method
type HonoClientWithFetch = typeof baseClient & {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

// Use type assertion to tell TypeScript that the client has a fetch method
const clientWithFetch = baseClient as HonoClientWithFetch;
const originalFetch = clientWithFetch.fetch;

// Override the fetch method with our logging version
clientWithFetch.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  // Request logging removed
  return originalFetch(input, init);
};

// Export the client with extended functionality
export const client = clientWithFetch;
