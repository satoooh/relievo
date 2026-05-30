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
    const sourceRect = coverSourceRect(element, width / height);
    this.context.drawImage(
      element,
      sourceRect.x,
      sourceRect.y,
      sourceRect.width,
      sourceRect.height,
      0,
      0,
      width,
      height,
    );

    return {
      data: this.context.getImageData(0, 0, width, height),
      width,
      height,
      sourceKind,
      timestamp: performance.now(),
    };
  }
}

function coverSourceRect(element: CanvasImageSource, targetAspect: number): { x: number; y: number; width: number; height: number } {
  const dimensions = sourceDimensions(element);
  if (!dimensions) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }

  const sourceAspect = dimensions.width / dimensions.height;
  if (sourceAspect > targetAspect) {
    const width = dimensions.height * targetAspect;
    return {
      x: (dimensions.width - width) * 0.5,
      y: 0,
      width,
      height: dimensions.height,
    };
  }

  const height = dimensions.width / targetAspect;
  return {
    x: 0,
    y: (dimensions.height - height) * 0.5,
    width: dimensions.width,
    height,
  };
}

function sourceDimensions(element: CanvasImageSource): { width: number; height: number } | undefined {
  if (element instanceof HTMLVideoElement) {
    const width = element.videoWidth || element.clientWidth;
    const height = element.videoHeight || element.clientHeight;
    return width > 0 && height > 0 ? { width, height } : undefined;
  }

  if (element instanceof HTMLImageElement) {
    const width = element.naturalWidth || element.width;
    const height = element.naturalHeight || element.height;
    return width > 0 && height > 0 ? { width, height } : undefined;
  }

  if (
    element instanceof HTMLCanvasElement ||
    (typeof OffscreenCanvas !== "undefined" && element instanceof OffscreenCanvas)
  ) {
    return element.width > 0 && element.height > 0 ? { width: element.width, height: element.height } : undefined;
  }

  if (typeof ImageBitmap !== "undefined" && element instanceof ImageBitmap) {
    return { width: element.width, height: element.height };
  }

  return undefined;
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

export function createBlankCanvas(width = 1024, height = 1024): DemoCanvasHandle {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  if (!context) {
    return { canvas, stop: () => undefined };
  }

  let animationFrame = 0;
  let stopped = false;

  const animate = (now: number) => {
    if (stopped) {
      return;
    }
    drawBlankPointField(context, width, height, now);
    animationFrame = window.requestAnimationFrame(animate);
  };
  animationFrame = window.requestAnimationFrame(animate);

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

function drawBlankPointField(context: CanvasRenderingContext2D, width: number, height: number, now: number): void {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#050607";
  context.fillRect(0, 0, width, height);

  const margin = width * 0.11;
  const size = width - margin * 2;
  const columns = 72;
  const rows = 72;
  const step = size / (columns - 1);
  const pulse = (Math.sin(now * 0.0007) + 1) * 0.5;

  context.save();
  context.translate(margin, margin);
  context.fillStyle = `rgba(180, 232, 224, ${0.32 + pulse * 0.08})`;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const wave = Math.sin(x * 0.24 + now * 0.0011) * Math.sin(y * 0.18 + now * 0.0009);
      const jitter = wave * 0.62;
      context.beginPath();
      context.arc(x * step + jitter, y * step - jitter, 1.35, 0, Math.PI * 2);
      context.fill();
    }
  }

  context.restore();
}
