import type { ReliefParams, RuntimeStats, ScanDirection } from "../types";
import { presets } from "../presets";

export interface ViewElements {
  canvas: HTMLCanvasElement;
  imageInput: HTMLInputElement;
  videoInput: HTMLInputElement;
  webcamButton: HTMLButtonElement;
  demoButton: HTMLButtonElement;
  screenshotButton: HTMLButtonElement;
  recordButton: HTMLButtonElement;
  presetSelect: HTMLSelectElement;
  status: HTMLElement;
  controls: Record<keyof Pick<
    ReliefParams,
    | "depthScale"
    | "depthGamma"
    | "pointSize"
    | "pointOpacity"
    | "colorStrength"
    | "temporalSmoothing"
    | "backgroundFade"
    | "foregroundBoost"
    | "inferenceFPS"
    | "renderScale"
    | "morphAmount"
    | "morphSpeed"
    | "scanReveal"
    | "trailAmount"
    | "breathing"
    | "depthQuantize"
    | "glitchAmount"
  >, HTMLInputElement>;
  adaptiveQuality: HTMLInputElement;
  monochrome: HTMLInputElement;
  scanDirection: HTMLSelectElement;
}

type SliderKey = keyof ViewElements["controls"];

const sliders: Array<{ key: SliderKey; label: string; min: number; max: number; step: number }> = [
  { key: "depthScale", label: "Depth", min: 0, max: 6, step: 0.05 },
  { key: "depthGamma", label: "Gamma", min: 0.3, max: 2.4, step: 0.01 },
  { key: "pointSize", label: "Point", min: 0.5, max: 6, step: 0.1 },
  { key: "pointOpacity", label: "Opacity", min: 0.05, max: 1, step: 0.01 },
  { key: "colorStrength", label: "Color", min: 0, max: 1, step: 0.01 },
  { key: "temporalSmoothing", label: "Smooth", min: 0, max: 0.96, step: 0.01 },
  { key: "backgroundFade", label: "Fade", min: 0.05, max: 1, step: 0.01 },
  { key: "foregroundBoost", label: "Boost", min: 0, max: 1, step: 0.01 },
  { key: "inferenceFPS", label: "Infer FPS", min: 1, max: 30, step: 1 },
  { key: "renderScale", label: "Render", min: 0.5, max: 1.25, step: 0.05 },
  { key: "morphAmount", label: "Morph", min: 0, max: 1, step: 0.01 },
  { key: "morphSpeed", label: "Morph Speed", min: 0.05, max: 1, step: 0.01 },
  { key: "scanReveal", label: "Scan", min: 0, max: 1, step: 0.01 },
  { key: "trailAmount", label: "Trail", min: 0, max: 0.5, step: 0.01 },
  { key: "breathing", label: "Breath", min: 0, max: 0.4, step: 0.01 },
  { key: "depthQuantize", label: "Bands", min: 0, max: 16, step: 1 },
  { key: "glitchAmount", label: "Glitch", min: 0, max: 0.35, step: 0.01 },
];

