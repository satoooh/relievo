import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { FrameSample, ReliefParams, RuntimeStats } from "../types";

export class ReliefRenderer {
  readonly canvas: HTMLCanvasElement;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly geometry = new THREE.BufferGeometry();
  private readonly material = new THREE.PointsMaterial({
    size: 2.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  private readonly points = new THREE.Points(this.geometry, this.material);
  private positions = new Float32Array();
  private colors = new Float32Array();
  private sourcePixels?: ImageData;
  private depth?: Float32Array;
  private width = 0;
  private height = 0;
  private animationFrame = 0;
  private startedAt = performance.now();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x08090b, 1);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    this.camera.position.set(0, 0.2, 6.2);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 0, 0);

    this.scene.add(this.points);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  }

  setFrame(sample: FrameSample, depth: Float32Array, params: ReliefParams): void {
    const needsRebuild = sample.width !== this.width || sample.height !== this.height;
    this.sourcePixels = sample.data;
    this.depth = depth;

    if (needsRebuild) {
      this.width = sample.width;
      this.height = sample.height;
      this.rebuildGeometry(sample.width, sample.height);
    }

    this.updateGeometry(params, performance.now());
  }

  restartIntro(): void {
    this.startedAt = performance.now();
  }

  render(params: ReliefParams, stats: RuntimeStats): void {
    const now = performance.now();
    this.resize(params.renderScale);
    this.updateGeometry(params, now);
    this.material.size = params.pointSize;
    this.material.opacity = params.pointOpacity;
    this.renderer.autoClear = true;
    this.points.rotation.y = Math.sin((now - this.startedAt) * 0.0002) * 0.04;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    stats.renderFPS = stats.renderFPS;
  }

  start(params: ReliefParams, onFrame: () => void): void {
    const loop = () => {
      onFrame();
      this.render(params, {
        renderFPS: 0,
        inferenceFPS: 0,
        inferenceMs: 0,
        backend: "cpu-heuristic",
        sourceKind: "demo",
        webgpuAvailable: false,
        recordingSupported: false,
        recording: false,
        quality: "",
        pipeline: "",
        message: "",
      });
      this.animationFrame = requestAnimationFrame(loop);
    };
    this.animationFrame = requestAnimationFrame(loop);
  }

  stop(): void {
    cancelAnimationFrame(this.animationFrame);
    this.renderer.dispose();
    this.geometry.dispose();
    this.material.dispose();
    this.controls.dispose();
  }

  private rebuildGeometry(width: number, height: number): void {
    const count = width * height;
    this.positions = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));
    this.geometry.computeBoundingSphere();
  }

  private updateGeometry(params: ReliefParams, now: number): void {
    if (!this.depth || !this.sourcePixels || this.positions.length === 0) {
      return;
    }

    const image = this.sourcePixels.data;
    const aspect = this.width / this.height;
    const breathing = 1 + Math.sin((now - this.startedAt) * 0.0018) * params.breathing;
    const introMorph = Math.min(1, ((now - this.startedAt) * params.morphSpeed) / 1800);
    const scan = scanThreshold(params, now - this.startedAt);
    const quantizeSteps = Math.max(0, Math.round(params.depthQuantize));

    for (let y = 0; y < this.height; y += 1) {
      const yn = this.height <= 1 ? 0 : y / (this.height - 1);
      for (let x = 0; x < this.width; x += 1) {
        const xn = this.width <= 1 ? 0 : x / (this.width - 1);
        const index = y * this.width + x;
        const positionIndex = index * 3;
        const pixelIndex = index * 4;
        const scanAxis = scanValue(params.scanDirection, xn, yn);
        const revealed = scanAxis <= scan ? 1 : 0.08;
        const glitch = params.glitchAmount > 0 ? pseudoNoise(x, y, now) * params.glitchAmount : 0;
        let z = this.depth[index] ?? 0;
        z = Math.pow(z, params.depthGamma);

        if (quantizeSteps > 1) {
          z = Math.round(z * quantizeSteps) / quantizeSteps;
        }

        const foreground = Math.min(1, z + params.foregroundBoost * z);
        const trailWave = Math.sin((now - this.startedAt) * 0.003 + x * 0.13 + y * 0.07) * params.trailAmount;
        const displaced = (z + glitch + trailWave) * params.depthScale * params.morphAmount * introMorph * breathing * revealed;
        this.positions[positionIndex] = (xn - 0.5) * aspect * 4.8;
        this.positions[positionIndex + 1] = (0.5 - yn) * 4.8;
        this.positions[positionIndex + 2] = displaced - params.depthScale * 0.45;

        const r = (image[pixelIndex] ?? 0) / 255;
        const g = (image[pixelIndex + 1] ?? 0) / 255;
        const b = (image[pixelIndex + 2] ?? 0) / 255;
        const mono = (r + g + b) / 3;
        const fade = params.backgroundFade + foreground * (1 - params.backgroundFade);
        const strength = params.colorStrength;
        const scanTint = revealed < 1 ? 0.24 : 1;

        this.colors[positionIndex] = colorChannel(params.monochrome ? mono * 0.65 : r, strength, fade, scanTint, 0.48);
        this.colors[positionIndex + 1] = colorChannel(params.monochrome ? mono * 0.9 : g, strength, fade, scanTint, 0.86);
        this.colors[positionIndex + 2] = colorChannel(params.monochrome ? mono : b, strength, fade, scanTint, 1);
      }
    }

    this.geometry.attributes.position!.needsUpdate = true;
    this.geometry.attributes.color!.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }

  private resize(renderScale: number): void {
    const parent = this.canvas.parentElement;
    const width = Math.max(1, Math.floor((parent?.clientWidth ?? window.innerWidth) * renderScale));
    const height = Math.max(1, Math.floor((parent?.clientHeight ?? window.innerHeight) * renderScale));
    const displayWidth = parent?.clientWidth ?? window.innerWidth;
    const displayHeight = parent?.clientHeight ?? window.innerHeight;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.renderer.setSize(width, height, false);
      this.canvas.style.width = `${displayWidth}px`;
      this.canvas.style.height = `${displayHeight}px`;
      this.camera.aspect = displayWidth / displayHeight;
      this.camera.updateProjectionMatrix();
    }
  }
}

function colorChannel(value: number, strength: number, fade: number, scanTint: number, tint: number): number {
  const colored = value * strength + tint * (1 - strength);
  return Math.min(1, Math.max(0, colored * fade * scanTint));
}

function scanThreshold(params: ReliefParams, elapsedMs: number): number {
  if (params.scanReveal >= 1) {
    return 1;
  }

  const autoScan = (elapsedMs * 0.00008 * Math.max(0.1, params.morphSpeed)) % 1;
  return Math.min(1, Math.max(params.scanReveal, autoScan));
}

function scanValue(direction: ReliefParams["scanDirection"], xn: number, yn: number): number {
  switch (direction) {
    case "right-left":
      return 1 - xn;
    case "top-bottom":
      return yn;
    case "bottom-top":
      return 1 - yn;
    case "left-right":
    default:
      return xn;
  }
}

function pseudoNoise(x: number, y: number, now: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233 + Math.floor(now / 120) * 0.31) * 43758.5453;
  return (value - Math.floor(value) - 0.5) * 2;
}
