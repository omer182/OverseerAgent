# Overseer Agent

OverseerAgent is a Node.js server that uses AI for natural language understanding and integrates with [Overseerr](https://overseerr.dev/) to request your favorite movies or TV shows using simple prompts.

## ⚠️ Breaking Changes

- **Default port changed from `3000` to `4321`**
  - Docker Compose: Change port mapping from `3000:3000` to `4321:4321`
  - Environment variables: Set `PORT=4321` or update your reverse proxy/firewall rules
  - API calls: Update URLs from `http://localhost:3000` to `http://localhost:4321`

## Features

- Accepts natural language prompts to request movies or TV shows
- Uses configurable AI models (Google Gemini, Anthropic Claude, OpenAI, LiteLLM, Ollama) to extract intent and media details
- Searches and requests media via Overseerr API
- Supports custom profiles (e.g., Hebrew content)
- Docker-ready and easy to deploy

## Requirements

- Node.js 22+
- Access to [Overseerr](https://overseerr.dev/) instance and API key
- Access to a supported AI provider:
  - [Google Gemini API](https://ai.google.dev/) (e.g., Gemini 2.5 Flash)
  - [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started) (specifically Claude 4 Sonnet when `LLM_PROVIDER=anthropic`)
  - [OpenAI API](https://platform.openai.com/) (e.g., GPT-4o-mini when `LLM_PROVIDER=openai`)
  - [LiteLLM](https://docs.litellm.ai/) (proxy for multiple providers when `LLM_PROVIDER=litellm`)
  - [Ollama](https://ollama.ai/) (local LLM runner when `LLM_PROVIDER=ollama`)

## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/overseer-mcp.git
   cd overseer-mcp
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   Create a `.env` file and update the values:
   
   ## Environment Variables

Here's a complete reference of all environment variables used by OverseerAgent:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LLM_PROVIDER` | AI provider to use | `gemini`, `anthropic`, `openai`, `litellm`, `ollama` |
| `LLM_API_KEY` | API key for your chosen LLM provider | `your_api_key_here` |
| `OVERSEERR_API_KEY` | API key from your Overseerr instance | `your_overseerr_api_key` |
| `OVERSEERR_URL` | URL to your Overseerr instance | `http://localhost:5055` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `LLM_MODEL` | Specific model to use with your provider | Provider default | `gpt-4o-mini`, `claude-sonnet-4-20250514` |
| `LLM_BASE_URL` | Custom base URL for LiteLLM/Ollama | `http://localhost:4000` (LiteLLM)<br/>`http://localhost:11434` (Ollama) | `http://your-litellm-server:4000` |
| `PORT` | Port for the OverseerAgent server | `4321` | `4321` |

### Provider-Specific Notes

- **Gemini/Anthropic/OpenAI**: Only require `LLM_API_KEY`
- **LiteLLM**: May not require `LLM_API_KEY` depending on your proxy setup
- **Ollama**: Doesn't require `LLM_API_KEY` (runs locally)
- **LiteLLM/Ollama**: Use `LLM_BASE_URL` to specify custom server locations
   
   **For Google Gemini (recommended):**
   ```env
   LLM_PROVIDER=gemini
   LLM_API_KEY=your_gemini_api_key
   LLM_MODEL=gemini-2.0-flash-exp  # Optional, uses default if not specified
   OVERSEERR_API_KEY=your_overseerr_api_key
   OVERSEERR_URL=http://your_overseerr_instance
   ```
   
   **For Anthropic Claude:**
   ```env
   LLM_PROVIDER=anthropic
   LLM_API_KEY=your_anthropic_api_key
   LLM_MODEL=claude-3-5-sonnet-20241022  # Optional, uses default if not specified
   OVERSEERR_API_KEY=your_overseerr_api_key
   OVERSEERR_URL=http://your_overseerr_instance
   ```
   
   **For OpenAI:**
   ```env
   LLM_PROVIDER=openai
   LLM_API_KEY=your_openai_api_key
   LLM_MODEL=gpt-4o-mini  # Optional, uses default if not specified
   OVERSEERR_API_KEY=your_overseerr_api_key
   OVERSEERR_URL=http://your_overseerr_instance
   ```
   
   **For LiteLLM (proxy for multiple providers):**
   ```env
   LLM_PROVIDER=litellm
   LLM_API_KEY=your_api_key  # Optional, depends on your LiteLLM setup
   LLM_BASE_URL=http://localhost:4000  # Your LiteLLM proxy URL
   LLM_MODEL=gpt-4o-mini  # Or any model supported by your LiteLLM instance
   OVERSEERR_API_KEY=your_overseerr_api_key
   OVERSEERR_URL=http://your_overseerr_instance
   ```
   
   **For Ollama (local LLM runner):**
   ```env
   LLM_PROVIDER=ollama
   LLM_BASE_URL=http://localhost:11434  # Your Ollama server URL
   LLM_MODEL=llama3.2  # Or any model you have installed in Ollama
   OVERSEERR_API_KEY=your_overseerr_api_key
   OVERSEERR_URL=http://your_overseerr_instance
   ```

4. **Run the server:**
   ```sh
   npm run build
   ```
   ```sh
   npm start
   ```
5. **Access the API:**
   Call the API `http://localhost:4321/api/prompt`


## Usage

Send a POST request to `/api/prompt` with a JSON body containing your prompt.


```json
{
  "prompt": "download season 7 and 8 of lost"
}
```

Some other prompt examples:
- "download all season of breaking bad"
- "download Aladdin in hebrew"
- "download the latest season of solo leveling"

### Media Profiles

OverseerAgent automatically selects the appropriate media profile based on your prompt:

**Quality Examples:**
- `"download Breaking Bad in 4K"` → Selects 4K profile
- `"I want The Matrix in HD"` → Selects HD/1080p profile
- `"get Dune in Dolby Vision"` → Selects Dolby Vision profile

**Language Examples:**
- `"download Aladdin in Hebrew"` → Selects Hebrew profile
- `"I need the Hebrew movie Lebanon"` → Selects Hebrew profile

**Default Examples:**
- `"download Breaking Bad"` → Uses standard/default profile
- `"add all seasons of Friends"` → Uses standard/default profile

The AI analyzes your prompt and matches it with available profiles configured in your Radarr and Sonarr instances (accessible through Overseerr).

## Docker Compose / Portainer

You can easily deploy OverseerAgent using Docker Compose, which also works seamlessly with Portainer.

**Add to your Docker Compose**

   ```yaml
   version: "3.8"
   services:
     overseeragent:
       image: ghcr.io/omer182/overseeragent:latest # Or your custom built image
       container_name: overseeragent
       ports:
         - 4321:4321
       environment:
         - OVERSEERR_URL=http://overseerr:5055 # Example: if overseerr is in the same stack
         - OVERSEERR_API_KEY=your_overseerr_api_key
         # Currently supports gemini, anthropic, openai, litellm, and ollama LLM providers
         - LLM_PROVIDER=gemini/anthropic/openai/litellm/ollama 
         - LLM_API_KEY=your_llm_api_key
         - LLM_MODEL=your_llm_model
       restart: unless-stopped
   ```

   - Replace the environment variable values with your actual secrets.
   - If you run Overseerr in the same stack, use the service name (`overseerr`) for `OVERSEERR_URL`.

Your OverseerAgent API will be available at `http://<your-server>:4321`.

## Using Siri Shortcuts to Call Overseer Agent

You can create a Siri Shortcut to request media using your voice. Here’s how:

1. **Ask for Text**
   - Action: *Ask for Input*
   - Prompt: `What do you want to download?`
   - Store the result as `Prompt`

2. **Get Contents of URL**
   - Action: *Get Contents of URL*
   - Method: `POST`
   - URL: `http://<your-server>:4321/api/prompt`
   - Request Body: `JSON`
     - Add a field:
       - Key: `prompt`
       - Value: `Prompt` (the variable from step 1)
   - Headers:
     - Key: `Content-Type`
     - Value: `application/json`
   - Store the result as `Response`

3. **Get Dictionary Value**
   - Action: *Get Dictionary Value*
   - Get the value for key: `message` from `Response`

4. **Speak Text**
   - Action: *Speak Text*
   - Speak the value from step 3

**How it works:**  
- Siri will ask what you want to download.
- It will send your request to Overseer Agent.
- It will read out the response message.

You can trigger this shortcut by saying, “Hey Siri, [your shortcut name]”.

## License
Free to use for any purpose.

## Credits

Created by Omer S. aka Rio.

**Contributors:**  
- [kobik](https://github.com/kobik)