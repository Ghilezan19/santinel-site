"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export type HeroSceneState = { intro: number; scroll: number; mx: number; my: number };

type Labels = { ok: string; harness: string; pm: string };

const FLOOR_H = 2.4;
const FLOORS = 9;
const NX = 4;
const NZ = 3;
const SP = 3;

/* ---------------- shaders ---------------- */

const lineVert = /* glsl */ `
  varying vec3 vWorld;
  varying float vDepth;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const lineFrag = /* glsl */ `
  uniform float uScan;
  uniform vec3 uBase;
  uniform vec3 uHot;
  uniform float uOpacity;
  varying vec3 vWorld;
  varying float vDepth;
  void main() {
    float d = abs(vWorld.y - uScan);
    float glow = smoothstep(1.6, 0.0, d);
    float trail = smoothstep(6.0, 0.0, uScan - vWorld.y) * step(vWorld.y, uScan) * 0.25;
    vec3 col = mix(uBase, uHot, clamp(glow + trail, 0.0, 1.0));
    float a = (0.6 + glow * 0.4 + trail) * uOpacity;
    a *= 1.0 - smoothstep(28.0, 70.0, vDepth);
    gl_FragColor = vec4(col, a);
  }
`;

const scanVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const scanFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float r = distance(vUv, vec2(0.5));
    float disc = smoothstep(0.5, 0.0, r);
    float ring = smoothstep(0.012, 0.0, abs(r - 0.32)) * 0.8;
    float grid = 0.0;
    vec2 g = abs(fract(vUv * 40.0) - 0.5);
    grid = smoothstep(0.47, 0.5, max(g.x, g.y)) * 0.25;
    float a = (disc * 0.18 + ring + grid * disc) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

/* ---------------- geometry builders ---------------- */

function seg(arr: number[], a: [number, number, number], b: [number, number, number]) {
  arr.push(a[0], a[1], a[2], b[0], b[1], b[2]);
}

function buildStructure() {
  const p: number[] = [];
  const x0 = -((NX - 1) * SP) / 2;
  const z0 = -((NZ - 1) * SP) / 2;
  const colTop = (i: number, k: number) => {
    // upper floors still under construction: missing columns on one corner
    const partial = i >= 2 && k === 0;
    return partial ? FLOORS - 2 : FLOORS;
  };
  for (let i = 0; i < NX; i++)
    for (let k = 0; k < NZ; k++) {
      const x = x0 + i * SP;
      const z = z0 + k * SP;
      seg(p, [x, 0, z], [x, colTop(i, k) * FLOOR_H, z]);
    }
  for (let f = 1; f <= FLOORS; f++) {
    const y = f * FLOOR_H;
    for (let k = 0; k < NZ; k++)
      for (let i = 0; i < NX - 1; i++) {
        if (f > FLOORS - 2 && k === 0 && i >= 1) continue;
        seg(p, [x0 + i * SP, y, z0 + k * SP], [x0 + (i + 1) * SP, y, z0 + k * SP]);
      }
    for (let i = 0; i < NX; i++)
      for (let k = 0; k < NZ - 1; k++) {
        if (f > FLOORS - 2 && i >= 2 && k === 0) continue;
        seg(p, [x0 + i * SP, y, z0 + k * SP], [x0 + i * SP, y, z0 + (k + 1) * SP]);
      }
  }
  // cross bracing on the back face
  for (let f = 0; f < FLOORS - 3; f += 2) {
    const z = z0;
    for (let i = 0; i < NX - 1; i += 2) {
      seg(p, [x0 + i * SP, f * FLOOR_H, z], [x0 + (i + 1) * SP, (f + 1) * FLOOR_H, z]);
      seg(p, [x0 + (i + 1) * SP, f * FLOOR_H, z], [x0 + i * SP, (f + 1) * FLOOR_H, z]);
    }
  }
  // scaffolding on the right side
  const sx = -x0 + 1.1;
  for (let k = 0; k <= 4; k++) {
    const z = z0 + k * ((NZ - 1) * SP) / 4;
    seg(p, [sx, 0, z], [sx, 6 * FLOOR_H, z]);
    seg(p, [sx + 0.9, 0, z], [sx + 0.9, 6 * FLOOR_H, z]);
  }
  for (let f = 0; f <= 12; f++) {
    const y = f * FLOOR_H * 0.5;
    seg(p, [sx, y, z0], [sx, y, -z0]);
    seg(p, [sx + 0.9, y, z0], [sx + 0.9, y, -z0]);
    if (f % 2 === 0) seg(p, [sx, y, z0], [sx + 0.9, y, z0]);
  }
  return new Float32Array(p);
}

function buildCraneMast(h: number) {
  const p: number[] = [];
  const w = 0.7;
  const c: [number, number][] = [
    [-w, -w],
    [w, -w],
    [w, w],
    [-w, w],
  ];
  c.forEach(([x, z]) => seg(p, [x, 0, z], [x, h, z]));
  const step = 1.4;
  for (let y = 0, n = 0; y < h; y += step, n++) {
    for (let j = 0; j < 4; j++) {
      const [ax, az] = c[j];
      const [bx, bz] = c[(j + 1) % 4];
      seg(p, [ax, y, az], [bx, y, bz]);
      if (n % 2 === 0) seg(p, [ax, y, az], [bx, y + step, bz]);
      else seg(p, [bx, y, bz], [ax, y + step, az]);
    }
  }
  return new Float32Array(p);
}

function buildCraneJib() {
  const p: number[] = [];
  const L = 22;
  const back = -7;
  // lower chords
  seg(p, [back, 0, -0.5], [L, 0, -0.5]);
  seg(p, [back, 0, 0.5], [L, 0, 0.5]);
  // top chord
  seg(p, [back, 1.2, 0], [L, 1.2, 0]);
  for (let x = back, n = 0; x < L; x += 1.5, n++) {
    seg(p, [x, 0, -0.5], [x, 0, 0.5]);
    seg(p, [x, 0, -0.5], [x + 1.5, 1.2, 0]);
    seg(p, [x, 0, 0.5], [x + 1.5, 1.2, 0]);
  }
  // apex + tie rods
  seg(p, [0, 1.2, 0], [0, 5, 0]);
  seg(p, [0, 5, 0], [L * 0.7, 1.2, 0]);
  seg(p, [0, 5, 0], [back, 1.2, 0]);
  // counterweight box
  const cw = [back + 0.2, back + 2.4];
  seg(p, [cw[0], 0, -0.8], [cw[1], 0, -0.8]);
  seg(p, [cw[0], -1.4, -0.8], [cw[1], -1.4, -0.8]);
  seg(p, [cw[0], 0, -0.8], [cw[0], -1.4, -0.8]);
  seg(p, [cw[1], 0, -0.8], [cw[1], -1.4, -0.8]);
  // cable + hook
  seg(p, [14, 0, 0], [14, -14, 0]);
  seg(p, [13.4, -14, 0], [14.6, -14, 0]);
  seg(p, [13.4, -14, 0], [14, -14.9, 0]);
  seg(p, [14.6, -14, 0], [14, -14.9, 0]);
  return new Float32Array(p);
}

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.4, "rgba(255,255,255,0.35)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

/* ---------------- components ---------------- */

function useLineMaterial(base: string, hot: string, opacity = 1) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: lineVert,
        fragmentShader: lineFrag,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uScan: { value: 0 },
          uBase: { value: new THREE.Color(base) },
          uHot: { value: new THREE.Color(hot) },
          uOpacity: { value: opacity },
        },
      }),
    [base, hot, opacity],
  );
}

function Lines({ positions, material }: { positions: Float32Array; material: THREE.Material }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  return <lineSegments geometry={geom} material={material} />;
}

function Slabs() {
  const x = ((NX - 1) * SP) / 2;
  const z = ((NZ - 1) * SP) / 2;
  const floors = Array.from({ length: FLOORS - 3 }, (_, i) => i + 1);
  return (
    <group>
      {floors.map((f) => (
        <mesh key={f} position={[0, f * FLOOR_H - 0.08, 0]}>
          <boxGeometry args={[x * 2 + 0.4, 0.16, z * 2 + 0.4]} />
          <meshStandardMaterial color="#2a2f37" roughness={0.8} metalness={0.3} transparent opacity={0.9} />
        </mesh>
      ))}
      {/* concrete core */}
      <mesh position={[-x + SP / 2, ((FLOORS - 2) * FLOOR_H) / 2, z - SP / 2]}>
        <boxGeometry args={[2.2, (FLOORS - 2) * FLOOR_H, 2.2]} />
        <meshStandardMaterial color="#14171b" roughness={1} />
      </mesh>
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 44;
      positions[i * 3 + 1] = Math.random() * 26;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      speeds[i] = 0.15 + Math.random() * 0.5;
    }
    return { positions, speeds };
  }, [count]);
  const tex = useMemo(() => dotTexture(), []);

  useFrame((_, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const t = performance.now() * 0.0003;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      arr[i * 3] += Math.sin(t + i) * 0.004;
      if (arr[i * 3 + 1] > 26) arr[i * 3 + 1] = 0;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        map={tex}
        color="#d9c79a"
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function Label({ position, text, tone }: { position: [number, number, number]; text: string; tone: "ok" | "bad" | "air" }) {
  const color = tone === "ok" ? "#3ddc84" : tone === "bad" ? "#ff3b3b" : "#2ee6c5";
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            transform: "translate(50%, -130%)",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
            color,
            border: `1px solid ${color}`,
            background: "rgba(7,8,10,0.72)",
            padding: "4px 8px",
            backdropFilter: "blur(4px)",
          }}
        >
          {text}
        </div>
      </Html>
    </group>
  );
}

function Rig({ state, mobile }: { state: React.RefObject<HeroSceneState>; mobile: boolean }) {
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const s = state.current;
    if (!s) return;
    const intro = s.intro;
    const sc = s.scroll;
    const tx = 26 + s.mx * 3 - sc * 6;
    const ty = 13 + s.my * -2 + (1 - intro) * 14 + sc * 4;
    const tz = 36 + (1 - intro) * 22 - sc * 10;
    camera.position.x += (tx - camera.position.x) * 0.05;
    camera.position.y += (ty - camera.position.y) * 0.05;
    camera.position.z += (tz - camera.position.z) * 0.05;
    // desktop: aim left of the building so it sits on the right of the frame
    if (mobile) look.set(1, 10 + sc * 3, 0);
    else look.set(-6, 9 + sc * 3, 6.5);
    camera.lookAt(look);
  });
  return null;
}

function World({ state, labels, mobile }: { state: React.RefObject<HeroSceneState>; labels: Labels; mobile: boolean }) {
  const structure = useMemo(() => buildStructure(), []);
  const mast = useMemo(() => buildCraneMast(28), []);
  const jib = useMemo(() => buildCraneJib(), []);
  const steel = useLineMaterial("#9aa3b0", "#ffc400");
  const crane = useLineMaterial("#8a6a12", "#ffd84d", 0.9);
  const jibRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const scanMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: scanVert,
        fragmentShader: scanFrag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#ffc400") }, uOpacity: { value: 1 } },
      }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // scanner sweeps bottom → top, pauses, repeats
    const period = 7;
    const ph = (t % period) / period;
    const y = THREE.MathUtils.lerp(-1, 26, THREE.MathUtils.smoothstep(ph, 0.05, 0.85));
    steel.uniforms.uScan.value = y;
    crane.uniforms.uScan.value = y;
    if (scanRef.current) {
      scanRef.current.position.y = y;
      scanMat.uniforms.uOpacity.value = Math.sin(Math.min(ph / 0.9, 1) * Math.PI) * (state.current?.intro ?? 1);
    }
    if (jibRef.current) jibRef.current.rotation.y = Math.sin(t * 0.12) * 0.7 - 0.4;
  });

  return (
    <group position={[0, -2, 0]}>
      <Lines positions={structure} material={steel} />
      <Slabs />
      <group position={[-12, 0, -4]}>
        <Lines positions={mast} material={crane} />
        <group ref={jibRef} position={[0, 28, 0]}>
          <Lines positions={jib} material={crane} />
        </group>
      </group>
      <mesh ref={scanRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[34, 34]} />
        <primitive object={scanMat} attach="material" />
      </mesh>
      <gridHelper args={[120, 60, "#2a2f36", "#15181d"]} />
      <Dust count={mobile ? 500 : 1400} />
      {!mobile && (
        <>
          <Label position={[-4.5, FLOOR_H * 2 + 0.9, 3]} text={labels.ok} tone="ok" />
          <Label position={[5.5, FLOOR_H * 5 + 0.9, 1.5]} text={labels.harness} tone="bad" />
          <Label position={[9, 1.2, 6]} text={labels.pm} tone="air" />
        </>
      )}
    </group>
  );
}

export default function HeroScene({
  state,
  labels,
  mobile,
}: {
  state: React.RefObject<HeroSceneState>;
  labels: Labels;
  mobile: boolean;
}) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.75]}
      camera={{ position: [20, 24, 48], fov: 35, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#07080a"]} />
      <fog attach="fog" args={["#07080a", 24, 72]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[12, 24, 14]} intensity={1.4} color="#ffe2a8" />
      <directionalLight position={[-14, 8, -10]} intensity={0.4} color="#2ee6c5" />
      <Rig state={state} mobile={mobile} />
      <World state={state} labels={labels} mobile={mobile} />
    </Canvas>
  );
}
