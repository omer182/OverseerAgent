# Project Overview

## Purpose

This project, "mcp-claude-overseerr," appears to be a backend service that integrates with Overseerr (a media request and management tool). It uses AI language models (Anthropic Claude and Google Gemini) to understand user prompts, search for media on Overseerr, and then request that media through the Overseerr API. It seems to act as an intelligent layer on top of Overseerr to simplify media requests using natural language.

## Key Libraries

- **@anthropic-ai/sdk**: SDK for interacting with Anthropic's Claude AI.
- **@google/generative-ai**: SDK for interacting with Google's Generative AI models.
- **axios**: Promise-based HTTP client for the browser and Node.js.
- **cors**: Node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
- **dotenv**: Loads environment variables from a `.env` file into `process.env`.
- **express**: Fast, unopinionated, minimalist web framework for Node.js.
- **nodemon**: Utility that will monitor for any changes in your source and automatically restart your server.

## File Structure

- `.github/`: Contains GitHub Actions workflows for CI/CD.
- `docs/`: Contains project documentation, including this README.
- `lib/`: Likely contains the core logic of the application.
- `node_modules/`: Contains all project dependencies (managed by npm or yarn).
- `.env`: (Not listed but typically present) for environment-specific configurations.
- `.gitignore`: Specifies intentionally untracked files that Git should ignore.
- `Dockerfile`: Defines the Docker image for containerizing the application.
- `index.js`: Likely the main entry point of the application.
- `package-lock.json`: Records the exact versions of dependencies.
- `package.json`: Defines project metadata, dependencies, and scripts.
- `README.md`: (Root level) General information about the project.

## Startup & Runtime

- **How to run locally**: `npm run dev` (uses nodemon for auto-restarts)
- **How to run in production**: `npm start`
- **Key commands from package.json or scripts**:
    - `npm start`: Starts the application using `node index.js --require dotenv/config`.
    - `npm run dev`: Starts the application in development mode using `nodemon index.js --require dotenv/config`.
    - `npm test`: Runs tests using `node --test test/*.test.js`.

## Database

- **Which DBs are used**: This project does not directly connect to a traditional database. It interacts with an external service called Overseerr via its API.
- **Which clients/ORMs are used and how they are configured**: `axios` is used to make HTTP requests to the Overseerr API. The Overseerr URL and API key are configured through environment variables (`OVERSEERR_URL`, `OVERSEERR_API_KEY`).

## Migrations

- **How migrations are run**: Not applicable, as there is no direct database interaction.
- **Tools and files involved**: Not applicable.

## Environment Variables

- **How they're managed**: The `dotenv` library is used to load environment variables from a `.env` file.
- **Presence of `.env` files or config layers**: A `.env` file is expected at the root of the project.
- **Required Environment Variables**:
    - `OVERSEERR_URL`: The URL of your Overseerr instance.
    - `OVERSEERR_API_KEY`: The API key for your Overseerr instance.
    - `LLM_PROVIDER`: Specifies which Language Model provider to use. Supported values are `gemini` or `anthropic`.
    - `GEMINI_API_KEY`: Required if `LLM_PROVIDER` is set to `gemini`. Your API key for Google Gemini.
    - `ANTHROPIC_API_KEY`: Required if `LLM_PROVIDER` is set to `anthropic`. Your API key for Anthropic Claude.

## API (Swagger/OpenAPI)

- No OpenAPI/Swagger files were found in the project.

## Processes & Gotchas

- **Overseerr Dependency**: The application is heavily reliant on a running Overseerr instance and requires its URL and API key to be configured via environment variables (`OVERSEERR_URL`, `OVERSEERR_API_KEY`).
- **LLM Configuration**: The application requires configuration for the LLM providers (Anthropic Claude/Google Gemini). The specifics of this configuration are validated at startup by `validateLLMConfig()` in `lib/llm/index.js`, and missing or invalid configuration will cause the application to exit.
- **Profile Mapping**: The `index.js` file contains a `profileMap` object that defines specific configurations (like `profileId`, `rootFolder`, `languageProfileId`, `tags`) for different profiles (e.g., "heb", "default"). This mapping is used when requesting media.
- **Media Intent Extraction**: The core logic involves an `extractMediaIntent` function which calls an LLM to parse the user's prompt into a structured intent (e.g., title, mediaType, seasons, profile).
- **TV Show Season Handling**: There's specific logic to handle requests for TV show seasons, including checking for already available/requested seasons and only requesting missing ones.
- **Error Handling**: The application includes error handling for API calls to Overseerr and LLM interactions, logging errors to the console and returning appropriate HTTP status codes.
