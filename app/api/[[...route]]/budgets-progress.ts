import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { and, eq, gte, lte, sum, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { budgets, transactions, categories } from "@/db/schema";

// Define response types for better type safety
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
  month?: Date;
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

  console.log(`Month range for ${dateStr || 'current date'}: ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`);

  return { startOfMonth, endOfMonth };
};

// Create Hono app with appropriate debugging and better route handling
const budgetsProgress = new Hono()
  .get("/",
    (ctx, next) => {
      console.log(`Budget progress route matched at path: ${ctx.req.path}`);
      console.log(`Full URL: ${ctx.req.url}`);
      console.log(`Query params: ${JSON.stringify(ctx.req.query())}`);
      return next();
    },
    clerkMiddleware(),
    zValidator(
      "query",
      z.object({
        month: z.string().optional(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const query = ctx.req.valid("query");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      try {
        console.log(`Processing budget progress request for user: ${auth.userId}, month: ${query.month || 'current'}`);

        const { startOfMonth, endOfMonth } = getMonthRange(query.month);

        // Get all budgets for the specified month
        console.log(`Fetching budget items from ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`);

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
              eq(budgets.userId, auth.userId),
              gte(budgets.month, startOfMonth),
              lte(budgets.month, endOfMonth)
            )
          );

        // Get expenses for each budget category within the month
        const progressData = await Promise.all(
          budgetItems.map(async (budget) => {
            let spent = 0;

            // Get transactions for the category if a category is specified
            if (budget.categoryId) {
              const result = await db
                .select({ total: sum(transactions.amount) })
                .from(transactions)
                .where(
                  and(
                    eq(transactions.categoryId, budget.categoryId),
                    gte(transactions.date, startOfMonth),
                    lte(transactions.date, endOfMonth),
                    // Only count expenses (negative amounts)
                    sql`${transactions.amount} < 0`
                  )
                );

              // Convert negative amount to positive for expense total
              spent = result[0]?.total ? Math.abs(Number(result[0].total)) : 0;
            } else {
              // For overall budget with no category, get all expenses
              const result = await db
                .select({ total: sum(transactions.amount) })
                .from(transactions)
                .where(
                  and(
                    gte(transactions.date, startOfMonth),
                    lte(transactions.date, endOfMonth),
                    // Only count expenses (negative amounts)
                    sql`${transactions.amount} < 0`
                  )
                );

              spent = result[0]?.total ? Math.abs(Number(result[0].total)) : 0;
            }

            // Calculate percentage of budget used
            const percentage = budget.amount > 0
              ? Math.min(Math.round((spent / budget.amount) * 100), 100)
              : 0;

            // Calculate remaining amount
            const remaining = Math.max(budget.amount - spent, 0);

            return {
              id: budget.id,
              name: budget.name,
              budgetAmount: budget.amount,
              spent,
              remaining,
              percentage,
              categoryId: budget.categoryId,
              categoryName: budget.categoryName,
              status: percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : 'success'
            };
          })
        );

        // Calculate overall total budget and spending
        const totalBudget = budgetItems.reduce((sum, budget) => sum + budget.amount, 0);
        const totalSpent = progressData.reduce((sum, item) => sum + item.spent, 0);
        const overallPercentage = totalBudget > 0
          ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100)
          : 0;
        const overallRemaining = Math.max(totalBudget - totalSpent, 0);
        const overallStatus = overallPercentage >= 100 ? 'danger' : overallPercentage >= 80 ? 'warning' : 'success';

        return ctx.json({
          data: progressData,
          summary: {
            totalBudget,
            totalSpent,
            remaining: overallRemaining,
            percentage: overallPercentage,
            status: overallStatus
          }
        });
      } catch (error) {
        console.error("Error fetching budget progress:", error);

        // More detailed error response
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        return ctx.json({
          error: "Failed to fetch budget progress.",
          details: errorMessage,
          path: ctx.req.path,
          query: query
        }, 500);
      }
    }
  );

export default budgetsProgress;

