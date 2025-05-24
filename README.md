# Overseer Agent

OverseerAgent is a Node.js server that connects to [Claude](https://www.anthropic.com/) for natural language understanding and integrates with [Overseerr](https://overseerr.dev/) to request your favorite movies or TV shows using simple prompts.

## Features

- Accepts natural language prompts to request movies or TV shows
- Uses Claude AI to extract intent and media details
- Searches and requests media via Overseerr API
- Supports custom profiles (e.g., Hebrew content)
- Docker-ready and easy to deploy

## Requirements

- Node.js 20+
- Access to [Overseerr](https://overseerr.dev/) instance and API key
- Access to [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started) and API key

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
   ```env
   CLAUDE_API_KEY=your_anthropic_api_key
   OVERSEERR_API_KEY=your_overseerr_api_key
   OVERSEERR_URL=http://your_overseerr_instance
   ```
4. **Run the server:**
   ```sh
   npm start
   ```
5. **Access the API:**
   Open your browser and go to `http://localhost:3000`

## Usage

Send a POST request to `/request` with a JSON body containing your prompt:
```json
{
  "prompt": "Recommend me some action movies"
}
```

## Docker Compose / Portainer

You can easily deploy OverseerAgent using Docker Compose, which also works seamlessly with Portainer.

1. **Create a `docker-compose.yml` file:**

   ```yaml
   version: "3.8"
   services:
     overseeragent:
       image: ghcr.io/omer182/overseeragent:latest
       container_name: overseeragent
       ports:
         - 4000:4000
       environment:
         - OVERSEERR_URL=http://overseerr:5055
         - OVERSEERR_API_KEY=your_overseerr_api_key
         - ANTHROPIC_API_KEY=your_anthropic_api_key
       restart: unless-stopped
   ```

   - Replace the environment variable values with your actual secrets.
   - If you run Overseerr in the same stack, use the service name (`overseerr`) for `OVERSEERR_URL`.

2. **Deploy with Docker Compose:**

   ```sh
   docker compose up -d
   ```

3. **Deploy with Portainer:**
   - Go to **Stacks** in Portainer.
   - Click **Add stack**.
   - Paste the above YAML.
   - Set your environment variables.
   - Deploy the stack.

Your OverseerAgent API will be available at `http://<your-server>:4000`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
