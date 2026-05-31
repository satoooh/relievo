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
  ReliefMaterial,
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
  stageHud: HTMLElement;
  inspectorStatus: HTMLElement;
  loadingOverlay: HTMLElement;
  blankButton: HTMLButtonElement;
  imageButton: HTMLElement;
  imageInput: HTMLInputElement;
  videoButton: HTMLElement;
  videoInput: HTMLInputElement;
  webcamButton: HTMLButtonElement;
  demoButton: HTMLButtonElement;
  demoSceneSelect: HTMLSelectElement;
  demoSceneButtons: HTMLButtonElement[];
  screenshotButton: HTMLButtonElement;
  recordButton: HTMLButtonElement;
  presetSelect: HTMLSelectElement;
  artModeSelect: HTMLSelectElement;
  reliefMaterialSelect: HTMLSelectElement;
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
type ControlTab = "source" | "look" | "depth" | "motion" | "export";

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

const sliderGroups: Record<SliderKey, ControlTab> = {
  backgroundFade: "look",
  breathing: "motion",
  brightness: "look",
  colorStrength: "look",
  depthGamma: "depth",
  depthQuantize: "depth",
  depthScale: "depth",
  farThreshold: "depth",
  foregroundBoost: "look",
  glitchAmount: "motion",
  inferenceFPS: "motion",
  morphAmount: "motion",
  morphSpeed: "motion",
  nearThreshold: "depth",
  particleInertia: "motion",
  pointOpacity: "look",
  pointSize: "look",
  renderScale: "depth",
  scanReveal: "motion",
  temporalSmoothing: "motion",
  textureMix: "look",
  trailAmount: "motion",
};

const controlTabs: Array<{ id: ControlTab; label: string }> = [
  { id: "source", label: "Source" },
  { id: "look", label: "Look" },
  { id: "depth", label: "Depth" },
  { id: "motion", label: "Motion" },
  { id: "export", label: "Export" },
];

const artModeOptions: Array<{ id: ArtMode; label: string; tooltip: string }> = [
  { id: "relief", label: "Relief field", tooltip: "Canonical readable point relief" },
  { id: "memory", label: "Memory trails", tooltip: "Trace local motion and depth changes as a particle afterimage" },
];

const reliefMaterialOptions: Array<{ id: ReliefMaterial; label: string; tooltip: string }> = [
  { id: "depthkit", label: "Depthkit field", tooltip: "Balanced white dotted surface with readable source color" },
  { id: "fabric", label: "Soft fabric", tooltip: "Fine woven point texture for cloth and skin detail" },
];

