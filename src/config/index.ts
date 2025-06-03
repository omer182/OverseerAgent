import dotenv from "dotenv";

dotenv.config();

export const OVERSEERR_URL = process.env.OVERSEERR_URL;
export const OVERSEERR_API_KEY = process.env.OVERSEERR_API_KEY;

if (!OVERSEERR_URL || !OVERSEERR_API_KEY) {
  console.error("❌ Missing required environment variables: OVERSEERR_URL, OVERSEERR_API_KEY");
  process.exit(1);
}

export interface ProfileConfig {
  profileId: number;
}

export interface ProfileMap {
  [key: string]: ProfileConfig;
}

export const profileMap: ProfileMap = {
  heb: {
    profileId: 7,
  },
  default: {
    profileId: 6,
  },
}; 