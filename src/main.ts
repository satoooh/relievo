import "./style.css";
import { defaultParams, qualityLabel } from "./params";
import { DepthPipeline } from "./depth/DepthPipeline";
import { depthBackendLabel, isDepthAnythingBackend } from "./depth/depthBackends";
import { TemporalSmoother } from "./depth/smoothing";
import { CanvasRecorder, downloadCanvasPNG, timestamp } from "./export/capture";
import { FrameSampler } from "./media/frameSampler";
import { createDemoSource, createImageSource, createVideoSource, createWebcamSource } from "./media/mediaSources";
import { findPreset, initialPresetId } from "./presets";
import { ReliefRenderer } from "./renderer/ReliefRenderer";
import { createAdvancedGui } from "./ui/lilGui";
import { bindParamControls, createView, syncView } from "./ui/view";
import { RateMeter, detectWebGPU } from "./performance";
import type { MediaSourceHandle, ReliefParams, RuntimeStats } from "./types";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root.");
}

const params: ReliefParams = { ...defaultParams, ...findPreset(initialPresetId).params };
const elements = createView(root, params);
const renderer = new ReliefRenderer(elements.canvas);
const sampler = new FrameSampler();
const smoother = new TemporalSmoother();
const depthPipeline = new DepthPipeline();
const recorder = new CanvasRecorder();
const renderMeter = new RateMeter();
const inferenceMeter = new RateMeter();
const gui = createAdvancedGui(params, () => sync());

let source: MediaSourceHandle = createDemoSource();
let lastStatsSync = 0;
let currentPresetId = initialPresetId;
let inferenceTimer = 0;
let inferenceGeneration = 0;
let clearMessageTimer = 0;

const stats: RuntimeStats = {
  renderFPS: 0,
  inferenceFPS: 0,
  inferenceMs: 0,
  backend: params.depthBackend,
  sourceKind: source.kind,
  webgpuAvailable: detectWebGPU(),
  recordingSupported: CanvasRecorder.isSupported(elements.canvas),
  recording: false,
  quality: qualityLabel(params),
  pipeline: pipelineLabel(params.depthBackend),
  message: "",
};

elements.presetSelect.value = initialPresetId;

bindParamControls(elements, params, () => sync());
bindEvents();
startInferenceLoop(true);

function bindEvents(): void {
  elements.imageInput.addEventListener("change", async () => {
    const file = elements.imageInput.files?.[0];
    if (file) {
      await withUiError("Image could not be loaded.", async () => {
        await setSource(await createImageSource(file));
      });
    }
  });

  elements.videoInput.addEventListener("change", async () => {
    const file = elements.videoInput.files?.[0];
    if (file) {
      await withUiError("Video could not be played.", async () => {
        await setSource(await createVideoSource(file));
      });
    }
  });

  elements.webcamButton.addEventListener("click", async () => {
    await withUiError("Webcam permission or playback failed.", async () => {
      await setSource(await createWebcamSource());
    });
  });

  elements.demoButton.addEventListener("click", async () => {
    await setSource(createDemoSource());
  });

  elements.screenshotButton.addEventListener("click", async () => {
    await withUiError("Screenshot could not be saved.", async () => {
      await downloadCanvasPNG(elements.canvas, `relievo-${timestamp()}`);
    });
  });

  elements.recordButton.addEventListener("click", () => {
    if (recorder.recording) {
      recorder.stop();
    } else {
      const error = recorder.start(elements.canvas, 30);
      if (error) {
        setMessage(error);
      } else {
        setMessage("Recording started. It will stop automatically after 15 seconds.");
      }
    }
    sync();
  });

  elements.presetSelect.addEventListener("change", () => {
    applyPreset(elements.presetSelect.value);
  });

  window.addEventListener("beforeunload", () => {
    window.clearTimeout(inferenceTimer);
    source.stop();
    depthPipeline.dispose();
    renderer.stop();
    gui.destroy();
  });

  requestAnimationFrame(animationLoop);
}

async function setSource(next: MediaSourceHandle): Promise<void> {
  source.stop();
  source = next;
  smoother.reset();
  renderer.restartIntro();
  stats.sourceKind = source.kind;
  startInferenceLoop(true);
  sync();
}