export function createView(root: HTMLElement, params: ReliefParams): ViewElements {
  root.innerHTML = `
    <main class="relievo-shell relative h-full w-full overflow-hidden bg-[#030405] text-[#f1efe7]" data-palette="nocturne">
      <section class="absolute inset-0" aria-label="Relievo viewport">
        <canvas id="relievo-canvas" class="h-full w-full"></canvas>
      </section>

      <div id="input-preview-shell" class="pointer-events-none absolute bottom-5 left-5 z-20 hidden w-[260px] overflow-hidden rounded border border-white/12 bg-[#111214]/72 shadow-2xl backdrop-blur-xl md:block">
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
          <div id="stage-hud" class="ui-stage-hud mt-2" aria-label="Live render state"></div>
        </div>
        <div class="pointer-events-auto flex w-full flex-col items-end gap-2 md:w-auto">
          <div class="ui-top-actions">
            <button id="screenshot-button" class="ui-icon-button bg-white text-black hover:bg-white/88" type="button" title="Capture PNG" aria-label="Capture PNG" data-tooltip="Export PNG">
              <i data-lucide="image-down" aria-hidden="true"></i>
            </button>
            <button id="record-button" class="ui-icon-button" type="button" title="Record clip" aria-label="Record clip" data-tooltip="Start recording">
              <i data-lucide="circle-dot" aria-hidden="true"></i>
            </button>
            <button id="share-button" class="ui-icon-button" type="button" title="Share state" aria-label="Share state" data-tooltip="Copy share URL">
              <i data-lucide="share-2" aria-hidden="true"></i>
            </button>
            <button id="performance-button" class="ui-icon-button" type="button" title="Performance mode" aria-label="Performance mode" data-tooltip="Performance mode">
              <i data-lucide="maximize-2" aria-hidden="true"></i>
            </button>
          </div>
          <div id="status" class="ui-notice pointer-events-auto hidden max-w-[340px] px-3 py-2"></div>
        </div>
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

      <aside id="controls-panel" class="ui-inspector absolute bottom-0 left-0 top-auto z-20 max-h-[52vh] w-full overflow-y-auto border-t border-white/12 bg-[#111214]/78 p-2 text-[#f1efe7] backdrop-blur-xl md:bottom-auto md:left-auto md:right-5 md:top-[92px] md:max-h-[calc(100vh-116px)] md:w-[340px] md:border md:p-3" data-active-control-tab="source">
        <div class="ui-sheet-handle" aria-hidden="true"></div>
        <div class="ui-inspector-header">
          <span>Controls</span>
          <span id="inspector-status">initializing</span>
        </div>
        <div class="ui-control-tabs" role="tablist" aria-label="Relievo controls"></div>

        <section id="control-source" class="ui-control-section" data-control-section="source" aria-label="Source controls">
          <div class="ui-section-heading">
            <span>Source</span>
            <span>local media</span>
          </div>
          <div class="grid grid-cols-5 gap-1">
            <button id="blank-button" class="ui-icon-button" type="button" title="Blank field" aria-label="Blank field" data-tooltip="Show blank point field">
              <i data-lucide="circle" aria-hidden="true"></i>
            </button>
            <label id="image-button" class="ui-icon-button cursor-pointer" title="Load image" aria-label="Load image" data-tooltip="Load image">
              <i data-lucide="image" aria-hidden="true"></i>
              <input id="image-input" type="file" accept="image/*" class="sr-only" />
            </label>
            <label id="video-button" class="ui-icon-button cursor-pointer" title="Load video" aria-label="Load video" data-tooltip="Load video">
              <i data-lucide="video" aria-hidden="true"></i>
              <input id="video-input" type="file" accept="video/*" class="sr-only" />
            </label>
            <button id="webcam-button" class="ui-icon-button" type="button" title="Webcam" aria-label="Webcam" data-tooltip="Open webcam">
              <i data-lucide="camera" aria-hidden="true"></i>
            </button>
            <button id="demo-button" class="ui-icon-button" type="button" title="Demo scene" aria-label="Demo scene" data-tooltip="Load selected demo">
              <i data-lucide="sparkles" aria-hidden="true"></i>
            </button>
          </div>
          <select id="demo-scene-select" class="sr-only" aria-label="Demo scene"></select>
          <div id="demo-scene-strip" class="ui-demo-strip" aria-label="Demo scenes"></div>
          <div class="ui-guide-panel" aria-label="Interaction guide">
            <div><kbd class="ui-kbd">Drag</kbd> orbit</div>
            <div><kbd class="ui-kbd">Move</kbd> disturb</div>
            <div><kbd class="ui-kbd">Wheel</kbd> zoom</div>
            <div><kbd class="ui-kbd">Double</kbd> hide UI</div>
          </div>
        </section>

        <section id="control-look" class="ui-control-section" data-control-section="look" aria-label="Look controls">
          <div class="ui-section-heading">
            <span>Look</span>
            <span>material</span>
          </div>
          <select id="art-mode-select" class="ui-select" data-tooltip="Switch point-field study mode"></select>
          <select id="relief-material-select" class="ui-select mt-1" data-tooltip="Switch Relief field material pattern"></select>
          <div id="look-slider-panel" class="ui-slider-panel"></div>
          <div class="mt-2 grid grid-cols-2 gap-1 text-xs">
            <label class="ui-toggle" title="Monochrome" data-tooltip="Toggle monochrome">
              <input id="monochrome" type="checkbox" class="h-4 w-4" />
              Mono
            </label>
            <label class="ui-toggle" title="Emoji glyph layer" data-tooltip="Toggle emoji layer">
              <input id="emoji-mode" type="checkbox" class="h-4 w-4" />
              Emoji
            </label>
          </div>
        </section>

        <section id="control-depth" class="ui-control-section" data-control-section="depth" aria-label="Depth controls">
          <div class="ui-section-heading">
            <span>Depth</span>
            <span>inference</span>
          </div>
          <select id="depth-backend-select" class="ui-select"></select>
          <select id="quality-mode-select" class="ui-select mt-1">
            <option value="visual">Visual FPS priority</option>
            <option value="balanced">Balanced</option>
            <option value="quality">Depth quality priority</option>
          </select>
          <div id="depth-slider-panel" class="ui-slider-panel"></div>
          <label class="ui-toggle mt-2" title="Adaptive quality" data-tooltip="Toggle adaptive quality">
            <input id="adaptive-quality" type="checkbox" class="h-4 w-4" />
            Auto quality
          </label>
        </section>

        <section id="control-motion" class="ui-control-section" data-control-section="motion" aria-label="Motion controls">
          <div class="ui-section-heading">
            <span>Motion</span>
            <span>surface behavior</span>
          </div>
          <div id="motion-slider-panel" class="ui-slider-panel"></div>
        </section>

        <section id="control-export" class="ui-control-section" data-control-section="export" aria-label="Export controls">
          <div class="ui-section-heading">
            <span>Export</span>
            <span>capture state</span>
          </div>
          <select id="export-quality-select" class="ui-select" data-tooltip="Choose recording bitrate">
            <option value="archive">Archive master</option>
            <option value="web">Web share</option>
          </select>
          <p id="export-quality-help" class="ui-control-note">
            Archive records a high-bitrate master. Web share records a lighter file. The browser uses MP4 when available, otherwise WebM.
          </p>
          <div class="mt-2 grid grid-cols-4 gap-1">
            <button class="ui-export-mirror" type="button" data-export-action="png" data-tooltip="Use the top PNG button">PNG</button>
            <button class="ui-export-mirror" type="button" data-export-action="record" data-tooltip="Use the top record button">REC</button>
            <button class="ui-export-mirror" type="button" data-export-action="share" data-tooltip="Use the top share button">URL</button>
            <button class="ui-export-mirror" type="button" data-export-action="perform" data-tooltip="Use the top performance button">VIEW</button>
          </div>
        </section>

        <select id="preset-select" class="hidden"></select>
      </aside>

      <div id="ui-tooltip" class="ui-tooltip" role="tooltip"></div>
    </main>
  `;

  const sliderPanels: Record<ControlTab, HTMLElement | null> = {
    source: null,
    look: mustGet<HTMLElement>("look-slider-panel"),
    depth: mustGet<HTMLElement>("depth-slider-panel"),
    motion: mustGet<HTMLElement>("motion-slider-panel"),
    export: null,
  };
  const controls = {} as ViewElements["controls"];

  for (const slider of sliders) {
    const id = `control-${slider.key}`;
    const panel = sliderPanels[sliderGroups[slider.key]];
    if (!panel) {
      continue;
    }
    panel.insertAdjacentHTML(
      "beforeend",
      `<label class="grid grid-cols-[92px_1fr_44px] items-center gap-2 text-xs text-white/76">
        <span>${slider.label}</span>
        <input id="${id}" type="range" min="${slider.min}" max="${slider.max}" step="${slider.step}" value="${params[slider.key]}" class="w-full accent-[#6ee7d8]" />
        <output id="${id}-value" class="text-right tabular-nums">${formatNumber(params[slider.key])}</output>
      </label>`,
    );
    controls[slider.key] = mustGet<HTMLInputElement>(id);
    updateRangeProgress(controls[slider.key]);
  }

  const presetSelect = mustGet<HTMLSelectElement>("preset-select");
  for (const preset of presets) {
    presetSelect.insertAdjacentHTML("beforeend", `<option value="${preset.id}">${preset.name}</option>`);
  }

  const artModeSelect = mustGet<HTMLSelectElement>("art-mode-select");
  for (const mode of artModeOptions) {
    artModeSelect.insertAdjacentHTML("beforeend", `<option value="${mode.id}" title="${mode.tooltip}">${mode.label}</option>`);
  }

  const reliefMaterialSelect = mustGet<HTMLSelectElement>("relief-material-select");
  for (const material of reliefMaterialOptions) {
    reliefMaterialSelect.insertAdjacentHTML("beforeend", `<option value="${material.id}" title="${material.tooltip}">${material.label}</option>`);
  }

  const depthBackendSelect = mustGet<HTMLSelectElement>("depth-backend-select");
  for (const backend of depthBackendOptions) {
    depthBackendSelect.insertAdjacentHTML("beforeend", `<option value="${backend.id}">${backend.label}</option>`);
  }

  const demoSceneSelect = mustGet<HTMLSelectElement>("demo-scene-select");
  const demoSceneStrip = mustGet<HTMLElement>("demo-scene-strip");
  for (const scene of demoScenes) {
    demoSceneSelect.insertAdjacentHTML("beforeend", `<option value="${scene.id}">${scene.name}</option>`);
    demoSceneStrip.insertAdjacentHTML(
      "beforeend",
      `<button class="ui-demo-card" type="button" data-demo-scene="${scene.id}" aria-label="Load ${scene.name}" data-tooltip="${scene.name}">
        <img src="${scene.imagePaths[0]}" alt="" loading="lazy" />
        <span>${scene.name}</span>
      </button>`,
    );
  }
  const demoSceneButtons = [...demoSceneStrip.querySelectorAll<HTMLButtonElement>("[data-demo-scene]")];

  const adaptiveQuality = mustGet<HTMLInputElement>("adaptive-quality");
  const emojiMode = mustGet<HTMLInputElement>("emoji-mode");
  const monochrome = mustGet<HTMLInputElement>("monochrome");
  const qualityModeSelect = mustGet<HTMLSelectElement>("quality-mode-select");
  adaptiveQuality.checked = params.adaptiveQuality;
  artModeSelect.value = params.artMode;
  reliefMaterialSelect.value = params.reliefMaterial;
  monochrome.checked = params.monochrome;
  qualityModeSelect.value = params.qualityMode;
  depthBackendSelect.value = params.depthBackend;

  renderLucideIcons(root);
  bindTooltips(root);
  bindPaletteControls(root);
  bindControlTabs(root);
  bindExportMirrors(root);

  return {
    shell: root.querySelector("main")!,
    canvas: mustGet<HTMLCanvasElement>("relievo-canvas"),
    inputPreviewCanvas: mustGet<HTMLCanvasElement>("input-preview-canvas"),
    chrome: mustGet<HTMLElement>("chrome"),
    controlsPanel: mustGet<HTMLElement>("controls-panel"),
    stageHud: mustGet<HTMLElement>("stage-hud"),
    inspectorStatus: mustGet<HTMLElement>("inspector-status"),
    loadingOverlay: mustGet<HTMLElement>("loading-overlay"),
    blankButton: mustGet<HTMLButtonElement>("blank-button"),
    imageButton: mustGet<HTMLElement>("image-button"),
    imageInput: mustGet<HTMLInputElement>("image-input"),
    videoButton: mustGet<HTMLElement>("video-button"),
    videoInput: mustGet<HTMLInputElement>("video-input"),
    webcamButton: mustGet<HTMLButtonElement>("webcam-button"),
    demoButton: mustGet<HTMLButtonElement>("demo-button"),
    demoSceneSelect,
    demoSceneButtons,
    screenshotButton: mustGet<HTMLButtonElement>("screenshot-button"),
    recordButton: mustGet<HTMLButtonElement>("record-button"),
    presetSelect,
    artModeSelect,
    reliefMaterialSelect,
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
    updateRangeProgress(control);
    const output = document.getElementById(`control-${key}-value`);
    if (output) {
      output.textContent = formatNumber(params[key]);
    }
  }

  elements.adaptiveQuality.checked = params.adaptiveQuality;
  elements.emojiMode.checked = options.emojiMode;
  elements.monochrome.checked = params.monochrome;
  elements.artModeSelect.value = params.artMode;
  elements.reliefMaterialSelect.value = params.reliefMaterial;
  elements.depthBackendSelect.value = params.depthBackend;
  elements.qualityModeSelect.value = params.qualityMode;
  elements.exportQualitySelect.value = options.exportQuality;
  for (const button of elements.demoSceneButtons) {
    button.classList.toggle("is-active", button.dataset.demoScene === elements.demoSceneSelect.value);
  }
  elements.performanceButton.innerHTML = `<i data-lucide="${options.performanceMode ? "minimize-2" : "maximize-2"}" aria-hidden="true"></i>`;
  elements.performanceButton.title = options.performanceMode ? "Show controls" : "Performance mode";
  elements.performanceButton.setAttribute("aria-label", options.performanceMode ? "Show controls" : "Performance mode");
  elements.performanceButton.dataset.tooltip = options.performanceMode ? "Show controls" : "Performance mode";
  elements.shell.classList.toggle("is-performance", options.performanceMode);
  elements.stageHud.innerHTML = renderStageHud(params, stats, options);
  elements.inspectorStatus.textContent = `${Math.round(stats.renderFPS)} fps / ${stats.quality}`;
  syncSourceButtons(elements, stats.sourceKind);
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
    ? "ui-icon-button is-recording border-red-300/50 bg-red-400 text-xs font-medium text-black hover:bg-red-300"
    : stats.recordingSupported
      ? "ui-icon-button"
      : "ui-icon-button cursor-not-allowed border-white/8 bg-white/4 text-white/42";
  elements.status.textContent = stats.message;
  elements.status.classList.toggle("hidden", stats.message.length === 0);
  renderLucideIcons(elements.chrome);
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
      updateRangeProgress(input);
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
  elements.reliefMaterialSelect.addEventListener("change", () => {
    params.reliefMaterial = elements.reliefMaterialSelect.value as ReliefMaterial;
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

function renderStageHud(
  params: ReliefParams,
  stats: RuntimeStats,
  options: { emojiMode: boolean; exportQuality: ExportQuality; performanceMode: boolean },
): string {
  const chips = [
    ["Source", sourceLabel(stats.sourceKind)],
    ["Backend", compactBackendLabel(stats.backend)],
    ["Render", `${Math.round(stats.renderFPS)} fps`],
    ["Infer", `${Math.round(stats.inferenceFPS)} fps`],
    ["Quality", stats.quality],
    ["Mode", options.performanceMode ? "Performance" : params.artMode === "memory" ? "Memory" : "Relief"],
  ];

  if (stats.recording) {
    chips.splice(2, 0, ["Capture", options.exportQuality === "archive" ? "Archive REC" : "Web REC"]);
  }

  if (options.emojiMode) {
    chips.push(["Layer", "Emoji"]);
  }

  return chips
    .map(([label, value]) => `<span class="ui-state-chip"><span>${label}</span><strong>${value}</strong></span>`)
    .join("");
}

function sourceLabel(kind: RuntimeStats["sourceKind"]): string {
  switch (kind) {
    case "blank":
      return "Blank";
    case "demo":
      return "Demo";
    case "image":
      return "Image";
    case "video":
      return "Video";
    case "webcam":
      return "Webcam";
    default:
      return kind;
  }
}

function compactBackendLabel(backend: RuntimeStats["backend"]): string {
  switch (backend) {
    case "depth-anything-v2-base":
      return "DA V2 Base";
    case "depth-anything-v2-small":
      return "DA V2 Small";
    case "worker-cpu-heuristic":
    case "cpu-heuristic":
      return "Heuristic";
    default:
      return backend;
  }
}

function syncSourceButtons(elements: ViewElements, sourceKind: RuntimeStats["sourceKind"]): void {
  const sourceControls: Array<[HTMLElement, boolean]> = [
    [elements.blankButton, sourceKind === "blank"],
    [elements.imageButton, sourceKind === "image"],
    [elements.videoButton, sourceKind === "video"],
    [elements.webcamButton, sourceKind === "webcam"],
    [elements.demoButton, sourceKind === "demo"],
  ];

  for (const [control, active] of sourceControls) {
    control.classList.toggle("is-active", active);
    if (control instanceof HTMLButtonElement) {
      control.setAttribute("aria-pressed", String(active));
    } else {
      control.toggleAttribute("data-active", active);
    }
  }
}

function updateRangeProgress(input: HTMLInputElement): void {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value);
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
  input.style.setProperty("--range-progress", `${clamp(progress, 0, 100)}%`);
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

function bindControlTabs(root: HTMLElement): void {
  const panel = root.querySelector<HTMLElement>("#controls-panel");
  const tabList = root.querySelector<HTMLElement>(".ui-control-tabs");
  if (!panel || !tabList) {
    return;
  }

  for (const tab of controlTabs) {
    tabList.insertAdjacentHTML(
      "beforeend",
      `<button class="ui-control-tab" type="button" role="tab" data-control-tab="${tab.id}" aria-controls="control-${tab.id}">
        ${tab.label}
      </button>`,
    );
  }

  const buttons = [...tabList.querySelectorAll<HTMLButtonElement>("[data-control-tab]")];
  const setActive = (next: string): void => {
    panel.dataset.activeControlTab = next;
    for (const button of buttons) {
      const active = button.dataset.controlTab === next;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    }
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      setActive(button.dataset.controlTab ?? "source");
    });
  }

  setActive(panel.dataset.activeControlTab ?? "source");
}

function bindExportMirrors(root: HTMLElement): void {
  const actions: Record<string, string> = {
    perform: "performance-button",
    png: "screenshot-button",
    record: "record-button",
    share: "share-button",
  };

  for (const mirror of root.querySelectorAll<HTMLButtonElement>("[data-export-action]")) {
    mirror.addEventListener("click", () => {
      const id = actions[mirror.dataset.exportAction ?? ""];
      const target = id ? root.querySelector<HTMLButtonElement>(`#${id}`) : null;
      target?.click();
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
