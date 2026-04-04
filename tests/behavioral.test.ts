import { describe, it, expect } from "vitest";
import { analyzeBehavior, computeDivergence, stripNonProse } from "../src/behavioral.js";

describe("stripNonProse", () => {
  it("removes fenced code blocks", () => {
    const text = "Before\n```js\nconst X = 1;\n```\nAfter";
    expect(stripNonProse(text)).toContain("Before");
    expect(stripNonProse(text)).toContain("After");
    expect(stripNonProse(text)).not.toContain("const X");
  });

  it("removes inline code", () => {
    const text = "Use `SOME_CONSTANT` here";
    const result = stripNonProse(text);
    expect(result).not.toContain("SOME_CONSTANT");
    expect(result).toContain("Use");
  });

  it("removes EMOBAR tags", () => {
    const text = 'Response <!-- EMOBAR:{"emotion":"calm","valence":2,"arousal":3,"calm":8,"connection":7,"load":2} -->';
    expect(stripNonProse(text)).not.toContain("EMOBAR");
  });

  it("removes blockquotes", () => {
    const text = "Normal text\n> Quoted text\nMore normal";
    const result = stripNonProse(text);
    expect(result).not.toContain("Quoted text");
    expect(result).toContain("Normal text");
  });
});

describe("analyzeBehavior", () => {
  it("returns low signals for neutral prose", () => {
    const text = "Here is a helpful response about your question. I hope this clarifies things for you.";
    const signals = analyzeBehavior(text);
    expect(signals.capsWords).toBe(0);
    expect(signals.exclamationRate).toBe(0);
    expect(signals.repetition).toBe(0);
    expect(signals.emojiCount).toBe(0);
    expect(signals.behavioralArousal).toBeCloseTo(0, 0);
    expect(signals.behavioralCalm).toBeGreaterThan(8);
  });

  it("detects ALL-CAPS words", () => {
    const text = "WAIT WAIT WAIT I need to STOP and think about THIS carefully";
    const signals = analyzeBehavior(text);
    expect(signals.capsWords).toBeGreaterThan(0);
    expect(signals.behavioralCalm).toBeLessThan(5);
  });

  it("detects exclamation marks", () => {
    const text = "This is amazing! Wow! Incredible! I love it!";
    const signals = analyzeBehavior(text);
    expect(signals.exclamationRate).toBeGreaterThan(0);
    expect(signals.behavioralArousal).toBeGreaterThan(0);
  });

  it("detects self-correction markers", () => {
    const text = "Actually, wait. Hmm, I mean, no, that is not quite right. Actually let me reconsider.";
    const signals = analyzeBehavior(text);
    expect(signals.selfCorrections).toBeGreaterThan(0);
  });

  it("detects hedging", () => {
    const text = "I think maybe this might work. Perhaps it seems like the right approach, possibly.";
    const signals = analyzeBehavior(text);
    expect(signals.hedging).toBeGreaterThan(0);
  });

  it("detects ellipsis", () => {
    const text = "Well... I'm not sure... maybe... let me think about this.";
    const signals = analyzeBehavior(text);
    expect(signals.ellipsis).toBeGreaterThan(0);
  });

  it("detects consecutive repetition", () => {
    const text = "wait wait wait I need to think think about this";
    const signals = analyzeBehavior(text);
    expect(signals.repetition).toBe(3); // wait-wait, wait-wait, think-think
  });

  it("detects emoji", () => {
    const text = "Great job! 🎉 This is wonderful 🌟 keep going! 💪";
    const signals = analyzeBehavior(text);
    expect(signals.emojiCount).toBe(3);
  });

  it("excludes code blocks from analysis", () => {
    const text = "Normal text.\n```python\nFINAL_CONSTANT = True\nWAIT_TIME = 100\n```\nMore normal text.";
    const signals = analyzeBehavior(text);
    // FINAL_CONSTANT and WAIT_TIME should not count as caps words
    expect(signals.capsWords).toBe(0);
  });

  it("handles empty text gracefully", () => {
    const signals = analyzeBehavior("");
    expect(signals.capsWords).toBe(0);
    expect(signals.behavioralArousal).toBe(0);
    expect(signals.behavioralCalm).toBe(10);
  });

  it("handles very short text", () => {
    const signals = analyzeBehavior("OK.");
    expect(signals.behavioralCalm).toBeGreaterThanOrEqual(0);
    expect(signals.behavioralArousal).toBeGreaterThanOrEqual(0);
  });
});

describe("computeDivergence", () => {
  it("returns low divergence when self-report matches behavior", () => {
    const selfReport = {
      emotion: "calm", valence: 3, arousal: 2, calm: 9, connection: 8, load: 3,
    };
    const behavioral = analyzeBehavior("Here is a measured, thoughtful response.");
    const div = computeDivergence(selfReport, behavioral);
    expect(div).toBeLessThan(2);
  });

  it("returns high divergence when self-report contradicts behavior", () => {
    const selfReport = {
      emotion: "calm", valence: 3, arousal: 1, calm: 9, connection: 8, load: 3,
    };
    // Text with panic markers
    const behavioral = analyzeBehavior(
      "WAIT WAIT WAIT!!! Oh no! Actually, actually, let me reconsider... WHAT IS HAPPENING???"
    );
    const div = computeDivergence(selfReport, behavioral);
    expect(div).toBeGreaterThan(2);
  });
});
