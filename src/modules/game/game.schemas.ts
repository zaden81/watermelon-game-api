import { z } from "zod";

export const updateScoreSchema = z.object({
  score: z.number().int().min(0, "Score must be non-negative"),
  levelsCompleted: z.number().int().min(0).optional(),
});

export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
