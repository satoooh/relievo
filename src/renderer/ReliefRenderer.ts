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
  private readonly uniforms = createReliefUniforms();
  private readonly material = new THREE.ShaderMaterial({
    uniforms: this.uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  private readonly points = new THREE.Points(this.geometry, this.material);
  private positions = new Float32Array();
  private uvs = new Float32Array();
  private depths = new Float32Array();
  private colors = new Float32Array();
  private seeds = new Float32Array();
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

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);
    this.camera.position.set(0, 0.16, 7.6);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 0, 0);

    this.scene.add(this.points);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  }

  setFrame(sample: FrameSample, depth: Float32Array, params: ReliefParams): void {
    const needsRebuild = sample.width !== this.width || sample.height !== this.height;

    if (needsRebuild) {
      this.width = sample.width;
      this.height = sample.height;
      this.rebuildGeometry(sample.width, sample.height);
    }

    this.updateFrameAttributes(sample, depth);
    this.updateUniforms(params, performance.now());
  }

  restartIntro(): void {
    this.startedAt = performance.now();
  }

  render(params: ReliefParams, stats: RuntimeStats): void {
    const now = performance.now();
    this.resize(params.renderScale);
    this.updateUniforms(params, now);
    this.renderer.autoClear = true;
    this.points.rotation.y = 0;
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
        loading: false,
        loadingLabel: "",
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
    this.uvs = new Float32Array(count * 2);
    this.depths = new Float32Array(count);
    this.colors = new Float32Array(count * 3);
    this.seeds = new Float32Array(count);
    const aspect = this.width / this.height;

    for (let y = 0; y < this.height; y += 1) {
      const yn = this.height <= 1 ? 0 : y / (this.height - 1);
      for (let x = 0; x < this.width; x += 1) {
        const xn = this.width <= 1 ? 0 : x / (this.width - 1);
        const index = y * this.width + x;
        const positionIndex = index * 3;
        const uvIndex = index * 2;
        this.positions[positionIndex] = (xn - 0.5) * aspect * 3.95;
        this.positions[positionIndex + 1] = (0.5 - yn) * 3.95;
        this.positions[positionIndex + 2] = 0;
        this.uvs[uvIndex] = xn;
        this.uvs[uvIndex + 1] = yn;
        this.seeds[index] = pseudoNoise(x, y, 0);
      }
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("aUv", new THREE.BufferAttribute(this.uvs, 2));
    this.geometry.setAttribute("aDepth", new THREE.BufferAttribute(this.depths, 1));
    this.geometry.setAttribute("aColor", new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(this.seeds, 1));
    this.geometry.computeBoundingSphere();
  }

  private updateFrameAttributes(sample: FrameSample, depth: Float32Array): void {
    const image = sample.data.data;
    for (let index = 0; index < depth.length; index += 1) {
      const pixelIndex = index * 4;
      const colorIndex = index * 3;
      this.depths[index] = depth[index] ?? 0;
      this.colors[colorIndex] = (image[pixelIndex] ?? 0) / 255;
      this.colors[colorIndex + 1] = (image[pixelIndex + 1] ?? 0) / 255;
      this.colors[colorIndex + 2] = (image[pixelIndex + 2] ?? 0) / 255;
    }

    this.geometry.attributes.aDepth!.needsUpdate = true;
    this.geometry.attributes.aColor!.needsUpdate = true;
  }

  private updateUniforms(params: ReliefParams, now: number): void {
    const elapsedMs = now - this.startedAt;
    const near = Math.min(params.nearThreshold, params.farThreshold - 0.02);
    const far = Math.max(params.farThreshold, near + 0.02);
    this.uniforms.uBackgroundFade.value = params.backgroundFade;
    this.uniforms.uBrightness.value = params.brightness;
    this.uniforms.uBreathing.value = params.breathing;
    this.uniforms.uColorStrength.value = params.colorStrength;
    this.uniforms.uDepthGamma.value = params.depthGamma;
    this.uniforms.uDepthQuantize.value = Math.max(0, Math.round(params.depthQuantize));
    this.uniforms.uDepthScale.value = params.depthScale;
    this.uniforms.uElapsed.value = elapsedMs;
    this.uniforms.uFarThreshold.value = far;
    this.uniforms.uForegroundBoost.value = params.foregroundBoost;
    this.uniforms.uGlitchAmount.value = params.glitchAmount;
    this.uniforms.uIntroMorph.value = easeOutCubic(clamp01((elapsedMs * (0.45 + params.morphSpeed)) / 4200));
    this.uniforms.uMonochrome.value = params.monochrome ? 1 : 0;
    this.uniforms.uMorphAmount.value = params.morphAmount;
    this.uniforms.uNearThreshold.value = near;
    this.uniforms.uPointOpacity.value = params.pointOpacity;
    this.uniforms.uPointSize.value = params.pointSize;
    this.uniforms.uScanDirection.value = scanDirectionIndex(params.scanDirection);
    this.uniforms.uScan.value = scanThreshold(params, elapsedMs);
    this.uniforms.uTextureMix.value = params.textureMix;
    this.uniforms.uTrailAmount.value = params.trailAmount;
  }

  private resize(renderScale: number): void {
    const parent = this.canvas.parentElement;
    const width = Math.max(1, Math.floor((parent?.clientWidth ?? window.innerWidth) * renderScale));
    const height = Math.max(1, Math.floor((parent?.clientHeight ?? window.innerHeight) * renderScale));
    const displayWidth = parent?.clientWidth ?? window.innerWidth;
    const displayHeight = parent?.clientHeight ?? window.innerHeight;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.renderer.setSize(width, height, false);
      this.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
      this.uniforms.uViewportHeight.value = height;
      this.canvas.style.width = `${displayWidth}px`;
      this.canvas.style.height = `${displayHeight}px`;
      this.camera.aspect = displayWidth / displayHeight;
      this.camera.updateProjectionMatrix();
    }
  }
}

