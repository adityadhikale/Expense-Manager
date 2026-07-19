import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import { appPreferences } from "@/db/schema";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"] as const;

const app = new Hono()
  .get("/", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);

    if (!auth?.userId) {
      return ctx.json({ error: "Unauthorized." }, 401);
    }

    const [data] = await db
      .select({
        currency: appPreferences.currency,
      })
      .from(appPreferences)
      .where(eq(appPreferences.userId, auth.userId));

    return ctx.json({ data: data ?? { currency: "INR" } });
  })
  .patch(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        currency: z.enum(CURRENCIES),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const [data] = await db
        .insert(appPreferences)
        .values({
          id: createId(),
          userId: auth.userId,
          currency: values.currency,
        })
        .onConflictDoUpdate({
          target: appPreferences.userId,
          set: {
            currency: values.currency,
            updatedAt: new Date(),
          },
        })
        .returning({
          currency: appPreferences.currency,
        });

      return ctx.json({ data });
    }
  );

export default app;
