import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import accounts from "./accounts";
import categories from './categories';
import transactions from "./transactions";
import summary from "./summary";

export const runtime = 'edge';

const app = new Hono().basePath('/api');

// Import budget routes
import budgets from "./budgets";
import budgetsProgress from "./budgets-progress";

// Register all routes with the app
const routes = app
    .route("/summary", summary)
    .route("/accounts", accounts)
    .route("/categories", categories)
    .route("/transactions", transactions)
    .route("/budgets", budgets)
    .route("/budgets/progress", budgetsProgress); // Register the progress route directly

// Use routes for the handlers
export const GET = handle(routes);
export const POST = handle(routes);
export const PATCH = handle(routes);
export const DELETE = handle(routes);

export type AppType = typeof routes;
