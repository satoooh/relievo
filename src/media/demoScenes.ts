import type { DemoSceneId } from "../types";

export interface DemoScene {
  id: DemoSceneId;
  imagePaths: string[];
  name: string;
  motion: boolean;
}

export const demoScenes: DemoScene[] = [
  {
    id: "studio",
    imagePaths: ["/demo/studio-depth-demo.png"],
    name: "Studio interior",
    motion: false,
  },
  {
    id: "mountain",
    imagePaths: ["/demo/mountain-depth-demo.png"],
    name: "Mountain vista",
    motion: false,
  },
  {
    id: "product",
    imagePaths: ["/demo/product-depth-demo.png"],
    name: "Product still",
    motion: false,
  },
  {
    id: "alley",
    imagePaths: ["/demo/alley-depth-demo.png"],
    name: "Night alley",
    motion: false,
  },
  {
    id: "motion-sweep",
    imagePaths: [
      "/demo/product-depth-demo.png",
      "/demo/studio-depth-demo.png",
      "/demo/alley-depth-demo.png",
      "/demo/mountain-depth-demo.png",
    ],
    name: "Motion sweep",
    motion: true,
  },
];

export const initialDemoSceneId: DemoSceneId = "product";

export function findDemoScene(id: DemoSceneId): DemoScene {
  return demoScenes.find((scene) => scene.id === id) ?? demoScenes[0]!;
}
