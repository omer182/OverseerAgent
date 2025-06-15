import { z } from "zod/v4";
import { MediaType } from "../../types/overseerr.js";

// Zod schemas for validation
export const MediaRequestParamsSchema = z.object({
    title: z.string().min(1, "Title is required"),
    mediaType: z.enum(["movie", "tv"] as const),
    seasons: z.union([
        z.literal("all"),
        z.literal("first"),
        z.literal("last"),
        z.literal("next"),
        z.array(z.number().int().positive())
    ]).optional().nullable(),
    quality: z.string().optional().nullable()
});

export const MediaSelectionParamsSchema = z.object({
    index: z.number().int().min(0, "Index must be non-negative"),
    profile: z.number().int().positive().nullable()
});

// TypeScript interfaces (derived from schemas)
export type MediaRequestParams = z.infer<typeof MediaRequestParamsSchema>;
export type MediaSelectionParams = z.infer<typeof MediaSelectionParamsSchema>;

export interface SimplifiedMediaResult {
    title: string;
    year: number;
    mediaType: MediaType;
    popularity: number;
}