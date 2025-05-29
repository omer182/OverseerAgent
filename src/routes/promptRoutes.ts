import { Hono } from 'hono';
import { MediaIntent, extractMediaIntent } from '../services/mediaIntentService.js';
import { searchOverseerr, requestMedia, OverseerrSearchResult } from '../services/overseerrService.js';

const router = new Hono();

router.post("/prompt", async (c) => {
  try {
    const { prompt } = await c.req.json<{ prompt: string }>();

    if (!prompt) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    let intent: MediaIntent = await extractMediaIntent(prompt);
    console.log("🎯 Extracted:", intent);

    const result = await searchOverseerr(intent.title);
    if (!result) {
      return c.json({ error: "Media not found" }, 404);
    }

    if (result.mediaInfo && result.mediaInfo.status) {
      const status = result.mediaInfo.status;
      // Status 1: Pending Approval, Status 4: Partially Available
      // Other statuses (e.g., 2:Processing, 3:Available, 5:Unavailable) mean we don't need to request.
      if (status !== 1 && status !== 4) { 
        console.log("✅ Media already available/requested or processing");
        return c.json({
          status: "already_processed", // Generalized status
          message: "This media is already processing, available, or has been requested.",
        });
      }

      // If partially available, check if requested seasons are among the available ones
      if (status === 4 && intent.mediaType === "tv" && Array.isArray(intent.seasons)) {
        const availableSeasons = (result.mediaInfo.seasons || [])
          .filter(s => s.status && s.status !== 1) // status 1 is pending, others are various states of available/processing
          .map(s => s.seasonNumber);
        
        const missingSeasons = intent.seasons?.filter(
          season => !availableSeasons.includes(season)
        ) || [];

        if (missingSeasons.length === 0) {
          console.log("✅ All requested seasons are already available/requested or processing");
          return c.json({
            status: "already_processed",
            message: "All requested seasons are already available, processing, or requested.",
          });
        }
        // Update intent to only request missing seasons
        intent.seasons = missingSeasons;
      }
    }

    const requested = await requestMedia(intent, result.id);
    console.log("📥 Media requested successfully:", requested);
    return c.json({ status: "success", intent });
  } catch (err: any) {
    console.error("❌ Prompt Route Error:", err.message);
    // Check if the error is from one of our services and rethrow if it's a specific message
    if (err.message === "Failed to extract media intent" || err.message === "Failed to search Overseerr" || err.message === "Failed to request media") {
        return c.json({ error: err.message }, 500); 
    }
    return c.json({ error: "Server failed to process prompt" }, 500);
  }
});

export default router; 