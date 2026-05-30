import {
  Camera,
  Circle,
  Image,
  ImageDown,
  Maximize2,
  Minimize2,
  CircleDot,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Square,
  Video,
  createIcons,
} from "lucide";
import { depthBackendOptions } from "../depth/depthBackends";
import { demoScenes } from "../media/demoScenes";
import type {
  ArtMode,
  DemoSceneId,
  DepthBackendSelection,
  ExportQuality,
  QualityMode,
  ReliefParams,
  RuntimeStats,
} from "../types";
import { presets } from "../presets";

export interface ViewElements {
  shell: HTMLElement;
  canvas: HTMLCanvasElement;
  inputPreviewCanvas: HTMLCanvasElement;
  chrome: HTMLElement;
  controlsPanel: HTMLElement;
  loadingOverlay: HTMLElement;
  blankButton: HTMLButtonElement;
  imageInput: HTMLInputElement;
  videoInput: HTMLInputElement;
  webcamButton: HTMLButtonElement;
  demoButton: HTMLButtonElement;
  demoSceneSelect: HTMLSelectElement;
  screenshotButton: HTMLButtonElement;
  recordButton: HTMLButtonElement;
  presetSelect: HTMLSelectElement;
  artModeSelect: HTMLSelectElement;
  depthBackendSelect: HTMLSelectElement;
  qualityModeSelect: HTMLSelectElement;
  exportQualitySelect: HTMLSelectElement;
  performanceButton: HTMLButtonElement;
  shareButton: HTMLButtonElement;
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
    | "nearThreshold"
    | "farThreshold"
    | "brightness"
    | "textureMix"
    | "inferenceFPS"
    | "renderScale"
    | "morphAmount"
    | "morphSpeed"
    | "particleInertia"
    | "scanReveal"
    | "trailAmount"
    | "breathing"
    | "depthQuantize"
    | "glitchAmount"
  >, HTMLInputElement>;
  adaptiveQuality: HTMLInputElement;
  emojiMode: HTMLInputElement;
  monochrome: HTMLInputElement;
}

type SliderKey = keyof ViewElements["controls"];

const viewIcons = {
  Camera,
  Circle,
  Image,
  ImageDown,
  Maximize2,
  Minimize2,
  CircleDot,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Square,
  Video,
};

const sliders: Array<{ key: SliderKey; label: string; min: number; max: number; step: number }> = [
  { key: "depthScale", label: "Depth", min: 0, max: 6, step: 0.05 },
  { key: "depthGamma", label: "Gamma", min: 0.3, max: 2.4, step: 0.01 },
  { key: "pointSize", label: "Point", min: 0.12, max: 6, step: 0.02 },
  { key: "pointOpacity", label: "Opacity", min: 0.05, max: 1, step: 0.01 },
  { key: "colorStrength", label: "Color", min: 0, max: 1, step: 0.01 },
  { key: "temporalSmoothing", label: "Smooth", min: 0, max: 0.96, step: 0.01 },
  { key: "backgroundFade", label: "Fade", min: 0.05, max: 1, step: 0.01 },
  { key: "foregroundBoost", label: "Boost", min: 0, max: 1, step: 0.01 },
  { key: "nearThreshold", label: "Near", min: 0, max: 0.95, step: 0.01 },
  { key: "farThreshold", label: "Far", min: 0.05, max: 1, step: 0.01 },
  { key: "brightness", label: "Bright", min: 0.05, max: 1.8, step: 0.01 },
  { key: "textureMix", label: "Texture", min: 0, max: 1, step: 0.01 },
  { key: "inferenceFPS", label: "Infer FPS", min: 1, max: 30, step: 1 },
  { key: "renderScale", label: "Render", min: 0.5, max: 1.25, step: 0.05 },
  { key: "morphAmount", label: "Morph", min: 0, max: 1, step: 0.01 },
  { key: "morphSpeed", label: "Morph Speed", min: 0.05, max: 1, step: 0.01 },
  { key: "particleInertia", label: "Inertia", min: 0, max: 1, step: 0.01 },
  { key: "scanReveal", label: "Scan", min: 0, max: 1, step: 0.01 },
  { key: "trailAmount", label: "Trail", min: 0, max: 0.5, step: 0.01 },
  { key: "breathing", label: "Breath", min: 0, max: 0.4, step: 0.01 },
  { key: "depthQuantize", label: "Bands", min: 0, max: 16, step: 1 },
  { key: "glitchAmount", label: "Glitch", min: 0, max: 0.35, step: 0.01 },
];

