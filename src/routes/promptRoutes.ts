import { Hono } from 'hono';
import { Agent } from '../lib/agent/index.js';
import { config } from '../config/env.js';

const router = new Hono();
const agent = new Agent(config.llm.provider);

router.post("/prompt", async (c) => {
  try {
    const { prompt } = await c.req.json<{ prompt: string }>();

    if (!prompt) {
      return c.json({ message: "Prompt is required" }, 400);
    }

    const response = await agent.handleMediaRequest(prompt);

    return c.json({ message: response }, 200);
  } catch (err: unknown) {
    console.error("❌ Prompt Route Error:", err instanceof Error ? err.message : String(err));
    console.log(err instanceof Error ? err.stack : String(err));
    // Check if the error is from one of our services and rethrow if it's a specific message
    if (err instanceof Error) {
      if (err.message === "Failed to extract media intent" || 
          err.message === "Failed to search Overseerr" || 
          err.message === "Failed to request media") {
        return c.json({ message: err.message }, 500); 
      }
    }
    return c.json({ message: "Server failed to process prompt" }, 500);
  }
});

export default router; 