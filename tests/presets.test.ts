import { describe, expect, it } from "vitest";
import { findPreset, initialPresetId, presets } from "../src/presets";

describe("presets", () => {
  it("ships a distinct preset set", () => {
    expect(presets.length).toBeGreaterThanOrEqual(6);
    expect(new Set(presets.map((preset) => preset.id)).size).toBe(presets.length);
  });

  it("has a valid initial preset", () => {
    expect(findPreset(initialPresetId).id).toBe(initialPresetId);
  });
});
