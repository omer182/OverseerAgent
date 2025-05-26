# Implementation Plan: Generic Model Call Support

## Configuration & Environment

- [x] Add `LLM_PROVIDER` environment variable to `.env` example/documentation
- [x] Add `GEMINI_API_KEY` environment variable to `.env` example/documentation
- [x] Update environment variable validation in `index.js` startup to check `LLM_PROVIDER` and corresponding API key
- [x] Add graceful error handling for missing or invalid `LLM_PROVIDER` configuration

## Core LLM Interface

- [x] Create `lib/llm/` directory structure
- [x] Create `lib/llm/ModelProvider.js` base class/interface for LLM providers
- [x] Create `lib/llm/GeminiProvider.js` implementation for Google Gemini 2.5 Pro
- [x] Create `lib/llm/index.js` factory function to instantiate the correct provider based on `LLM_PROVIDER`
- [x] Implement `invokeChatModel(userPrompt)` function that uses the provider factory

## Provider Implementation

- [x] Install Google Generative AI SDK (`@google/generative-ai`) dependency in `package.json`
- [x] Implement Gemini API client setup in `GeminiProvider.js`
- [x] Create provider-specific system prompt for media intent extraction (Gemini-optimized)
- [x] Implement JSON response parsing and validation for Gemini responses
- [x] Add error handling for Gemini API failures and rate limiting

## Integration & Refactoring

- [x] Refactor `extractMediaIntent()` function in `index.js` to use new `invokeChatModel()`
- [x] Remove direct Anthropic API calls from `extractMediaIntent()`
- [x] Update imports in `index.js` to include new LLM module
- [x] Preserve existing behavior and response format for `/prompt` endpoint

## Error Handling

- [x] Add comprehensive error handling for unsupported `LLM_PROVIDER` values
- [x] Implement graceful fallback messaging when LLM calls fail
- [x] Add logging for LLM provider selection and API call success/failure
- [x] Ensure error messages don't expose sensitive API key information

## LLM Provider System

- [ ] Create `AnthropicProvider.js` in `lib/llm/` directory
- [ ] Add Claude 3.7 Sonnet model configuration to `AnthropicProvider`
- [ ] Implement `generateResponse()` method for Anthropic API calls
- [ ] Add Claude-optimized system prompt for media intent extraction
- [ ] Handle Anthropic-specific API errors and rate limiting

## Configuration & Validation

- [ ] Update `validateLLMConfig()` in `lib/llm/index.js` to support `anthropic` provider
- [ ] Add `ANTHROPIC_API_KEY` validation when `LLM_PROVIDER=anthropic`
- [ ] Update `createProvider()` function to instantiate `AnthropicProvider`
- [ ] Add `anthropic` case to API key selection logic in `invokeChatModel()`

## Dependencies

- [ ] Add `@anthropic-ai/sdk` package to `package.json`
- [ ] Update package dependencies with `npm install`

## Environment Configuration

- [ ] Update `.env` example in `README.md` to include Anthropic configuration
- [ ] Add validation for Claude 3.7 Sonnet model specification
- [ ] Ensure startup validation exits cleanly with clear error messages for missing keys

## Documentation

- [x] Update `README.md` with new environment variable requirements
- [x] Add configuration examples for Gemini setup
- [x] Document the new LLM provider architecture in code comments
- [x] Update any existing API documentation to reflect the generic model support
- [ ] Update `README.md` with Anthropic Claude 3.7 Sonnet setup instructions
- [ ] Add example `.env` configuration for Anthropic provider
- [ ] Update Docker Compose example to include `ANTHROPIC_API_KEY` option
- [ ] Document provider-specific features or limitations

## Testing & Error Handling

- [ ] Test `extractMediaIntent()` function with Claude 3.7 Sonnet
- [ ] Verify JSON output parsing works correctly with Anthropic responses
- [ ] Test provider switching via `LLM_PROVIDER` environment variable
- [ ] Validate error handling for invalid API keys and rate limits 