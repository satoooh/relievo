import type { MediaSourceHandle } from "../types";
import { createDemoCanvas } from "./frameSampler";

export function createDemoSource(): MediaSourceHandle {
  return {
    kind: "demo",
    element: createDemoCanvas(),
    stop: () => undefined,
  };
}

export async function createImageSource(file: File): Promise<MediaSourceHandle> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();

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
  await video.play();

  return {
    kind: "video",
    element: video,
    stop: () => {
      video.pause();
      URL.revokeObjectURL(url);
    },
  };
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
