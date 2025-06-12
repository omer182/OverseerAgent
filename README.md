# Overseer Agent

OverseerAgent is a Node.js server that uses AI for natural language understanding and integrates with [Overseerr](https://overseerr.dev/) to request your favorite movies or TV shows using simple prompts.

## Features

- Accepts natural language prompts to request movies or TV shows
- Uses configurable AI models (Google Gemini, Anthropic Claude) to extract intent and media details
- Searches and requests media via Overseerr API
- Supports custom profiles (e.g., Hebrew content)
- Docker-ready and easy to deploy

## Requirements

- Node.js 20+
- Access to [Overseerr](https://overseerr.dev/) instance and API key
- Access to a supported AI provider:
  - [Google Gemini API](https://ai.google.dev/) (e.g., Gemini 2.5 Pro)
  - [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started) (specifically Claude 3.7 Sonnet when `LLM_PROVIDER=anthropic`)

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
   
   **For Google Gemini (recommended):**
   ```env
   LLM_PROVIDER=gemini
   LLM_API_KEY=your_gemini_api_key
   OVERSEERR_API_KEY=your_overseerr_api_key
   OVERSEERR_URL=http://your_overseerr_instance
   ```
   
   **For Anthropic Claude (uses Claude 3.7 Sonnet):**
   ```env
   LLM_PROVIDER=anthropic
   LLM_API_KEY=your_anthropic_api_key
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
   Open your browser and go to `http://localhost::4000`


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
         - 4000:4000
       environment:
         - OVERSEERR_URL=http://overseerr:5055 # Example: if overseerr is in the same stack
         - OVERSEERR_API_KEY=your_overseerr_api_key
         # Currently supports gemini and anthropic LLM providers
         - LLM_PROVIDER=gemini/anthropic 
         - LLM_API_KEY=your_llm_api_key
       restart: unless-stopped
   ```

   - Replace the environment variable values with your actual secrets.
   - If you run Overseerr in the same stack, use the service name (`overseerr`) for `OVERSEERR_URL`.

Your OverseerAgent API will be available at `http://<your-server>:4000`.

## Using Siri Shortcuts to Call Overseer Agent

You can create a Siri Shortcut to request media using your voice. Here’s how:

1. **Ask for Text**
   - Action: *Ask for Input*
   - Prompt: `What do you want to download?`
   - Store the result as `Prompt`

2. **Get Contents of URL**
   - Action: *Get Contents of URL*
   - Method: `POST`
   - URL: `http://<your-server>:4000/api/prompt`
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