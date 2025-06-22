import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte, sum, sql, or, inArray } from "drizzle-orm";
import { z } from "zod";
import { getAuth } from "@clerk/nextjs/server";

import { db } from "@/db/drizzle";
import { budgets, transactions, categories } from "@/db/schema";
import { convertAmountFromMilliunits } from "@/lib/utils";

// Utility function to convert to/from milliunits
const convertToDisplayAmount = (milliunits: number): number => {
  return convertAmountFromMilliunits(milliunits);
};

// Debug function to log amount conversions - removed to reduce terminal output

type CategoryExpenses = {
  [key: string]: number;
}

// Response types
export type BudgetProgressItem = {
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
  data: BudgetProgressItem[];
  summary: BudgetProgressSummary;
};

// Request schema
const querySchema = z.object({
  month: z.string().optional(),
});

// Helper function to get start and end of month with improved error handling
const getMonthRange = (dateStr?: string) => {
  let date: Date;

  try {
    date = dateStr ? new Date(dateStr) : new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error(`Invalid date string provided: ${dateStr}, using current date instead`);
      date = new Date();
    }
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    date = new Date();
  }

  // Create UTC dates to avoid timezone issues
  const startOfMonth = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999));

  // Month range logging removed

  return { startOfMonth, endOfMonth };
};

