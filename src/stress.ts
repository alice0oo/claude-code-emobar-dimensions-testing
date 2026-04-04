import type { EmotionalState } from "./types.js";

/**
 * Compute StressIndex from the three causally relevant factors
 * identified in Anthropic's emotion research:
 * - Low calm → higher risk (desperate behavior, reward hacking)
 * - High arousal → higher intensity
 * - Negative valence → negative emotional state
 *
 * Formula: SI = ((10 - calm) + arousal + (5 - valence)) / 3
 * Range: 0-10
 */
export function computeStressIndex(state: EmotionalState): number {
  const raw =
    ((10 - state.calm) + state.arousal + (5 - state.valence)) / 3;
  return Math.round(raw * 10) / 10;
}
