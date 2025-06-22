import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray, gte, lte } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { budgets, categories, insertBudgetSchema } from "@/db/schema";

// Custom schema for budget creation and updates
const budgetInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().int().positive("Amount must be positive"),
  month: z.coerce.date(),
  categoryId: z.string().optional().nullable(),
});

const app = new Hono()
  .get("/",
    clerkMiddleware(),
    zValidator(
      "query",
      z.object({
        month: z.string().optional(),
        categoryId: z.string().optional(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const query = ctx.req.valid("query");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      let filters = and(eq(budgets.userId, auth.userId));

      // Add month filter if provided
      if (query.month) {
        const monthDate = new Date(query.month);
        const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        filters = and(
          filters,
          gte(budgets.month, startOfMonth),
          lte(budgets.month, endOfMonth)
        );
      }

      // Add category filter if provided
      if (query.categoryId) {
        filters = and(filters, eq(budgets.categoryId, query.categoryId));
      }

      const data = await db
        .select({
          id: budgets.id,
          name: budgets.name,
          amount: budgets.amount,
          month: budgets.month,
          categoryId: budgets.categoryId,
          categoryName: categories.name,
        })
        .from(budgets)
        .leftJoin(categories, eq(budgets.categoryId, categories.id))
        .where(filters);

      return ctx.json({ data });
    }
  )
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const [data] = await db
        .select({
          id: budgets.id,
          name: budgets.name,
          amount: budgets.amount,
          month: budgets.month,
          categoryId: budgets.categoryId,
          categoryName: categories.name,
        })
        .from(budgets)
        .leftJoin(categories, eq(budgets.categoryId, categories.id))
        .where(and(eq(budgets.userId, auth.userId), eq(budgets.id, id)));

      if (!data) {
        return ctx.json({ error: "Not found." }, 404);
      }

      return ctx.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", budgetInputSchema),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      // Amount is already in milliunits from the form
      const amountInMilliunits = values.amount;

      console.log(`Converting budget amount: ${values.amount} → ${amountInMilliunits} milliunits`);

      try {
        const [data] = await db
          .insert(budgets)
          .values({
            id: createId(),
            userId: auth.userId,
            name: values.name,
            amount: amountInMilliunits,
            month: values.month,
            categoryId: values.categoryId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return ctx.json({ data });
      } catch (error) {
        console.error("Error creating budget:", error);
        return ctx.json({ error: "Failed to create budget." }, 500);
      }
    }
  )
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const data = await db
        .delete(budgets)
        .where(
          and(
            eq(budgets.userId, auth.userId),
            inArray(budgets.id, values.ids)
          )
        )
        .returning({
          id: budgets.id,
        });

      return ctx.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator("json", budgetInputSchema),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      // Amount is already in milliunits from the form
      const amountInMilliunits = values.amount;

      console.log(`Updating budget amount: ${values.amount} → ${amountInMilliunits} milliunits`);

      try {
        const [data] = await db
          .update(budgets)
          .set({
            name: values.name,
            amount: amountInMilliunits,
            month: values.month,
            categoryId: values.categoryId || null,
            updatedAt: new Date(),
          })
          .where(and(eq(budgets.userId, auth.userId), eq(budgets.id, id)))
          .returning();

        if (!data) {
          return ctx.json({ error: "Not found." }, 404);
        }

        return ctx.json({ data });
      } catch (error) {
        console.error("Error updating budget:", error);
        return ctx.json({ error: "Failed to update budget." }, 500);
      }
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const [data] = await db
        .delete(budgets)
        .where(and(eq(budgets.userId, auth.userId), eq(budgets.id, id)))
        .returning({
          id: budgets.id,
        });

      if (!data) {
        return ctx.json({ error: "Not found." }, 404);
      }

      return ctx.json({ data });
    }
  );

export default app;

