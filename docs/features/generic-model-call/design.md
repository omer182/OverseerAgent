# Feature: Generic Model Call Support

## Problem / Motivation

The current implementation for extracting media intent is tightly coupled to the Anthropic Claude API. This limits flexibility and makes it difficult to switch to other LLM providers, such as Google's Gemini, or to experiment with different models. A generic model call interface is needed to:

- Allow the server operator to choose their preferred LLM provider.
- Enable easier updates or changes to the underlying LLM without significant code refactoring.
- Provide a centralized place for managing LLM interactions, including prompt construction and error handling.
- Support future enhancements, like using different models for different tasks.

## Scope

### In Scope:

-   **Initial Provider Support:** Implement support for Google Gemini 2.5 Pro and Anthropic Claude 3.7 Sonnet as initial LLM providers.
-   **Configuration:**
    -   The LLM provider (e.g., "gemini", "anthropic") will be configurable via an environment variable (e.g., `LLM_PROVIDER`). When `LLM_PROVIDER=anthropic` is set, the system will use Claude 3.7 Sonnet.
    -   API keys for each supported provider will be configurable via environment variables (e.g., `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`).
-   **Dynamic Prompting:** The system will use provider-specific system prompts or prompt templates. The selection of the prompt/template will be based on the configured `LLM_PROVIDER`.
-   **Startup Validation:** The application will validate the `LLM_PROVIDER` configuration and the presence of the corresponding API key upon startup. It will exit with a clear error message if the configuration is invalid or the key is missing.
-   **Refactor `extractMediaIntent`:** The existing `extractMediaIntent` function in `index.js` will be refactored to use the new generic model call mechanism.
-   **JSON Output:** The generic model call interface will be designed to request and parse JSON-structured output from the LLM, similar to the current functionality.

### Out of Scope (for initial version):

-   A UI for configuring LLM providers or API keys (configuration will be via environment variables only).
-   Support for non-JSON LLM outputs (e.g., plain text, streaming responses).
-   Advanced features like model fine-tuning, automatic model selection based on performance, or complex prompt chaining.
-   Dynamic loading of provider-specific SDKs (initially, supported provider logic will be part of the main codebase). 