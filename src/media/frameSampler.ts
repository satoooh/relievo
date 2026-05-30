import type { DemoSceneId, FrameSample, SourceKind } from "../types";
import { findDemoScene } from "./demoScenes";

export class FrameSampler {
  private readonly canvas = document.createElement("canvas");
  private readonly context = this.canvas.getContext("2d", { willReadFrequently: true });

  sample(element: CanvasImageSource, width: number, height: number, sourceKind: SourceKind): FrameSample {
    if (!this.context) {
      throw new Error("2D canvas context is unavailable.");
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.context.clearRect(0, 0, width, height);
    this.context.drawImage(element, 0, 0, width, height);

    return {
      data: this.context.getImageData(0, 0, width, height),
      width,
      height,
      sourceKind,
      timestamp: performance.now(),
    };
  }
}

interface DemoCanvasHandle {
  canvas: HTMLCanvasElement;
  stop: () => void;
}

export function createDemoCanvas(sceneId: DemoSceneId, width = 1280, height = 720): DemoCanvasHandle {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  if (!context) {
    return { canvas, stop: () => undefined };
  }

  drawFallback(context, width, height);

  const scene = findDemoScene(sceneId);
  const images = scene.imagePaths.map((path) => loadDemoImage(path));
  let animationFrame = 0;
  let stopped = false;

  if (scene.motion) {
    const animate = (now: number) => {
      if (stopped) {
        return;
      }
      drawMotionScene(context, images, width, height, now);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animationFrame = window.requestAnimationFrame(animate);
  } else {
    const image = images[0];
    if (image) {
      const drawStaticImage = () => drawCoverImage(context, image, width, height);
      if (image.complete && image.naturalWidth > 0) {
        drawStaticImage();
      } else {
        image.addEventListener("load", drawStaticImage);
      }
    }
  }

  return {
    canvas,
    stop: () => {
      stopped = true;
      window.cancelAnimationFrame(animationFrame);
    },
  };
}

function loadDemoImage(path: string): HTMLImageElement {
  const image = new Image();
  image.decoding = "async";
  image.src = path;
  return image;
}

function drawMotionScene(
  context: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  width: number,
  height: number,
  now: number,
): void {
  const loaded = images.filter((image) => image.complete && image.naturalWidth > 0);
  if (loaded.length === 0) {
    return;
  }

  const cycleMs = 6400;
  const progress = (now % cycleMs) / cycleMs;
  const index = Math.floor((now / cycleMs) % loaded.length);
  const current = loaded[index]!;
  const next = loaded[(index + 1) % loaded.length]!;
  const fade = smoothstep(0.68, 1, progress);
  const pan = Math.sin(progress * Math.PI * 2) * 0.028;
  const zoom = 1.045 + Math.sin(progress * Math.PI) * 0.035;

  context.clearRect(0, 0, width, height);
  drawCoverImage(context, current, width, height, zoom, pan);
  if (fade > 0) {
    context.save();
    context.globalAlpha = fade;
    drawCoverImage(context, next, width, height, 1.04, -pan);
    context.restore();
  }
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  zoom = 1,
  horizontalPan = 0,
): void {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const x = (width - drawWidth) * 0.5 + width * horizontalPan;
  const y = (height - drawHeight) * 0.5;
  context.drawImage(image, x, y, drawWidth, drawHeight);
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function drawFallback(context: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#06131d");
  gradient.addColorStop(0.42, "#1a766f");
  gradient.addColorStop(1, "#f0b66a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}
