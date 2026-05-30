import "./style.css";
import { defaultParams, qualityLabel } from "./params";
import { DepthPipeline } from "./depth/DepthPipeline";
import { depthBackendLabel, isDepthAnythingBackend, isHighCostDepthBackend } from "./depth/depthBackends";
import { TemporalSmoother } from "./depth/smoothing";
import { CanvasRecorder, downloadCanvasPNG, timestamp } from "./export/capture";
import { FrameSampler } from "./media/frameSampler";
import { initialDemoSceneId } from "./media/demoScenes";
import { createBlankSource, createDemoSource, createImageSource, createVideoSource, createWebcamSource } from "./media/mediaSources";
import { findPreset, initialPresetId } from "./presets";
import { ReliefRenderer } from "./renderer/ReliefRenderer";
import { decodeShareableState, encodeShareableState } from "./share/stateHash";
import { createAdvancedGui } from "./ui/lilGui";
import { bindParamControls, createView, readDemoScene, syncView } from "./ui/view";
import { RateMeter, detectWebGPU } from "./performance";
import type { ExportQuality, FrameSample, MediaSourceHandle, ReliefParams, RuntimeStats } from "./types";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root.");
}

const initialShareState = decodeShareableState(window.location.hash);
const params: ReliefParams = {
  ...defaultParams,
  ...findPreset(initialShareState.presetId ?? initialPresetId).params,
  ...initialShareState.params,
};
const elements = createView(root, params);
const renderer = new ReliefRenderer(elements.canvas);
const sampler = new FrameSampler();
const smoother = new TemporalSmoother();
const depthPipeline = new DepthPipeline();
const recorder = new CanvasRecorder();
const renderMeter = new RateMeter();
const inferenceMeter = new RateMeter();
const gui = createAdvancedGui(params, () => sync());

let currentDemoSceneId = initialShareState.demoSceneId ?? initialDemoSceneId;
let source: MediaSourceHandle = initialShareState.sourceKind === "demo" ? createDemoSource(currentDemoSceneId) : createBlankSource();
let lastStatsSync = 0;
let currentPresetId = initialShareState.presetId ?? initialPresetId;
let performanceMode = initialShareState.performanceMode ?? false;
let emojiMode = initialShareState.emojiMode ?? false;
let exportQuality: ExportQuality = initialShareState.exportQuality ?? "archive";
let inferenceTimer = 0;
let inferenceGeneration = 0;
let clearMessageTimer = 0;
let forcedInferenceRetryTimer = 0;
let shareStateTimer = 0;
let preloadedDepthBackend = "";

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
  loading: false,
  loadingLabel: "",
};

elements.presetSelect.value = currentPresetId;
elements.demoSceneSelect.value = currentDemoSceneId;

bindParamControls(elements, params, () => {
  sync();
  preloadDepthBackend();
  updateShareStateSoon();
});
bindEvents();
startInferenceLoop(true);
preloadDepthBackend();
sync();

