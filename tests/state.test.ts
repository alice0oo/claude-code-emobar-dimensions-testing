import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeState, readState } from "../src/state.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

describe("state", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `emobar-test-${Date.now()}.json`);
  });

  afterEach(() => {
    try { fs.unlinkSync(tmpFile); } catch {}
  });

  it("writes and reads back state", () => {
    const state = {
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
    writeState(state, tmpFile);
    const read = readState(tmpFile);
    expect(read).toEqual(state);
  });

  it("returns null for missing file", () => {
    const read = readState("/tmp/nonexistent-emobar.json");
    expect(read).toBeNull();
  });

  it("returns null for corrupted file", () => {
    fs.writeFileSync(tmpFile, "not json");
    const read = readState(tmpFile);
    expect(read).toBeNull();
  });
});