function applyPreset(id: string): void {
  const selectedBackend = params.depthBackend;
  currentPresetId = id;
  Object.assign(params, defaultParams, findPreset(id).params);
  params.depthBackend = selectedBackend;
  elements.presetSelect.value = currentPresetId;
  smoother.reset();
  renderer.restartIntro();
  startInferenceLoop(true);
  sync();
}

function animationLoop(now: number): void {
  stats.renderFPS = renderMeter.tick(now);
  stats.recording = recorder.recording;
  renderer.render(params, stats);

  if (now - lastStatsSync > 160) {
    sync();
    lastStatsSync = now;
  }

  requestAnimationFrame(animationLoop);
}

function startInferenceLoop(forceFirst: boolean): void {
  inferenceGeneration += 1;
  const generation = inferenceGeneration;
  window.clearTimeout(inferenceTimer);

  if (forceFirst) {
    void runInference(true).finally(() => scheduleInference(generation));
    return;
  }

  scheduleInference(generation);
}

function scheduleInference(generation: number): void {
  if (generation !== inferenceGeneration) {
    return;
  }

  const interval = 1000 / Math.max(1, params.inferenceFPS);
  inferenceTimer = window.setTimeout(() => {
    const element = source.element;
    if (
      source.kind === "video" &&
      element instanceof HTMLVideoElement &&
      typeof element.requestVideoFrameCallback === "function"
    ) {
      element.requestVideoFrameCallback(() => {
        void runInference(false).finally(() => scheduleInference(generation));
      });
      return;
    }

    void runInference(false).finally(() => scheduleInference(generation));
  }, interval);
}

async function runInference(force: boolean): Promise<void> {
  if (depthPipeline.busy) {
    return;
  }

  const element = source.element;
  if (!element) {
    return;
  }

  if (!force && source.kind === "image") {
    return;
  }

  if (source.kind !== "image" && "readyState" in element && element.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return;
  }

  adaptQuality();

  const sample = sampler.sample(element, params.gridWidth, params.gridHeight, source.kind);
  if (isDepthAnythingBackend(params.depthBackend) && stats.backend !== params.depthBackend) {
    setMessage(`${depthBackendLabel(params.depthBackend)} is loading. First run downloads the ONNX model.`);
  }

  let result;
  try {
    result = await depthPipeline.estimate(sample, params.depthBackend);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    setMessage(`${depthBackendLabel(params.depthBackend)} failed. Falling back to heuristic. ${detail}`);
    params.depthBackend = "worker-cpu-heuristic";
    smoother.reset();
    result = await depthPipeline.estimate(sample, params.depthBackend);
  }

  const smoothed = smoother.smooth(result.depth, params.temporalSmoothing);
  renderer.setFrame(sample, smoothed, params);

  stats.backend = result.backend;
  stats.inferenceMs = result.inferenceMs;
  stats.inferenceFPS = inferenceMeter.tick();
  stats.sourceKind = source.kind;
  stats.quality = qualityLabel(params);
  stats.pipeline = pipelineLabel(result.backend);
}

function adaptQuality(): void {
  if (!params.adaptiveQuality) {
    return;
  }

  if (stats.renderFPS > 0 && stats.renderFPS < 34 && params.gridWidth > 160) {
    params.gridWidth = 192;
    params.gridHeight = 108;
    params.renderScale = Math.min(params.renderScale, 0.85);
    smoother.reset();
  } else if (stats.renderFPS > 52 && params.gridWidth < defaultParams.gridWidth) {
    params.gridWidth = defaultParams.gridWidth;
    params.gridHeight = defaultParams.gridHeight;
    params.renderScale = Math.max(params.renderScale, 1);
    smoother.reset();
  }
}

function sync(): void {
  stats.recording = recorder.recording;
  stats.recordingSupported = CanvasRecorder.isSupported(elements.canvas);
  stats.quality = qualityLabel(params);
  syncView(elements, params, stats);
}

function pipelineLabel(backend: RuntimeStats["backend"]): string {
  if (backend === "depth-anything-v2-small" || backend === "depth-anything-v2-base") {
    return "Transformers.js Depth Anything V2, q4, WebGPU/WASM";
  }

  return "worker CPU heuristic, render loop decoupled";
}

async function withUiError(label: string, action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    setMessage(`${label} ${detail}`);
  }
}

function setMessage(message: string): void {
  window.clearTimeout(clearMessageTimer);
  stats.message = message;
  sync();
  clearMessageTimer = window.setTimeout(() => {
    stats.message = "";
    sync();
  }, 6000);
}
