import type { DemoSceneId, MediaSourceHandle } from "../types";
import { createDemoCanvas } from "./frameSampler";

export function createDemoSource(sceneId: DemoSceneId): MediaSourceHandle {
  const handle = createDemoCanvas(sceneId);
  return {
    kind: "demo",
    element: handle.canvas,
    stop: handle.stop,
  };
}

export async function createImageSource(file: File): Promise<MediaSourceHandle> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  try {
    await image.decode().catch(() => waitForImageLoad(image));
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }

  return {
    kind: "image",
    element: image,
    stop: () => URL.revokeObjectURL(url),
  };
}

export async function createVideoSource(file: File): Promise<MediaSourceHandle> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = url;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.controls = false;
  video.preload = "auto";
  try {
    await waitForVideoMetadata(video);
    await video.play();
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }

  return {
    kind: "video",
    element: video,
    stop: () => {
      video.pause();
      URL.revokeObjectURL(url);
    },
  };
}

function waitForImageLoad(image: HTMLImageElement): Promise<void> {
  if (image.complete && image.naturalWidth > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => reject(new Error("Image decode failed.")), { once: true });
  });
}

function waitForVideoMetadata(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA && video.videoWidth > 0 && video.videoHeight > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    video.addEventListener("loadedmetadata", () => resolve(), { once: true });
    video.addEventListener("error", () => reject(new Error("Video metadata could not be loaded.")), { once: true });
  });
}

export async function createWebcamSource(): Promise<MediaSourceHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();

  return {
    kind: "webcam",
    element: video,
    stop: () => {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    },
  };
}
