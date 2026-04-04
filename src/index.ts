export { readState } from "./state.js";
export { computeStressIndex } from "./stress.js";
export { parseEmoBarTag } from "./parser.js";
export { analyzeBehavior, computeDivergence } from "./behavioral.js";
export { formatState, formatCompact, formatMinimal } from "./display.js";
export { configureStatusLine, restoreStatusLine } from "./setup.js";
export type { EmotionalState, EmoBarState, BehavioralSignals } from "./types.js";
export { STATE_FILE } from "./types.js";
