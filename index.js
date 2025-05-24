import express, { json } from "express";
import axios from 'axios';
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(json());

const OVERSEERR_URL = process.env.OVERSEERR_URL;
const OVERSEERR_API_KEY = process.env.OVERSEERR_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!OVERSEERR_URL || !OVERSEERR_API_KEY || !ANTHROPIC_API_KEY) {
  console.error("❌ Missing required environment variables.");
  process.exit(1);
}

const overseerrHeaders = {
  "X-Api-Key": OVERSEERR_API_KEY,
  "Content-Type": "application/json",
};

const profileMap = {
  heb: {
    profileId: 7,
    rootFolder: "/media/movies",
    languageProfileId: 2,
    tags: [10],
  },
  default: {
    profileId: 6,
    rootFolder: "/movies",
    languageProfileId: 1,
    tags: [],
  },
};

async function extractMediaIntent(prompt) {
  const system = `You're an assistant that extracts media request information from user prompts.

Analyze the prompt and return a JSON object with the following structure:
{
  "title": "exact title of the movie/show",
  "mediaType": "movie" or "tv",
  "seasons": "all" or [1,2,3] (array of season numbers, only for TV shows),
  "profile": "heb" or null (if Hebrew content is requested)
}

Examples:
- "I want to watch Breaking Bad season 1" → {"title": "Breaking Bad", "mediaType": "tv", "seasons": [1]}
- "Add all seasons of Friends" → {"title": "Friends", "mediaType": "tv", "seasons": "all"}
- "I need the Hebrew movie Lebanon" → {"title": "Lebanon", "mediaType": "movie", "profile": "heb"}`;


  const body = {
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 100,
    temperature: 0,
    system,
    messages: [
      { role: "user", content: `Prompt: "${prompt}"\nRespond with JSON only.` },
    ],
  };

  try {
    const res = await axios.post("https://api.anthropic.com/v1/messages", body, {
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    });

    console.log("Claude response:", res.data.content[0].text);


    if (!res.data || !res.data.content || !res.data.content[0]?.text) {
      throw new Error("Invalid response from Anthropic API");
    }

    
    const jsonText = res.data.content[0].text.trim();
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("❌ Error extracting media intent:", err);
    throw new Error("Failed to extract media intent");
  }
}

async function searchOverseerr(title) {
  try {
    console.log("🔍 Searching Overseerr for:", title);
    const res = await axios.get(`${OVERSEERR_URL}/api/v1/search`, {
      params: { query: encodeURIComponent(title) },
      headers: overseerrHeaders,
    });

    return res.data.results[0];
  } catch (err) {
    console.error("❌ Error searching Overseerr:", err);
    throw new Error("Failed to search Overseerr");
  }
}

async function requestMedia(intent, mediaId) {
  const mediaType = intent.mediaType;
  const isHebrew = intent.profile === "heb";
  const rootFolder = mediaType === 'tv' ? '/media/tv' : '/media/movies';

  const payload = {
    mediaType,
    mediaId,
    profileId: isHebrew ? 7 : 6,
    rootFolder,
    serverId: 0,
    languageProfileId: 1
  };

 // Handle TV show seasons
 if (mediaType === 'tv') {
  payload.tvdbId = mediaId;
  
  if (intent.seasons === 'all') {
    payload.seasons = 'all';
  } else if (Array.isArray(intent.seasons)) {
    payload.seasons = intent.seasons;
  } else {
    payload.seasons = [1]; // Default to season 1
  }
}

  console.log("📦 Requesting media with payload:", payload);
  try {
    const res = await axios.post(
      `${OVERSEERR_URL}/api/v1/request`,
      payload,
      { headers: overseerrHeaders }
    );

    if (!res.data) {
      throw new Error("Invalid response from Overseerr API");
    }

    return res.data;
  } catch (err) {
    console.error("❌ Error requesting media:", err.message);
    throw new Error("Failed to request media");
  }
}

app.post("/prompt", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const intent = await extractMediaIntent(prompt);
    console.log("🎯 Extracted:", intent);

    const result = await searchOverseerr(intent.title);
    if (!result) return res.status(404).json({ error: "Media not found" });

    const profileKey = intent.profile?.toLowerCase() || "default";
    const profileConfig = profileMap[profileKey] || profileMap.default;

    const requested = await requestMedia(intent, result.id, profileConfig);
    res.json({ status: "success", media: result, request: requested });

  } catch (err) {
    console.error("❌ MCP Error:", err.message);
    res.status(500).json({ error: "Server failed to process prompt" });
  }
});

app.listen(4000, () => {
  console.log("🚀 MCP + Claude server running at http://localhost:4000");
});