const artModeOptions: Array<{ id: ArtMode; label: string; tooltip: string }> = [
  { id: "relief", label: "Relief field", tooltip: "Canonical readable point relief" },
  { id: "memory", label: "Memory trails", tooltip: "Trace local motion and depth changes as a particle afterimage" },
  { id: "veil", label: "Volumetric veil", tooltip: "Depthkit-like translucent point veil over the source" },
];

export function createView(root: HTMLElement, params: ReliefParams): ViewElements {
  root.innerHTML = `
    <main class="relievo-shell relative h-full w-full overflow-hidden bg-[#030405] text-[#f1efe7]" data-palette="nocturne">
      <section class="absolute inset-0" aria-label="Relievo viewport">
        <canvas id="relievo-canvas" class="h-full w-full"></canvas>
      </section>

      <div id="input-preview-shell" class="pointer-events-none absolute bottom-4 right-4 z-20 hidden w-[260px] overflow-hidden rounded border border-white/12 bg-[#111214]/72 shadow-2xl backdrop-blur-xl md:block">
        <canvas id="input-preview-canvas" class="block aspect-video w-full"></canvas>
      </div>

      <header id="chrome" class="pointer-events-none absolute left-0 right-0 top-0 z-20 flex flex-col items-start justify-between gap-3 p-4 md:flex-row md:gap-4 md:p-5">
        <div class="ui-art-label pointer-events-auto max-w-[360px] px-3 py-2">
          <div class="flex items-center justify-between gap-3">
            <h1 class="text-base font-semibold leading-none tracking-normal text-[#f1efe7]">Relievo</h1>
            <div class="flex gap-1.5" aria-label="Palette">
              <button class="ui-palette-button is-active" type="button" data-palette-button="nocturne" data-tooltip="Palette: nocturne" aria-label="Use nocturne palette" style="--swatch-a: #8ae8ff; --swatch-b: #d8ff5f"></button>
              <button class="ui-palette-button" type="button" data-palette-button="ember" data-tooltip="Palette: ember" aria-label="Use ember palette" style="--swatch-a: #ff6a3d; --swatch-b: #f1efe7"></button>
              <button class="ui-palette-button" type="button" data-palette-button="violet" data-tooltip="Palette: violet" aria-label="Use violet palette" style="--swatch-a: #b497ff; --swatch-b: #8ae8ff"></button>
            </div>
          </div>
          <p class="mt-1 text-[11px] leading-5 text-[#b8b6ae]">
            Real-time depth relief in a browser-based 3D space.
          </p>
        </div>
        <div id="status" class="ui-notice pointer-events-auto hidden max-w-[340px] px-3 py-2"></div>
      </header>

      <div id="loading-overlay" class="pointer-events-none absolute inset-0 z-30 hidden items-center justify-center bg-black/44 backdrop-blur-sm">
        <div class="w-[min(420px,calc(100vw-32px))] border border-white/16 bg-black/70 px-5 py-4 text-white shadow-2xl">
          <div class="h-1 overflow-hidden rounded bg-white/12">
            <div class="h-full w-1/2 animate-[relievo-load_1.4s_ease-in-out_infinite] bg-[#6ee7d8]"></div>
          </div>
          <div class="mt-4 text-sm font-medium">Loading depth model</div>
          <div id="loading-label" class="mt-1 text-xs leading-5 text-white/64"></div>
        </div>
      </div>

      <aside id="controls-panel" class="absolute bottom-0 left-0 top-auto z-20 max-h-[58vh] w-full overflow-y-auto border-t border-white/12 bg-[#111214]/72 p-2 text-[#f1efe7] backdrop-blur-xl md:bottom-5 md:left-5 md:top-auto md:max-h-[72vh] md:w-[312px] md:border md:p-3">
        <div class="grid grid-cols-5 gap-1">
          <button id="blank-button" class="ui-icon-button" type="button" title="Blank field" aria-label="Blank field" data-tooltip="Show blank point field">
            <i data-lucide="circle" aria-hidden="true"></i>
          </button>
          <label class="ui-icon-button cursor-pointer" title="Load image" aria-label="Load image" data-tooltip="Load image">
            <i data-lucide="image" aria-hidden="true"></i>
            <input id="image-input" type="file" accept="image/*" class="sr-only" />
          </label>
          <label class="ui-icon-button cursor-pointer" title="Load video" aria-label="Load video" data-tooltip="Load video">
            <i data-lucide="video" aria-hidden="true"></i>
            <input id="video-input" type="file" accept="video/*" class="sr-only" />
          </label>
          <button id="webcam-button" class="ui-icon-button" type="button" title="Webcam" aria-label="Webcam" data-tooltip="Open webcam">
            <i data-lucide="camera" aria-hidden="true"></i>
          </button>
          <button id="demo-button" class="ui-icon-button" type="button" title="Demo scene" aria-label="Demo scene" data-tooltip="Load demo scene">
            <i data-lucide="sparkles" aria-hidden="true"></i>
          </button>
        </div>

        <div class="mt-2 grid grid-cols-[1fr_auto_auto_auto] gap-1">
          <select id="demo-scene-select" class="min-w-0 rounded border border-white/12 bg-[#12161d] px-2 py-2 text-xs text-white"></select>
          <button id="screenshot-button" class="ui-icon-button bg-white text-black hover:bg-white/88" type="button" title="Capture PNG" aria-label="Capture PNG" data-tooltip="Export PNG">
            <i data-lucide="image-down" aria-hidden="true"></i>
          </button>
          <button id="record-button" class="ui-icon-button" type="button" title="Record clip" aria-label="Record clip" data-tooltip="Start recording">
            <i data-lucide="circle-dot" aria-hidden="true"></i>
          </button>
          <button id="share-button" class="ui-icon-button" type="button" title="Share state" aria-label="Share state" data-tooltip="Copy share URL">
            <i data-lucide="share-2" aria-hidden="true"></i>
          </button>
        </div>

        <select id="preset-select" class="hidden"></select>

        <select id="art-mode-select" class="mt-2 w-full rounded border border-white/12 bg-[#12161d] px-2 py-2 text-xs text-white" data-tooltip="Switch point-field study mode"></select>
        <select id="depth-backend-select" class="mt-2 w-full rounded border border-white/12 bg-[#12161d] px-2 py-2 text-xs text-white"></select>
        <select id="quality-mode-select" class="mt-1 w-full rounded border border-white/12 bg-[#12161d] px-2 py-2 text-xs text-white">
          <option value="visual">Visual FPS priority</option>
          <option value="balanced">Balanced</option>
          <option value="quality">Depth quality priority</option>
        </select>

        <div class="mt-1 grid grid-cols-[1fr_auto] gap-1">
          <select id="export-quality-select" class="min-w-0 rounded border border-white/12 bg-[#12161d] px-2 py-2 text-xs text-white" data-tooltip="Choose recording bitrate">
            <option value="archive">Archive master</option>
            <option value="web">Web share</option>
          </select>
          <button id="performance-button" class="ui-icon-button" type="button" title="Performance mode" aria-label="Performance mode" data-tooltip="Performance mode">
            <i data-lucide="maximize-2" aria-hidden="true"></i>
          </button>
        </div>
        <p id="export-quality-help" class="ui-control-note">
          Archive records a high-bitrate master. Web share records a lighter file. The browser uses MP4 when available, otherwise WebM.
        </p>

        <details class="mt-2 rounded border border-white/10 bg-white/5">
          <summary class="flex cursor-pointer items-center gap-2 px-2 py-2 text-xs text-white/74" data-tooltip="Show interaction guide">
            <span class="ui-guide-dot"></span>
            <span>Guide</span>
          </summary>
          <div class="grid gap-1 px-2 pb-2 text-[11px] leading-5 text-white/58">
            <div><kbd class="ui-kbd">Drag</kbd> orbit the relief plane</div>
            <div><kbd class="ui-kbd">Move</kbd> disturb nearby particles</div>
            <div><kbd class="ui-kbd">Wheel</kbd> zoom through the 3D space</div>
            <div><kbd class="ui-kbd">Right drag</kbd> pan the view</div>
            <div><kbd class="ui-kbd">Double-click</kbd> hide the interface</div>
          </div>
        </details>

        <details class="mt-2 rounded border border-white/10 bg-white/5">
          <summary class="flex cursor-pointer items-center gap-2 px-2 py-2 text-xs text-white/74" data-tooltip="Open detailed controls">
            <i data-lucide="sliders-horizontal" aria-hidden="true"></i>
            <span>Fine tune</span>
          </summary>
          <div id="slider-panel" class="grid grid-cols-1 gap-1 px-2 pb-2"></div>
        </details>

        <div class="mt-2 grid grid-cols-3 gap-1 text-xs">
          <label class="ui-toggle" title="Adaptive quality" data-tooltip="Toggle adaptive quality">
            <input id="adaptive-quality" type="checkbox" class="h-4 w-4" />
            <span>Auto</span>
          </label>
          <label class="ui-toggle" title="Monochrome" data-tooltip="Toggle monochrome">
            <input id="monochrome" type="checkbox" class="h-4 w-4" />
            Mono
          </label>
          <label class="ui-toggle" title="Emoji glyph layer" data-tooltip="Toggle emoji layer">
            <input id="emoji-mode" type="checkbox" class="h-4 w-4" />
            Emoji
          </label>
        </div>
      </aside>

      <div id="ui-tooltip" class="ui-tooltip" role="tooltip"></div>
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

  const artModeSelect = mustGet<HTMLSelectElement>("art-mode-select");
  for (const mode of artModeOptions) {
    artModeSelect.insertAdjacentHTML("beforeend", `<option value="${mode.id}" title="${mode.tooltip}">${mode.label}</option>`);
  }

  const depthBackendSelect = mustGet<HTMLSelectElement>("depth-backend-select");
  for (const backend of depthBackendOptions) {
    depthBackendSelect.insertAdjacentHTML("beforeend", `<option value="${backend.id}">${backend.label}</option>`);
  }

  const demoSceneSelect = mustGet<HTMLSelectElement>("demo-scene-select");
  for (const scene of demoScenes) {
    demoSceneSelect.insertAdjacentHTML("beforeend", `<option value="${scene.id}">${scene.name}</option>`);
  }

  const adaptiveQuality = mustGet<HTMLInputElement>("adaptive-quality");
  const emojiMode = mustGet<HTMLInputElement>("emoji-mode");
  const monochrome = mustGet<HTMLInputElement>("monochrome");
  const qualityModeSelect = mustGet<HTMLSelectElement>("quality-mode-select");
  adaptiveQuality.checked = params.adaptiveQuality;
  artModeSelect.value = params.artMode;
  monochrome.checked = params.monochrome;
  qualityModeSelect.value = params.qualityMode;
  depthBackendSelect.value = params.depthBackend;

  renderLucideIcons(root);
  bindTooltips(root);
  bindPaletteControls(root);

  return {
    shell: root.querySelector("main")!,
    canvas: mustGet<HTMLCanvasElement>("relievo-canvas"),
    inputPreviewCanvas: mustGet<HTMLCanvasElement>("input-preview-canvas"),
    chrome: mustGet<HTMLElement>("chrome"),
    controlsPanel: mustGet<HTMLElement>("controls-panel"),
    loadingOverlay: mustGet<HTMLElement>("loading-overlay"),
    blankButton: mustGet<HTMLButtonElement>("blank-button"),
    imageInput: mustGet<HTMLInputElement>("image-input"),
    videoInput: mustGet<HTMLInputElement>("video-input"),
    webcamButton: mustGet<HTMLButtonElement>("webcam-button"),
    demoButton: mustGet<HTMLButtonElement>("demo-button"),
    demoSceneSelect,
    screenshotButton: mustGet<HTMLButtonElement>("screenshot-button"),
    recordButton: mustGet<HTMLButtonElement>("record-button"),
    presetSelect,
    artModeSelect,
    depthBackendSelect,
    qualityModeSelect,
    exportQualitySelect: mustGet<HTMLSelectElement>("export-quality-select"),
    performanceButton: mustGet<HTMLButtonElement>("performance-button"),
    shareButton: mustGet<HTMLButtonElement>("share-button"),
    status: mustGet<HTMLElement>("status"),
    controls,
    adaptiveQuality,
    emojiMode,
    monochrome,
  };
}

export function syncView(
  elements: ViewElements,
  params: ReliefParams,
  stats: RuntimeStats,
  options: { emojiMode: boolean; exportQuality: ExportQuality; performanceMode: boolean },
): void {
  for (const [key, control] of Object.entries(elements.controls) as Array<[SliderKey, HTMLInputElement]>) {
    control.value = String(params[key]);
    const output = document.getElementById(`control-${key}-value`);
    if (output) {
      output.textContent = formatNumber(params[key]);
    }
  }

  elements.adaptiveQuality.checked = params.adaptiveQuality;
  elements.emojiMode.checked = options.emojiMode;
  elements.monochrome.checked = params.monochrome;
  elements.artModeSelect.value = params.artMode;
  elements.depthBackendSelect.value = params.depthBackend;
  elements.qualityModeSelect.value = params.qualityMode;
  elements.exportQualitySelect.value = options.exportQuality;
  elements.performanceButton.innerHTML = `<i data-lucide="${options.performanceMode ? "minimize-2" : "maximize-2"}" aria-hidden="true"></i>`;
  elements.performanceButton.title = options.performanceMode ? "Show controls" : "Performance mode";
  elements.performanceButton.setAttribute("aria-label", options.performanceMode ? "Show controls" : "Performance mode");
  elements.performanceButton.dataset.tooltip = options.performanceMode ? "Show controls" : "Performance mode";
  elements.shell.classList.toggle("is-performance", options.performanceMode);
  elements.loadingOverlay.classList.toggle("hidden", !stats.loading);
  elements.loadingOverlay.classList.toggle("flex", stats.loading);
  const loadingLabel = document.getElementById("loading-label");
  if (loadingLabel) {
    loadingLabel.textContent = stats.loadingLabel;
  }
  elements.recordButton.innerHTML = stats.recording ? `<i data-lucide="square" aria-hidden="true"></i><span>Stop</span>` : `<i data-lucide="circle-dot" aria-hidden="true"></i>`;
  elements.recordButton.title = stats.recording ? "Stop recording" : "Record clip";
  elements.recordButton.setAttribute("aria-label", stats.recording ? "Stop recording" : "Record clip");
  elements.recordButton.dataset.tooltip = stats.recording ? "Stop recording" : "Start recording";
  elements.recordButton.disabled = !stats.recordingSupported;
  elements.recordButton.className = stats.recording
    ? "ui-icon-button border-red-300/50 bg-red-400 text-xs font-medium text-black hover:bg-red-300"
    : stats.recordingSupported
      ? "ui-icon-button"
      : "ui-icon-button cursor-not-allowed border-white/8 bg-white/4 text-white/42";
  elements.status.textContent = stats.message;
  elements.status.classList.toggle("hidden", stats.message.length === 0);
  renderLucideIcons(elements.controlsPanel);
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
  elements.artModeSelect.addEventListener("change", () => {
    params.artMode = elements.artModeSelect.value as ArtMode;
    onChange();
  });
  elements.depthBackendSelect.addEventListener("change", () => {
    params.depthBackend = elements.depthBackendSelect.value as DepthBackendSelection;
    onChange();
  });
  elements.qualityModeSelect.addEventListener("change", () => {
    params.qualityMode = elements.qualityModeSelect.value as QualityMode;
    onChange();
  });
}

export function readDemoScene(elements: ViewElements): DemoSceneId {
  return elements.demoSceneSelect.value as DemoSceneId;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function renderLucideIcons(root: Element): void {
  createIcons({
    icons: viewIcons,
    root,
    attrs: {
      class: "ui-icon-svg",
      "aria-hidden": "true",
    },
  });
}

function bindTooltips(root: HTMLElement): void {
  const tooltip = root.querySelector<HTMLElement>("#ui-tooltip");
  if (!tooltip) {
    return;
  }

  let activeTarget: HTMLElement | null = null;

  const show = (target: HTMLElement): void => {
    const label = target.dataset.tooltip;
    if (!label) {
      return;
    }

    activeTarget = target;
    tooltip.textContent = label;
    tooltip.classList.add("is-visible");
    positionTooltip(target, tooltip);
  };

  const hide = (target: EventTarget | null): void => {
    if (activeTarget && target instanceof Node && activeTarget.contains(target)) {
      return;
    }

    activeTarget = null;
    tooltip.classList.remove("is-visible");
  };

  for (const target of root.querySelectorAll<HTMLElement>("[data-tooltip]")) {
    target.addEventListener("mouseenter", () => show(target));
    target.addEventListener("mousemove", () => positionTooltip(target, tooltip));
    target.addEventListener("mouseleave", (event) => hide(event.relatedTarget));
    target.addEventListener("focus", () => show(target));
    target.addEventListener("blur", (event) => hide(event.relatedTarget));
    target.addEventListener("click", () => show(target));
  }
}

function bindPaletteControls(root: HTMLElement): void {
  const shell = root.querySelector<HTMLElement>(".relievo-shell");
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-palette-button]")];
  if (!shell || buttons.length === 0) {
    return;
  }

  const setPalette = (palette: string): void => {
    shell.dataset.palette = palette;
    for (const button of buttons) {
      button.classList.toggle("is-active", button.dataset.paletteButton === palette);
    }
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      setPalette(button.dataset.paletteButton ?? "nocturne");
    });
  }
}

function positionTooltip(target: HTMLElement, tooltip: HTMLElement): void {
  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const margin = 8;
  const x = clamp(
    rect.left + rect.width / 2 - tooltipRect.width / 2,
    margin,
    window.innerWidth - tooltipRect.width - margin,
  );
  const top = rect.top - tooltipRect.height - 9;
  const y = top > margin ? top : rect.bottom + 9;

  tooltip.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mustGet<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element #${id}`);
  }
  return element as T;
}