function bindEvents(): void {
  elements.imageInput.addEventListener("click", () => {
    elements.imageInput.value = "";
  });

  elements.imageInput.addEventListener("change", async () => {
    const file = elements.imageInput.files?.[0];
    if (file) {
      await withUiError("Image could not be loaded.", async () => {
        await setSource(await createImageSource(file));
      });
    }
  });

  elements.videoInput.addEventListener("click", () => {
    elements.videoInput.value = "";
  });

  elements.videoInput.addEventListener("change", async () => {
    const file = elements.videoInput.files?.[0];
    if (file) {
      await withUiError("Video could not be played.", async () => {
        await setSource(await createVideoSource(file));
      });
    }
  });

  elements.blankButton.addEventListener("click", async () => {
    await setSource(createBlankSource());
    updateShareStateSoon();
  });

  elements.webcamButton.addEventListener("click", async () => {
    await withUiError("Webcam permission or playback failed.", async () => {
      await setSource(await createWebcamSource());
    });
  });

  elements.demoButton.addEventListener("click", async () => {
    await setSource(createDemoSource(currentDemoSceneId));
    updateShareStateSoon();
  });

  elements.demoSceneSelect.addEventListener("change", async () => {
    currentDemoSceneId = readDemoScene(elements);
    await setSource(createDemoSource(currentDemoSceneId));
    updateShareStateSoon();
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
      const error = recorder.start(elements.canvas, 30, exportQuality);
      if (error) {
        setMessage(error);
      } else {
        setMessage(`${exportQuality === "archive" ? "Archive" : "Web"} recording started. It will stop automatically after 15 seconds.`);
      }
    }
    sync();
  });

  elements.canvas.addEventListener("dblclick", () => {
    performanceMode = !performanceMode;
    sync();
    updateShareStateSoon();
  });

  elements.presetSelect.addEventListener("change", () => {
    applyPreset(elements.presetSelect.value);
    updateShareStateSoon();
  });

  elements.exportQualitySelect.addEventListener("change", () => {
    exportQuality = elements.exportQualitySelect.value as ExportQuality;
    sync();
    updateShareStateSoon();
  });

  elements.emojiMode.addEventListener("change", () => {
    emojiMode = elements.emojiMode.checked;
    sync();
    updateShareStateSoon();
  });

  elements.performanceButton.addEventListener("click", () => {
    performanceMode = !performanceMode;
    sync();
    updateShareStateSoon();
  });

  elements.shareButton.addEventListener("click", async () => {
    updateShareState();
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
    setMessage("Share URL updated and copied when clipboard access is available.");
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "p" && !(event.target instanceof HTMLInputElement)) {
      performanceMode = !performanceMode;
      sync();
      updateShareStateSoon();
    }
    if (event.key.toLowerCase() === "e" && !(event.target instanceof HTMLInputElement)) {
      emojiMode = !emojiMode;
      sync();
      updateShareStateSoon();
    }
  });

  window.addEventListener("beforeunload", () => {
    window.clearTimeout(inferenceTimer);
    window.clearTimeout(forcedInferenceRetryTimer);
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
  preloadDepthBackend();
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
  preloadDepthBackend();
  sync();
}

function animationLoop(now: number): void {
  stats.renderFPS = renderMeter.tick(now);
  stats.recording = recorder.recording;
  renderInputPreview();
  renderer.render(params, stats, emojiMode);

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
  window.clearTimeout(forcedInferenceRetryTimer);

  if (forceFirst) {
    void runInference(true, generation).then((processed) => {
      if (!processed) {
        retryForcedInference(generation);
        return;
      }
      scheduleInference(generation);
    });
    return;
  }

  scheduleInference(generation);
}

function scheduleInference(generation: number): void {
  if (generation !== inferenceGeneration) {
    return;
  }

  const interval = inferenceIntervalMs();
  inferenceTimer = window.setTimeout(() => {
    const element = source.element;
    if (
      source.kind === "video" &&
      element instanceof HTMLVideoElement &&
      typeof element.requestVideoFrameCallback === "function"
    ) {
      element.requestVideoFrameCallback(() => {
        void runInference(false, generation).finally(() => scheduleInference(generation));
      });
      return;
    }

    void runInference(false, generation).finally(() => scheduleInference(generation));
  }, interval);
}

function retryForcedInference(generation: number): void {
  if (generation !== inferenceGeneration) {
    return;
  }

  window.clearTimeout(forcedInferenceRetryTimer);
  forcedInferenceRetryTimer = window.setTimeout(() => {
    void runInference(true, generation).then((processed) => {
      if (!processed) {
        retryForcedInference(generation);
        return;
      }
      scheduleInference(generation);
    });
  }, 80);
}

async function runInference(force: boolean, generation: number): Promise<boolean> {
  if (generation !== inferenceGeneration) {
    return true;
  }

  const element = source.element;
  if (!element) {
    return true;
  }

  if (!force && source.kind === "image") {
    return true;
  }

  if (source.kind !== "image" && "readyState" in element && element.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return false;
  }

  adaptQuality();

  const sample = sampler.sample(element, params.gridWidth, params.gridHeight, source.kind);
  if (source.kind === "blank") {
    const depth = createBlankDepth(sample, performance.now());
    renderer.setFrame(sample, depth, params);
    stats.backend = "cpu-heuristic";
    stats.inferenceMs = 0;
    stats.inferenceFPS = inferenceMeter.tick();
    stats.sourceKind = source.kind;
    stats.quality = qualityLabel(params);
    stats.pipeline = "procedural blank point field";
    return true;
  }

  if (depthPipeline.busy) {
    return false;
  }

  if (isDepthAnythingBackend(params.depthBackend) && stats.backend !== params.depthBackend) {
    setMessage(`${depthBackendLabel(params.depthBackend)} is loading. First run downloads the ONNX model.`);
  }

  let result;
  try {
    setLoading(
      isDepthAnythingBackend(params.depthBackend) && stats.backend !== params.depthBackend,
      `${depthBackendLabel(params.depthBackend)} prepares local browser inference. Media stays on this device.`,
    );
    result = await depthPipeline.estimate(sample, params.depthBackend);
  } catch (error) {
    if (generation !== inferenceGeneration) {
      return true;
    }

    const detail = error instanceof Error ? error.message : String(error);
    setMessage(`${depthBackendLabel(params.depthBackend)} failed. Falling back to heuristic. ${detail}`);
    params.depthBackend = "worker-cpu-heuristic";
    smoother.reset();
    result = await depthPipeline.estimate(sample, params.depthBackend);
  } finally {
    setLoading(false);
  }

  if (generation !== inferenceGeneration) {
    return true;
  }

  const smoothed = smoother.smooth(result.depth, params.temporalSmoothing);
  renderer.setFrame(sample, smoothed, params);

  stats.backend = result.backend;
  stats.inferenceMs = result.inferenceMs;
  stats.inferenceFPS = inferenceMeter.tick();
  stats.sourceKind = source.kind;
  stats.quality = qualityLabel(params);
  stats.pipeline = pipelineLabel(result.backend);
  return true;
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
  syncView(elements, params, stats, { emojiMode, exportQuality, performanceMode });
}

function updateShareStateSoon(): void {
  window.clearTimeout(shareStateTimer);
  shareStateTimer = window.setTimeout(updateShareState, 180);
}

function updateShareState(): void {
  const nextHash = encodeShareableState({
    demoSceneId: currentDemoSceneId,
    emojiMode,
    exportQuality,
    performanceMode,
    presetId: currentPresetId,
    sourceKind: source.kind,
    params,
  });
  if (window.location.hash !== nextHash) {
    history.replaceState(null, "", nextHash);
  }
}

function pipelineLabel(backend: RuntimeStats["backend"]): string {
  if (backend === "depth-anything-v2-small" || backend === "depth-anything-v2-base") {
    return "Transformers.js Depth Anything V2, q4 ONNX, WebGPU/WASM";
  }

  return "worker CPU heuristic, render loop decoupled";
}

function inferenceIntervalMs(): number {
  const requested = 1000 / Math.max(1, params.inferenceFPS);
  if (isHighCostDepthBackend(params.depthBackend)) {
    return Math.max(requested, 220);
  }

  return requested;
}

function preloadDepthBackend(): void {
  if (!isDepthAnythingBackend(params.depthBackend) || preloadedDepthBackend === params.depthBackend) {
    return;
  }

  const element = source.element;
  if (!element) {
    return;
  }

  preloadedDepthBackend = params.depthBackend;
  window.setTimeout(() => {
    if (depthPipeline.busy || !isDepthAnythingBackend(params.depthBackend)) {
      return;
    }

    const backend = params.depthBackend;
    const sample = sampler.sample(element, 192, 192, source.kind);
    setLoading(true, `${depthBackendLabel(backend)} is preparing local browser inference.`);
    void depthPipeline
      .estimate(sample, backend)
      .then((result) => {
        stats.backend = result.backend;
        stats.pipeline = pipelineLabel(result.backend);
        stats.inferenceMs = result.inferenceMs;
      })
      .catch((error) => {
        preloadedDepthBackend = "";
        const detail = error instanceof Error ? error.message : String(error);
        setMessage(`${depthBackendLabel(backend)} preload failed. ${detail}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, 450);
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

function setLoading(loading: boolean, label = ""): void {
  stats.loading = loading;
  stats.loadingLabel = label;
  sync();
}

function createBlankDepth(sample: FrameSample, now: number): Float32Array {
  const depth = new Float32Array(sample.width * sample.height);
  const centerX = (sample.width - 1) * 0.5;
  const centerY = (sample.height - 1) * 0.5;
  const maxDistance = Math.hypot(centerX, centerY) || 1;

  for (let y = 0; y < sample.height; y += 1) {
    for (let x = 0; x < sample.width; x += 1) {
      const distance = Math.hypot(x - centerX, y - centerY) / maxDistance;
      const wave = Math.sin(x * 0.065 + now * 0.0012) * Math.cos(y * 0.052 + now * 0.0009);
      depth[y * sample.width + x] = Math.max(0, Math.min(1, 0.46 + wave * 0.035 - distance * 0.06));
    }
  }

  return depth;
}

function renderInputPreview(): void {
  const element = source.element;
  if (!element) {
    return;
  }

  if (source.kind !== "image" && "readyState" in element && element.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return;
  }

  const canvas = elements.inputPreviewCanvas;
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  const width = Math.max(1, Math.floor((rect.width || 260) * pixelRatio));
  const height = Math.max(1, Math.floor((rect.height || 146) * pixelRatio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#050607";
  context.fillRect(0, 0, width, height);
  drawCover(context, element, width, height);
}

function drawCover(
  context: CanvasRenderingContext2D,
  element: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  width: number,
  height: number,
): void {
  const sourceWidth =
    element instanceof HTMLVideoElement
      ? element.videoWidth
      : element instanceof HTMLImageElement
        ? element.naturalWidth
        : element.width;
  const sourceHeight =
    element instanceof HTMLVideoElement
      ? element.videoHeight
      : element instanceof HTMLImageElement
        ? element.naturalHeight
        : element.height;
  if (!sourceWidth || !sourceHeight) {
    return;
  }

  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(element, (width - drawWidth) * 0.5, (height - drawHeight) * 0.5, drawWidth, drawHeight);
}
