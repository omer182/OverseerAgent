import express, { json } from "express";
import axios from 'axios';
import cors from "cors";
import dotenv from "dotenv";
import { validateLLMConfig, invokeChatModel } from "./lib/llm/index.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(json());

const OVERSEERR_URL = process.env.OVERSEERR_URL;
const OVERSEERR_API_KEY = process.env.OVERSEERR_API_KEY;

if (!OVERSEERR_URL || !OVERSEERR_API_KEY) {
  console.error("❌ Missing required environment variables: OVERSEERR_URL, OVERSEERR_API_KEY");
  process.exit(1);
}

// Validate LLM configuration
try {
  validateLLMConfig();
} catch (err) {
  console.error(err.message);
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
  try {
    return await invokeChatModel(prompt);
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

    return res.data.results;
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

  console.log("📦 Requesting media...");
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

// Helper to format seasons
function formatSeasons(seasons) {
  if (seasons === "all") return "all seasons";
  if (Array.isArray(seasons)) {
    if (seasons.length === 1) return `season ${seasons[0]}`;
    return `seasons ${seasons.slice(0, -1).join(", ")} and ${seasons[seasons.length - 1]}`;
  }
  return "season 1";
}


app.post("/prompt", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send("Please provide a prompt to request a movie or TV show.");
    }

    const intent = await extractMediaIntent(prompt);
    console.log("🎯 Extracted:", intent);

    const searchResults = await searchOverseerr(intent.title);

    if (searchResults.length === 0) {
      return res.status(404).send("Sorry, I couldn't find that media.");
    }

  
    const result = searchResults.find(r => (r.mediaType || r.media_type) === intent.mediaType);

    if (!result) return res.status(404).send("Sorry, I couldn't find that media.");

    // Handle already requested/available
    if (result.mediaInfo && result.mediaInfo.status) {
      const status = result.mediaInfo.status;

      if (status !== 1 && status !== 4) {
        console.log("✅ Media already available/requested");
        return res.status(200).send(`"${intent.title}" is already available or has already been requested.`);
      }

      // Partially available (status 4)
      if (status === 4 && intent.mediaType === "tv" && Array.isArray(intent.seasons)) {
        // Get available/requested seasons from Overseerr
        const availableSeasons = (result.mediaInfo.seasons || [])
          .filter(s => s.status && s.status !== 1) // status 1 = unknown/missing
          .map(s => s.seasonNumber);

        // Find which requested seasons are NOT available/requested
        const missingSeasons = intent.seasons.filter(
          season => !availableSeasons.includes(season)
        );

        if (missingSeasons.length === 0) {
          console.log("✅ All requested seasons are already available/requested");
          return res.status(200).send(`All requested seasons of "${intent.title}" are already available or requested.`);
        }

        // Only request missing seasons
        intent.seasons = missingSeasons;
      }
    }


    const profileKey = intent.profile?.toLowerCase() || "default";
    const profileConfig = profileMap[profileKey] || profileMap.default;

    await requestMedia(intent, result.id, profileConfig);
    console.log("📥 Media requested successfully");

    let message = "";
    if (intent.mediaType === "tv") {
      message = `Your request for "${intent.title}" (${formatSeasons(intent.seasons)}) has been submitted successfully!`;
    } else {
      message = `Your request for the movie "${intent.title}" has been submitted successfully!`;
    }
    res.send(message);
  } catch (err) {
    console.error("❌ MCP Error:", err.message);
    res.status(500).send("Sorry, something went wrong while processing your request.");
  }
});

app.listen(4000, () => {
  console.log("🚀 Overseer Agent server running at http://localhost:4000");
});
