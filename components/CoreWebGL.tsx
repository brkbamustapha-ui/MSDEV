"use client";

import { useEffect, useRef } from "react";

import { cn, clamp } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * The MSDEV core: a raymarched metallic object rendered in raw WebGL.
 *
 * No 3D library is loaded for this — the whole thing is one fragment shader,
 * which keeps it a few kilobytes instead of a few hundred. It reacts to the
 * pointer, drifts with scroll, drops its resolution and step count on phones,
 * pauses when off-screen, and renders a single still frame when the visitor
 * has asked for reduced motion.
 */

const VERTEX = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uSteps;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float map(vec3 p) {
  vec3 q = p;
  q.xz *= rot(uTime * 0.18 + uScroll * 1.6);
  q.xy *= rot(uTime * 0.11 + uScroll * 0.5);
  q.xz *= rot(q.y * (0.22 + uScroll * 0.34));

  float shell = sdTorus(q, vec2(0.95, 0.245));
  float core = length(p) - (0.42 + 0.03 * sin(uTime * 0.9));
  float d = smin(shell, core, 0.16);

  // fine machined ripple
  d -= 0.008 * sin(11.0 * q.x + uTime * 0.6) * sin(11.0 * q.y) * sin(11.0 * q.z);
  return d;
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.0014, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

/*
 * A dark studio. The two softbox strips are what make the surface read as
 * metal — a pure gradient environment renders as matte clay no matter how the
 * fresnel is tuned.
 */
vec3 env(vec3 rd) {
  float up = rd.y * 0.5 + 0.5;
  vec3 base = mix(vec3(0.012, 0.013, 0.018), vec3(0.13, 0.135, 0.155), up);

  float strip = smoothstep(0.14, 0.0, abs(rd.y - 0.30));
  float stripLow = smoothstep(0.06, 0.0, abs(rd.y + 0.18));
  base += vec3(1.0, 0.98, 0.95) * strip * 2.1;
  base += vec3(0.82, 0.68, 0.48) * stripLow * 0.95;

  float key = pow(max(dot(rd, normalize(vec3(0.55, 0.78, -0.30))), 0.0), 24.0);
  float bounce = pow(max(dot(rd, normalize(vec3(-0.72, 0.18, 0.60))), 0.0), 7.0);
  base += vec3(1.0, 0.96, 0.90) * key * 2.2;
  base += vec3(0.78, 0.63, 0.45) * bounce * 0.8;

  // the floor swallows light
  base *= mix(0.28, 1.0, smoothstep(-0.55, 0.05, rd.y));
  return base;
}

void main() {
  // normalised to ±1 on the short edge, so the object sits inside the frame
  vec2 uv = 2.0 * (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

  vec3 ro = vec3(0.0, 0.0, 4.0);
  vec3 rd = normalize(vec3(uv, -2.25));

  // a fixed three-quarter tilt reads as a ring; the pointer nudges it from there
  float tilt = 0.46 + uMouse.y * 0.26;
  float turn = uMouse.x * 0.44;
  ro.yz *= rot(tilt); rd.yz *= rot(tilt);
  ro.xz *= rot(turn); rd.xz *= rot(turn);

  float t = 0.0;
  float glow = 0.0;
  bool hit = false;

  for (int i = 0; i < 96; i++) {
    if (float(i) >= uSteps) break;
    vec3 p = ro + rd * t;
    float d = map(p);
    glow += 0.014 / (0.6 + d * d * 26.0);
    if (d < 0.0016) { hit = true; break; }
    if (t > 7.0) break;
    t += d * 0.9;
  }

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = normalAt(p);
    vec3 refl = reflect(rd, n);

    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    vec3 metal = env(refl) * mix(vec3(0.66, 0.68, 0.73), vec3(0.90, 0.77, 0.60), fres * 0.75);

    float spec = pow(max(dot(refl, normalize(vec3(0.55, 0.78, -0.30))), 0.0), 48.0);
    metal += vec3(1.0, 0.97, 0.92) * spec * 1.5;
    metal += vec3(0.88, 0.72, 0.52) * fres * 0.8;

    // grounding shadow toward the base of the object
    metal *= 0.35 + 0.65 * clamp(n.y * 0.5 + 0.7, 0.0, 1.0);

    col = metal;
    alpha = 1.0;
  }

  // atmospheric halo, so the object sits in light rather than on a hole
  vec3 haze = vec3(0.80, 0.66, 0.48) * glow * 0.26;
  col += haze;
  alpha = clamp(alpha + glow * 0.16, 0.0, 1.0);

  // slight filmic roll-off
  col = col / (col + vec3(0.58));
  col = pow(col, vec3(0.4545));

  gl_FragColor = vec4(col, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function CoreWebGL({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hostRef, inView] = useInView<HTMLDivElement>({ rootMargin: "220px" });
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !inView) return;

    const gl =
      (canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false }) as
        | WebGLRenderingContext
        | null) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) return; // no WebGL: the CSS fallback underneath stays visible

    const program = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!program || !vs || !fs) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uScroll = gl.getUniformLocation(program, "uScroll");
    const uSteps = gl.getUniformLocation(program, "uSteps");

    const isSmall = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1 : 1.35);
    gl.uniform1f(uSteps, isSmall ? 46 : 82);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let scroll = 0;
    let frame = 0;
    const start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 2 - 1;
      pointer.ty = clamp((event.clientY - rect.top) / rect.height, 0, 1) * 2 - 1;
    };

    const readScroll = () => {
      const rect = canvas.getBoundingClientRect();
      const total = window.innerHeight + rect.height;
      scroll = clamp((window.innerHeight - rect.top) / total, 0, 1);
    };

    const draw = (time: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      gl.uniform1f(uTime, (time - start) / 1000);
      gl.uniform2f(uMouse, pointer.x, pointer.y);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      readScroll();
      draw(time);
    };

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    resize();
    readScroll();

    if (reducedMotion) {
      // one still frame, then nothing moves
      draw(start);
    } else {
      frame = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    const onResize = () => {
      resize();
      if (reducedMotion) draw(start);
    };
    window.addEventListener("resize", onResize);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [inView, reducedMotion]);

  return (
    <div ref={hostRef} className={cn("relative", className)} aria-hidden="true">
      {/* visible if WebGL is unavailable */}
      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_40%_35%,rgba(239,235,228,0.16),rgba(200,162,122,0.1)_45%,transparent_70%)] blur-xl" />
      <canvas ref={canvasRef} className="relative h-full w-full" />
    </div>
  );
}

export default CoreWebGL;
