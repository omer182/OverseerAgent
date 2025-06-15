import { z } from 'zod/v4';

// Schema definitions - all providers have the same shape, just different validation rules
const llmProviders = ['gemini', 'anthropic', 'openai', 'litellm', 'ollama'].sort();
const LlmProviderSchema = z.enum(llmProviders as [string, ...string[]], {
  message: `Invalid LLM_PROVIDER. Must be one of: ${llmProviders.join(', ')}.`,
});

// LLM config schema
const LlmConfigSchema = z.object({
  provider: LlmProviderSchema,
  apiKey: z.string({ error: "LLM_API_KEY is required" }).optional(),
  model: z.string({ error: "LLM_MODEL must be a string" }).optional(),
  baseUrl: z.string({ error: "LLM_BASE_URL must be a string" })
    .url("LLM_BASE_URL must be a valid URL")
    .optional(),
  temperature: z.coerce.number({ error: "LLM_TEMPERATURE must be a number" })
    .min(0, "LLM_TEMPERATURE must be between 0 and 1")
    .max(1, "LLM_TEMPERATURE must be between 0 and 1")
    .default(0.3),
}).refine((data) => {
  // Business rule: API key required for cloud providers
  const cloudProviders = ['gemini', 'anthropic', 'openai'];
  if (cloudProviders.includes(data.provider) && !data.apiKey) {
    return false;
  }
  return true;
}, {
  message: `LLM_API_KEY is required for cloud providers (${['gemini', 'anthropic', 'openai'].join(', ')})`,
  path: ['apiKey']
});

// Overseerr config schema
const OverseerrConfigSchema = z.object({
  url: z.string({ error: "OVERSEERR_URL is required" })
    .url("OVERSEERR_URL must be a valid URL"),
  apiKey: z.string({ error: "OVERSEERR_API_KEY is required" })
});

// Server config schema
const ServerConfigSchema = z.object({
  port: z.coerce.number({ error: "PORT must be a number" })
    .int("PORT must be an integer")
    .min(1, "PORT must be between 1 and 65535")
    .max(65535, "PORT must be between 1 and 65535")
    .default(4321),
  nodeEnv: z.enum(['development', 'production', 'test'], {
    error: "NODE_ENV must be one of: development, production, test"
  }).default('production'),
});

// App config schema
const AppConfigSchema = z.object({
  llm: LlmConfigSchema,
  overseerr: OverseerrConfigSchema,
  server: ServerConfigSchema,
});

// Type inference
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type LlmProvider = z.infer<typeof LlmProviderSchema>;

// Parse and validate environment variables
function parseEnvConfig(): AppConfig {
    const result = AppConfigSchema.safeParse({
      llm: {
        provider: process.env.LLM_PROVIDER,
        apiKey: process.env.LLM_API_KEY,
        model: process.env.LLM_MODEL,
        baseUrl: process.env.LLM_BASE_URL,
        temperature: process.env.LLM_TEMPERATURE,
      },
      overseerr: {
        url: process.env.OVERSEERR_URL,
        apiKey: process.env.OVERSEERR_API_KEY,
      },
      server: {
        port: process.env.PORT,
        nodeEnv: process.env.NODE_ENV,
      },
    });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        console.error(`❌ ${issue.message}`);
      });
      process.exit(1);
    }

    return result.data;
}

// Export validated config
export const config = parseEnvConfig();
