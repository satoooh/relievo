import { describe, expect, it } from "vitest";
import { findPreset, initialPresetId, presets } from "../src/presets";

describe("presets", () => {
  it("ships a focused preset language", () => {
    expect(presets.length).toBeGreaterThanOrEqual(1);
    expect(new Set(presets.map((preset) => preset.id)).size).toBe(presets.length);
    expect(presets.map((preset) => preset.id)).toContain("lidar-scan");
  });

  it("has a valid initial preset", () => {
    expect(findPreset(initialPresetId).id).toBe(initialPresetId);
  });
});
