import { describe, expect, it } from "vitest";
import { findPreset, initialPresetId, presets } from "../src/presets";

describe("presets", () => {
  it("ships six visually distinct presets", () => {
    expect(presets).toHaveLength(6);
    expect(new Set(presets.map((preset) => preset.id)).size).toBe(6);
  });

  it("has a valid initial preset", () => {
    expect(findPreset(initialPresetId).id).toBe(initialPresetId);
  });
});
