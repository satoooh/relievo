import type {
  DepthEstimationOutput,
  DepthEstimationPipeline,
  DeviceType,
  RawImage as RawImageType,
} from "@huggingface/transformers";
import type { DepthBackendSelection, DepthResult, FrameSample } from "../types";
import { getDepthBackendMeta } from "./depthBackends";

interface LoadedDepthModel {
  estimator: DepthEstimationPipeline;
  rawImage: typeof RawImageType;
}

const loadedModels = new Map<DepthBackendSelection, Promise<LoadedDepthModel>>();

export async function estimateDepthAnything(sample: FrameSample, backend: DepthBackendSelection): Promise<DepthResult> {
  const started = performance.now();
  const model = await getDepthModel(backend);
  const image = new model.rawImage(toRgb(sample.data), sample.width, sample.height, 3);
  const output = await model.estimator(image);
  const depth = normalizeDepthImage(output.depth, sample.width, sample.height);

  return {
    backend,
    depth,
    height: sample.height,
    inferenceMs: performance.now() - started,
    width: sample.width,
  };
}

async function getDepthModel(backend: DepthBackendSelection): Promise<LoadedDepthModel> {
  const cached = loadedModels.get(backend);
  if (cached) {
    return cached;
  }

  const loading = loadDepthModel(backend).catch((error) => {
    loadedModels.delete(backend);
    throw error;
  });
  loadedModels.set(backend, loading);
  return loading;
}

async function loadDepthModel(backend: DepthBackendSelection): Promise<LoadedDepthModel> {
  const meta = getDepthBackendMeta(backend);
  if (!meta.modelId) {
    throw new Error(`${meta.label} does not have a model id.`);
  }

  const { pipeline, RawImage } = await import("@huggingface/transformers");
  const devices: DeviceType[] = canUseWebGPU() ? ["webgpu", "wasm"] : ["wasm"];
  let lastError: unknown;

  for (const device of devices) {
    try {
      const estimator = await pipeline("depth-estimation", meta.modelId, {
        device,
        dtype: meta.dtype,
        use_external_data_format: meta.useExternalDataFormat,
      });
      return { estimator, rawImage: RawImage };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${meta.label} could not be loaded.`);
}

function canUseWebGPU(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

function toRgb(image: ImageData): Uint8ClampedArray {
  const rgb = new Uint8ClampedArray(image.width * image.height * 3);
  const source = image.data;

  for (let sourceIndex = 0, targetIndex = 0; sourceIndex < source.length; sourceIndex += 4, targetIndex += 3) {
    rgb[targetIndex] = source[sourceIndex] ?? 0;
    rgb[targetIndex + 1] = source[sourceIndex + 1] ?? 0;
    rgb[targetIndex + 2] = source[sourceIndex + 2] ?? 0;
  }

  return rgb;
}

function normalizeDepthImage(depthImage: DepthEstimationOutput["depth"], width: number, height: number): Float32Array {
  const depth = new Float32Array(width * height);
  const data = depthImage.data;
  const channels = depthImage.channels;

  for (let y = 0; y < height; y += 1) {
    const sourceY = Math.min(depthImage.height - 1, Math.floor((y / height) * depthImage.height));
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(depthImage.width - 1, Math.floor((x / width) * depthImage.width));
      const sourceIndex = (sourceY * depthImage.width + sourceX) * channels;
      depth[y * width + x] = (data[sourceIndex] ?? 0) / 255;
    }
  }

  return depth;
}