export async function GET(request: NextRequest) {
  // API call logging removed

  // Get auth info using getAuth
  const auth = getAuth(request);
  const userId = auth.userId;

  if (!userId) {
    console.error("Unauthorized request to budget progress");
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Get query params
  const url = new URL(request.url);
  const month = url.searchParams.get('month') || undefined;

  // User processing logging removed

  try {
    // Validate query params
    const validationResult = querySchema.safeParse({ month });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validationResult.error },
        { status: 400 }
      );
    }

    const { startOfMonth, endOfMonth } = getMonthRange(month);

    // Get all budgets for the specified month
    // Fetching budget items logging removed

    const budgetItems = await db
      .select({
        id: budgets.id,
        name: budgets.name,
        amount: budgets.amount,
        categoryId: budgets.categoryId,
        categoryName: categories.name,
      })
      .from(budgets)
      .leftJoin(categories, eq(budgets.categoryId, categories.id))
      .where(
        and(
          eq(budgets.userId, userId),
          gte(budgets.month, startOfMonth),
          lte(budgets.month, endOfMonth)
        )
      );

    // Helper function to safely convert expense amount
    const getExpenseAmount = (amount: number | null): number => {
      if (!amount) return 0;

      // Convert negative amount to positive expense amount
      // Transactions are already in milliunits (100 = ₹1)
      const expenseAmount = amount < 0 ? Math.abs(amount) : 0;

      // Expense amount processing logging removed

      return expenseAmount;
    };

    // Budget items processing logging removed

    // Optimize by fetching all category expenses in a single query instead of per budget
    const categoryIds = budgetItems
      .map(budget => budget.categoryId)
      .filter((id): id is string => id !== null);

    // Categories count logging removed

    // Create a map to store category expenses for quick lookup
    const categoryExpenses: CategoryExpenses = {};

    // Fetch all category expenses in a single query if we have categories
    if (categoryIds.length > 0) {
      const categoryResults = await db
        .select({
          categoryId: transactions.categoryId,
          // Use direct SQL to sum only negative amounts as expenses (converting to positive)
          total: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`,
        })
        .from(transactions)
        .where(
          and(
            // Only include transactions in specified categories
            inArray(transactions.categoryId, categoryIds),
            // Within date range
            gte(transactions.date, startOfMonth),
            lte(transactions.date, endOfMonth)
            // No need for amount < 0 filter here since we handle it in the SUM expression
          )
        )
        .groupBy(transactions.categoryId);

      // Build lookup map
      for (const result of categoryResults) {
        if (result.categoryId) {
          // No need to call getExpenseAmount since our SQL already returns positive expense amounts
          const expense = Number(result.total) || 0;
          categoryExpenses[result.categoryId] = expense;

          // Log the raw amount and the converted display amount
          const displayAmount = convertAmountFromMilliunits(expense);
          // Category expense logging removed
        }
      }

      // Fetched expenses logging removed
    }

    // Get total expenses for budgets without a category
    let totalExpenses = 0;
    const hasUncategorizedBudget = budgetItems.some(budget => budget.categoryId === null);

    if (hasUncategorizedBudget) {
      const totalResult = await db
        .select({
          // Use direct SQL to sum only negative amounts as expenses (converting to positive)
          total: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`,
        })
        .from(transactions)
        .where(
          and(
            gte(transactions.date, startOfMonth),
            lte(transactions.date, endOfMonth)
            // No need for amount < 0 filter here since we handle it in the SUM expression
          )
        );

      // Use the calculated expense total directly
      const rawTotal = totalResult[0]?.total || 0;
      totalExpenses = Number(rawTotal);

      // Log both raw and display amounts
      const displayTotal = convertAmountFromMilliunits(totalExpenses);
      // Total expense logging removed
    }

    // Calculate progress data using the pre-fetched expense amounts
    const progressData = budgetItems.map(budget => {
      let spent = 0;

      // Get expenses from the pre-calculated maps
      if (budget.categoryId) {
        spent = categoryExpenses[budget.categoryId] || 0;
        // Category budget spending logging removed
      } else {
        // For overall budget with no category
        spent = totalExpenses;
        // Overall budget spending logging removed
      }

      // Calculate percentage of budget used
      const percentage = budget.amount > 0
        ? Math.min(Math.round((spent / budget.amount) * 100), 100)
        : 0;

      // Calculate remaining amount
      const remaining = Math.max(budget.amount - spent, 0);

      // Convert milliunit amounts to display amounts for the response
      const displayBudgetAmount = convertToDisplayAmount(budget.amount);
      const displaySpent = convertToDisplayAmount(spent);
      const displayRemaining = convertToDisplayAmount(remaining);

      // Log the conversions for debugging
      // Budget amount conversion logging removed

      return {
        id: budget.id,
        name: budget.name,
        budgetAmount: displayBudgetAmount,
        spent: displaySpent,
        remaining: displayRemaining,
        percentage,
        categoryId: budget.categoryId,
        categoryName: budget.categoryName,
        status: (percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : 'success') as 'success' | 'warning' | 'danger'
      };
    });

    // Calculate overall total budget and spending in milliunits (raw values)
    const totalBudget = budgetItems.reduce((sum, budget) => sum + budget.amount, 0);

    // Sum up actual spending across all budgets (already in milliunits)
    const totalSpent = budgetItems.reduce((sum, budget) => {
      // Get the raw spending for this budget (before any display conversion)
      const budgetSpent = budget.categoryId
        ? (categoryExpenses[budget.categoryId] || 0)
        : totalExpenses;

      // Budget totaling logging removed
      return sum + budgetSpent;
    }, 0);

    const overallPercentage = totalBudget > 0
      ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100)
      : 0;
    const overallRemaining = Math.max(totalBudget - totalSpent, 0);
    const overallStatus = overallPercentage >= 100 ? 'danger' : overallPercentage >= 80 ? 'warning' : 'success';

    // Convert summary amounts to display amounts
    const displayTotalBudget = convertToDisplayAmount(totalBudget);
    const displayTotalSpent = convertToDisplayAmount(totalSpent);
    const displayOverallRemaining = convertToDisplayAmount(overallRemaining);

    // Log summary conversions
    // Summary amount conversion logging removed

    const response: BudgetProgressResponse = {
      data: progressData,
      summary: {
        totalBudget: displayTotalBudget,
        totalSpent: displayTotalSpent,
        remaining: displayOverallRemaining,
        percentage: overallPercentage,
        status: overallStatus
      }
    };

    // Budget progress calculation logging removed
    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching budget progress:", error);

    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch budget progress.",
        details: errorMessage,
        path: request.url,
        month
      },
      { status: 500 }
    );
  }
}

// Set runtime to edge for best performance
export const runtime = 'edge';