function scanThreshold(params: ReliefParams, elapsedMs: number): number {
  if (params.scanReveal >= 1) {
    return 1;
  }

  const autoScan = (elapsedMs * 0.00008 * Math.max(0.1, params.morphSpeed)) % 1;
  return Math.min(1, Math.max(params.scanReveal, autoScan));
}

function scanDirectionIndex(direction: ReliefParams["scanDirection"]): number {
  switch (direction) {
    case "right-left":
      return 1;
    case "top-bottom":
      return 2;
    case "bottom-top":
      return 3;
    case "left-right":
    default:
      return 0;
  }
}

function pseudoNoise(x: number, y: number, now: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233 + Math.floor(now / 120) * 0.31) * 43758.5453;
  return (value - Math.floor(value) - 0.5) * 2;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

function createReliefUniforms() {
  return {
    uBackgroundFade: { value: 0.72 },
    uBrightness: { value: 0.72 },
    uBreathing: { value: 0.01 },
    uColorStrength: { value: 1 },
    uDepthGamma: { value: 1.42 },
    uDepthQuantize: { value: 0 },
    uDepthScale: { value: 3.3 },
    uElapsed: { value: 0 },
    uFarThreshold: { value: 1 },
    uForegroundBoost: { value: 0.72 },
    uGlitchAmount: { value: 0.01 },
    uIntroMorph: { value: 0 },
    uMonochrome: { value: 0 },
    uMorphAmount: { value: 1 },
    uNearThreshold: { value: 0 },
    uPixelRatio: { value: 1 },
    uPointOpacity: { value: 0.64 },
    uPointSize: { value: 0.22 },
    uScan: { value: 1 },
    uScanDirection: { value: 0 },
    uTextureMix: { value: 0.62 },
    uTrailAmount: { value: 0 },
    uViewportHeight: { value: 720 },
  };
}

