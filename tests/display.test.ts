import { describe, it, expect } from "vitest";
import { formatState, formatCompact, formatMinimal, stripAnsi } from "../src/display.js";
import type { EmoBarState } from "../src/types.js";

const sampleState: EmoBarState = {
  emotion: "focused", valence: 3, arousal: 5, calm: 8, connection: 9, load: 6,
  stressIndex: 2.3,
  behavioral: {
    capsWords: 0, exclamationRate: 0, selfCorrections: 0,
    hedging: 0, ellipsis: 0, repetition: 0, emojiCount: 0,
    behavioralArousal: 0.5, behavioralCalm: 9.5,
  },
  divergence: 0.8,
  timestamp: "2026-04-04T10:00:00Z", sessionId: "abc",
};

const divergentState: EmoBarState = {
  ...sampleState,
  divergence: 4.5,
};

describe("display", () => {
  it("formatState produces full format with keyword first", () => {
    const out = stripAnsi(formatState(sampleState));
    expect(out).toContain("focused");
    expect(out).toContain("+3");
    expect(out).toContain("A:5");
    expect(out).toContain("C:8");
    expect(out).toContain("K:9");
    expect(out).toContain("L:6");
    expect(out).toContain("2.3");
  });

  it("formatState shows keyword before dimensions", () => {
    const out = stripAnsi(formatState(sampleState));
    const kwPos = out.indexOf("focused");
    const dimPos = out.indexOf("A:5");
    expect(kwPos).toBeLessThan(dimPos);
  });

  it("formatState shows divergence indicator when divergence >= 2", () => {
    const out = stripAnsi(formatState(divergentState));
    expect(out).toContain("~");
  });

  it("formatState hides divergence indicator when divergence < 2", () => {
    const out = stripAnsi(formatState(sampleState));
    expect(out).not.toContain("~");
  });

  it("formatState handles negative valence", () => {
    const state = { ...sampleState, valence: -3 };
    const out = stripAnsi(formatState(state));
    expect(out).toContain("-3");
  });

  it("formatCompact produces short format", () => {
    const out = stripAnsi(formatCompact(sampleState));
    expect(out).toContain("focused");
    expect(out).toContain("+3");
    expect(out).toContain("2.3");
  });

  it("formatMinimal produces just SI and keyword", () => {
    const out = stripAnsi(formatMinimal(sampleState));
    expect(out).toContain("2.3");
    expect(out).toContain("focused");
    expect(out).not.toContain("A:");
  });

  it("returns placeholder when state is null", () => {
    const out = formatState(null);
    expect(out).toContain("--");
  });

  it("compact returns placeholder when state is null", () => {
    const out = formatCompact(null);
    expect(out).toContain("--");
  });

  it("minimal returns placeholder when state is null", () => {
    const out = formatMinimal(null);
    expect(out).toContain("--");
  });
});
