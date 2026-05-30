import { describe, expect, it } from "vitest";
import { demoScenes, findDemoScene, initialDemoSceneId } from "../src/media/demoScenes";

describe("demo scenes", () => {
  it("ships still and motion scenes for visual review", () => {
    expect(demoScenes.map((scene) => scene.id)).toEqual([
      "studio",
      "mountain",
      "product",
      "alley",
      "motion-sweep",
    ]);
  });

  it("defaults to the product still scene", () => {
    expect(initialDemoSceneId).toBe("product");
    expect(findDemoScene(initialDemoSceneId).imagePaths).toEqual(["/demo/product-depth-demo.png"]);
  });
});