export function createView(root: HTMLElement, params: ReliefParams): ViewElements {
  root.innerHTML = `
    <main class="relative h-full w-full overflow-hidden bg-[#08090b] text-white">
      <section class="absolute inset-0" aria-label="Relievo viewport">
        <canvas id="relievo-canvas" class="h-full w-full"></canvas>
      </section>

      <header class="pointer-events-none absolute left-0 right-0 top-0 z-20 flex flex-col items-start justify-between gap-3 p-4 md:flex-row md:gap-4 md:p-5">
        <div class="max-w-[560px]">
          <h1 class="text-[clamp(2rem,6vw,5.5rem)] font-semibold leading-none tracking-normal">Relievo</h1>
          <p class="mt-2 max-w-[34rem] text-sm leading-6 text-white/72 md:text-base">
            Browser depth relief renderer. 2.5D expression, not 3D reconstruction.
          </p>
        </div>
        <div id="status" class="pointer-events-auto w-full max-w-[340px] rounded border border-white/14 bg-black/46 px-3 py-2 text-xs leading-5 text-white/74 backdrop-blur-md md:min-w-[220px] md:max-w-none"></div>
      </header>

      <aside class="absolute bottom-0 left-0 top-auto z-20 max-h-[58vh] w-full overflow-y-auto border-t border-white/12 bg-black/54 p-3 backdrop-blur-xl md:bottom-5 md:left-5 md:top-auto md:max-h-[72vh] md:w-[360px] md:border md:p-4">
        <div class="grid grid-cols-2 gap-2">
          <label class="cursor-pointer rounded border border-white/12 bg-white/8 px-3 py-2 text-center text-sm hover:bg-white/14">
            Image
            <input id="image-input" type="file" accept="image/*" class="sr-only" />
          </label>
          <label class="cursor-pointer rounded border border-white/12 bg-white/8 px-3 py-2 text-center text-sm hover:bg-white/14">
            Video
            <input id="video-input" type="file" accept="video/*" class="sr-only" />
          </label>
          <button id="webcam-button" class="rounded border border-white/12 bg-white/8 px-3 py-2 text-sm hover:bg-white/14">Webcam</button>
          <button id="demo-button" class="rounded border border-white/12 bg-white/8 px-3 py-2 text-sm hover:bg-white/14">Demo</button>
        </div>

        <div class="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
          <select id="preset-select" class="min-w-0 rounded border border-white/12 bg-[#12161d] px-3 py-2 text-sm text-white"></select>
          <button id="screenshot-button" class="rounded border border-white/12 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/88">PNG</button>
          <button id="record-button" class="rounded border border-white/12 bg-white/8 px-3 py-2 text-sm hover:bg-white/14">REC</button>
        </div>

        <div id="slider-panel" class="mt-3 grid grid-cols-1 gap-2"></div>

        <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
          <label class="flex items-center gap-2 rounded border border-white/12 bg-white/7 px-3 py-2">
            <input id="adaptive-quality" type="checkbox" class="h-4 w-4" />
            Adaptive
          </label>
          <label class="flex items-center gap-2 rounded border border-white/12 bg-white/7 px-3 py-2">
            <input id="monochrome" type="checkbox" class="h-4 w-4" />
            Mono
          </label>
        </div>

        <select id="scan-direction" class="mt-2 w-full rounded border border-white/12 bg-[#12161d] px-3 py-2 text-sm text-white">
          <option value="left-right">Scan left to right</option>
          <option value="right-left">Scan right to left</option>
          <option value="top-bottom">Scan top to bottom</option>
          <option value="bottom-top">Scan bottom to top</option>
        </select>
      </aside>
    </main>
  `;

  const panel = mustGet<HTMLElement>("slider-panel");
  const controls = {} as ViewElements["controls"];

  for (const slider of sliders) {
    const id = `control-${slider.key}`;
    panel.insertAdjacentHTML(
      "beforeend",
      `<label class="grid grid-cols-[92px_1fr_44px] items-center gap-2 text-xs text-white/76">
        <span>${slider.label}</span>
        <input id="${id}" type="range" min="${slider.min}" max="${slider.max}" step="${slider.step}" value="${params[slider.key]}" class="w-full accent-[#6ee7d8]" />
        <output id="${id}-value" class="text-right tabular-nums">${formatNumber(params[slider.key])}</output>
      </label>`,
    );
    controls[slider.key] = mustGet<HTMLInputElement>(id);
  }

  const presetSelect = mustGet<HTMLSelectElement>("preset-select");
  for (const preset of presets) {
    presetSelect.insertAdjacentHTML("beforeend", `<option value="${preset.id}">${preset.name}</option>`);
  }

  const adaptiveQuality = mustGet<HTMLInputElement>("adaptive-quality");
  const monochrome = mustGet<HTMLInputElement>("monochrome");
  const scanDirection = mustGet<HTMLSelectElement>("scan-direction");
  adaptiveQuality.checked = params.adaptiveQuality;
  monochrome.checked = params.monochrome;
  scanDirection.value = params.scanDirection;

  return {
    canvas: mustGet<HTMLCanvasElement>("relievo-canvas"),
    imageInput: mustGet<HTMLInputElement>("image-input"),
    videoInput: mustGet<HTMLInputElement>("video-input"),
    webcamButton: mustGet<HTMLButtonElement>("webcam-button"),
    demoButton: mustGet<HTMLButtonElement>("demo-button"),
    screenshotButton: mustGet<HTMLButtonElement>("screenshot-button"),
    recordButton: mustGet<HTMLButtonElement>("record-button"),
    presetSelect,
    status: mustGet<HTMLElement>("status"),
    controls,
    adaptiveQuality,
    monochrome,
    scanDirection,
  };
}

export function syncView(elements: ViewElements, params: ReliefParams, stats: RuntimeStats): void {
  for (const [key, control] of Object.entries(elements.controls) as Array<[SliderKey, HTMLInputElement]>) {
    control.value = String(params[key]);
    const output = document.getElementById(`control-${key}-value`);
    if (output) {
      output.textContent = formatNumber(params[key]);
    }
  }

  elements.adaptiveQuality.checked = params.adaptiveQuality;
  elements.monochrome.checked = params.monochrome;
  elements.scanDirection.value = params.scanDirection;
  elements.recordButton.textContent = stats.recording ? "STOP" : "REC";
  elements.recordButton.disabled = !stats.recordingSupported;
  elements.recordButton.className = stats.recording
    ? "rounded border border-red-300/50 bg-red-400 px-3 py-2 text-sm font-medium text-black hover:bg-red-300"
    : stats.recordingSupported
      ? "rounded border border-white/12 bg-white/8 px-3 py-2 text-sm hover:bg-white/14"
      : "cursor-not-allowed rounded border border-white/8 bg-white/4 px-3 py-2 text-sm text-white/42";
  elements.status.innerHTML = `
    <div>Source: ${stats.sourceKind}</div>
    <div>Render: ${stats.renderFPS.toFixed(1)} FPS</div>
    <div>Inference: ${stats.inferenceFPS.toFixed(1)} FPS / ${stats.inferenceMs.toFixed(1)} ms</div>
    <div>Backend: ${stats.backend}</div>
    <div>Pipeline: ${stats.pipeline}</div>
    <div>WebGPU: ${stats.webgpuAvailable ? "available" : "not available"} / WASM: inactive</div>
    <div>Quality: ${stats.quality}</div>
    ${stats.message ? `<div class="mt-1 text-[#f6c76f]">${stats.message}</div>` : ""}
  `;
}

export function bindParamControls(
  elements: ViewElements,
  params: ReliefParams,
  onChange: () => void,
): void {
  for (const [key, input] of Object.entries(elements.controls) as Array<[SliderKey, HTMLInputElement]>) {
    input.addEventListener("input", () => {
      params[key] = Number(input.value);
      onChange();
    });
  }

  elements.adaptiveQuality.addEventListener("change", () => {
    params.adaptiveQuality = elements.adaptiveQuality.checked;
    onChange();
  });
  elements.monochrome.addEventListener("change", () => {
    params.monochrome = elements.monochrome.checked;
    onChange();
  });
  elements.scanDirection.addEventListener("change", () => {
    params.scanDirection = elements.scanDirection.value as ScanDirection;
    onChange();
  });
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function mustGet<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element #${id}`);
  }
  return element as T;
}
