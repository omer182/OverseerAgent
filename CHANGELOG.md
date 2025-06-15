# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support for multiple LLM providers:
  - Google Gemini (recommended)
  - Anthropic Claude
  - OpenAI
  - LiteLLM (proxy for multiple providers)
  - Ollama (local LLM runner)
- Unified API key configuration system
- Enhanced error handling and validation with Zod
- Comprehensive environment variable documentation
- ESLint configuration for code quality
- VS Code configuration for better development experience

### Changed
- **BREAKING**: Default port changed from `3000` to `4321`
- New project structure with organized modules
- Improved README with comprehensive setup instructions
- Enhanced `/prompt` endpoint with better response messages
- Refactored LLM provider system for better extensibility
- Improved search functionality to return all results
- Better season formatting helpers

### Fixed
- Enhanced error handling in `/prompt` endpoint
- Improved media search reliability
- Better validation of user inputs
