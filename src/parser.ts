import { EMOBAR_TAG_REGEX, DIMENSIONS, type EmotionalState } from "./types.js";

export function parseEmoBarTag(text: string): EmotionalState | null {
  const match = text.match(EMOBAR_TAG_REGEX);
  if (!match) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    return null;
  }

  // Validate emotion keyword (must come first conceptually)
  if (typeof parsed.emotion !== "string" || parsed.emotion.length === 0) {
    return null;
  }

  // Validate valence: -5 to +5
  const valence = parsed.valence;
  if (typeof valence !== "number" || valence < -5 || valence > 5) return null;

  // Validate 0-10 dimensions: arousal, calm, connection, load
  for (const dim of DIMENSIONS) {
    if (dim === "valence") continue; // already validated
    const val = parsed[dim];
    if (typeof val !== "number" || val < 0 || val > 10) return null;
  }

  return {
    emotion: parsed.emotion as string,
    valence: parsed.valence as number,
    arousal: parsed.arousal as number,
    calm: parsed.calm as number,
    connection: parsed.connection as number,
    load: parsed.load as number,
  };
}
