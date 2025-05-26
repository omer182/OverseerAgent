import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { validateLLMConfig } from "./lib/llm/index.js";
import promptRoutes from './routes/promptRoutes.js';
import './config/index.js'; // This will load and validate environment variables

const app = new Hono();

// Middleware
app.use('*', cors()); // Enable CORS for all routes

// Validate LLM configuration
try {
  validateLLMConfig();
} catch (err: any) {
  console.error("Error validating LLM config:", err.message);
  process.exit(1);
}

// Register routes
app.route("/api", promptRoutes); // Prefix all prompt routes with /api

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
console.log(`🚀 Overseer Agent server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: port,
});