const vertexShader = `
  attribute vec2 aUv;
  attribute float aDepth;
  attribute vec3 aColor;
  attribute float aSeed;

  uniform float uBackgroundFade;
  uniform float uBrightness;
  uniform float uBreathing;
  uniform float uColorStrength;
  uniform float uDepthGamma;
  uniform float uDepthQuantize;
  uniform float uDepthScale;
  uniform float uElapsed;
  uniform float uFarThreshold;
  uniform float uForegroundBoost;
  uniform float uGlitchAmount;
  uniform float uIntroMorph;
  uniform float uMonochrome;
  uniform float uMorphAmount;
  uniform float uNearThreshold;
  uniform float uPixelRatio;
  uniform float uPointOpacity;
  uniform float uPointSize;
  uniform float uScan;
  uniform float uScanDirection;
  uniform float uTextureMix;
  uniform float uTrailAmount;
  uniform float uViewportHeight;

  varying vec3 vColor;
  varying float vAlpha;

  float random(vec2 value) {
    return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
  }

  float scanAxis(vec2 uv) {
    if (uScanDirection < 0.5) {
      return uv.x;
    }
    if (uScanDirection < 1.5) {
      return 1.0 - uv.x;
    }
    if (uScanDirection < 2.5) {
      return uv.y;
    }
    return 1.0 - uv.y;
  }

  vec3 colorChannel(vec3 value, float strength) {
    vec3 tint = vec3(0.18, 0.42, 0.72);
    return clamp(value * strength + tint * (1.0 - strength), 0.0, 1.0);
  }

  void main() {
    float axis = scanAxis(aUv);
    float revealed = axis <= uScan ? 1.0 : 0.08;
    float animatedNoise = random(aUv * 2048.0 + floor(uElapsed / 120.0) * 0.31);
    float z = pow(clamp(aDepth, 0.0, 1.0), uDepthGamma);

    if (uDepthQuantize > 1.0) {
      z = floor(z * uDepthQuantize + 0.5) / uDepthQuantize;
    }

    float depthWindow = smoothstep(uNearThreshold, uNearThreshold + 0.04, z) *
      (1.0 - smoothstep(uFarThreshold - 0.04, uFarThreshold, z));
    float foreground = clamp(z + uForegroundBoost * z, 0.0, 1.0);
    float trailWave = sin(uElapsed * 0.003 + aUv.x * 68.0 + aUv.y * 37.0) * uTrailAmount;
    float localMorph = smoothstep(0.0, 1.0, uIntroMorph * 1.18 - axis * 0.16 + z * 0.08 + aSeed * 0.025);
    float breathing = 1.0 + sin(uElapsed * 0.0018) * uBreathing;
    float settledMotion = 1.0 + sin(uElapsed * 0.0012 + aSeed * 2.4) * uBreathing * 0.35;
    float glitch = animatedNoise * uGlitchAmount;
    float displaced = (z + glitch + trailWave) * uDepthScale * uMorphAmount * localMorph * breathing * settledMotion * revealed;

    vec3 transformed = position;
    transformed.z = displaced - uDepthScale * 0.45;

    float mono = dot(aColor, vec3(0.333333));
    float fade = uBackgroundFade + foreground * (1.0 - uBackgroundFade);
    float scanTint = revealed < 1.0 ? 0.24 : 1.0;
    float depthShade = pow(z, 0.72);
    float texture = mix(mono, mono, uMonochrome);
    float reliefTone = mix(depthShade, texture, uTextureMix);
    float pointLight = reliefTone * fade * depthWindow * scanTint * uBrightness * (0.38 + localMorph * 0.62);
    vec3 litColor = colorChannel(aColor * pointLight, uColorStrength);
    vec3 monoColor = vec3(pointLight * 0.78, pointLight * 0.82, pointLight * 0.9);
    vColor = mix(litColor, monoColor, step(0.5, uMonochrome));
    vAlpha = clamp(depthWindow * uPointOpacity * (0.18 + localMorph * 0.82), 0.0, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_PointSize = max(1.0, uPointSize * uViewportHeight * uPixelRatio * 0.078 / max(0.1, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float distanceFromCenter = length(centered);
    float mask = smoothstep(0.5, 0.28, distanceFromCenter);
    if (mask <= 0.02) {
      discard;
    }
    gl_FragColor = vec4(vColor, vAlpha * mask);
  }
`;
