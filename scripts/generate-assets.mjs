/**
 * MSDEV — asset generator.
 *
 * Every image shipped in /public/media is authored here as vector art and
 * rasterised with sharp. Nothing is fetched at runtime, so the site never
 * depends on a third-party image host and every asset is reproducible:
 *
 *    npm run assets
 *
 * Replace any generated file with a real photograph / screenshot of the same
 * dimensions and the site keeps working untouched.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = path.join(ROOT, "public", "media");
const APP = path.join(ROOT, "app");

/* ------------------------------------------------------------------ utils */

/** Deterministic PRNG so regenerating assets never shifts the composition. */
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n) => Math.round(n * 100) / 100;

/**
 * A named terrain profile turned into a closed silhouette path.
 * `points` are [t, height] pairs (t: 0→1 across the frame, height in px above
 * the baseline). Catmull-Rom smoothing keeps the crest natural, and the
 * returned `at(t)` sampler lets landmarks be planted exactly on the ridge.
 */
function profileRidge({ width, height, baseline, points, seed = 1, jitter = 0, samples = 160 }) {
  const rand = rng(seed);
  const noise = Array.from({ length: 24 }, () => (rand() - 0.5) * 2);

  const heightAt = (t) => {
    const clamped = Math.min(Math.max(t, 0), 1);
    const span = points.length - 1;
    const pos = clamped * span;
    const i = Math.min(Math.floor(pos), span - 1);
    const f = pos - i;
    const p0 = points[Math.max(i - 1, 0)][1];
    const p1 = points[i][1];
    const p2 = points[i + 1][1];
    const p3 = points[Math.min(i + 2, span)][1];
    // Catmull-Rom
    const h =
      0.5 *
      (2 * p1 + (p2 - p0) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
    if (!jitter) return h;
    const n =
      noise[Math.floor(clamped * 23)] * 0.6 +
      Math.sin(clamped * 37 + seed) * 0.4 +
      Math.sin(clamped * 91 + seed * 2) * 0.2;
    return h + n * jitter * (0.35 + h / (baseline || 1));
  };

  const at = (t) => round(baseline - heightAt(t));

  let d = `M 0 ${at(0)}`;
  for (let i = 1; i <= samples; i++) {
    d += ` L ${round((i / samples) * width)} ${at(i / samples)}`;
  }
  d += ` L ${width} ${height} L 0 ${height} Z`;

  return { d, at };
}

/* --------------------------------------------------- Santa Cruz landmarks */

/**
 * The Santa Cruz fort + chapel silhouette that crowns Djebel Murdjadjo above
 * the bay of Oran. Drawn as a compact vector group so it can be dropped on
 * any ridge at any scale.
 */
function santaCruz({ x, y, scale = 1, fill = "#0B0D12", opacity = 1 }) {
  const s = (n) => round(n * scale);
  return `
  <g transform="translate(${round(x)} ${round(y)}) scale(${scale})" fill="${fill}" opacity="${opacity}">
    <!-- rampart -->
    <path d="M -96 0 L -96 -16 L -70 -22 L -70 -30 L -40 -30 L -40 -22 L 44 -22 L 44 -34 L 74 -34 L 74 -20 L 104 -20 L 104 0 Z" />
    <!-- crenellations -->
    <rect x="-96" y="-22" width="8" height="7" /><rect x="-80" y="-24" width="8" height="7" />
    <rect x="-30" y="-30" width="8" height="7" /><rect x="-14" y="-30" width="8" height="7" />
    <rect x="2" y="-30" width="8" height="7" /><rect x="18" y="-30" width="8" height="7" />
    <rect x="80" y="-27" width="7" height="7" /><rect x="93" y="-27" width="7" height="7" />
    <!-- keep -->
    <path d="M -34 -30 L -34 -62 L 26 -62 L 26 -30 Z" />
    <rect x="-34" y="-70" width="9" height="9" /><rect x="-16" y="-70" width="9" height="9" />
    <rect x="2" y="-70" width="9" height="9" /><rect x="18" y="-70" width="9" height="9" />
    <!-- watch tower -->
    <path d="M 46 -34 L 46 -78 L 68 -78 L 68 -34 Z" />
    <path d="M 42 -78 L 72 -78 L 72 -84 L 42 -84 Z" />
    <rect x="55" y="-96" width="2" height="12" />
    <!-- chapel of Santa Cruz, with its column -->
    <path d="M -104 0 L -104 -26 L -74 -26 L -74 0 Z" />
    <path d="M -104 -26 L -89 -40 L -74 -26 Z" />
    <rect x="-90" y="-58" width="3" height="18" />
    <circle cx="-88.5" cy="-62" r="4.5" />
  </g>`;
}

/* ----------------------------------------------------------- hero artwork */

/**
 * "The bay of Oran at last light" — the frame the hero media expands into.
 * Deep void, brass horizon, Murdjadjo ridge crowned by Santa Cruz, the city
 * strung along the shoreline.
 */
function oranBay({ width, height, night = false }) {
  const rand = rng(night ? 20260909 : 1962);
  const horizon = height * (night ? 0.62 : 0.585);
  const sunX = width * (night ? 0.78 : 0.68);

  const sky = night
    ? [
        ["0%", "#04050A"],
        ["46%", "#080A11"],
        ["74%", "#0E1119"],
        ["100%", "#171A22"],
      ]
    : [
        ["0%", "#04050A"],
        ["28%", "#0B0D14"],
        ["55%", "#20201F"],
        ["80%", "#59422A"],
        ["100%", "#A9743E"],
      ];

  // The city strung along the shore: silhouettes, lit windows, and the glow
  // they throw back into the haze.
  let city = "";
  let windows = "";
  let lights = "";
  const shore = horizon + 2;
  let cx = -24;
  while (cx < width + 24) {
    const w = round(5 + rand() * 22);
    const h = round(height * (0.012 + rand() * 0.05));
    const top = round(shore - h);
    city += `<rect x="${round(cx)}" y="${top}" width="${w}" height="${round(h + height * 0.02)}" fill="#05070C"/>`;
    // lit windows
    const cols = Math.max(1, Math.floor(w / 5));
    const rows = Math.max(1, Math.floor(h / 6));
    for (let wx = 0; wx < cols; wx++) {
      for (let wy = 0; wy < rows; wy++) {
        if (rand() > (night ? 0.45 : 0.62)) {
          windows += `<rect x="${round(cx + 2 + wx * 5)}" y="${round(top + 3 + wy * 6)}" width="2" height="2.4" fill="${
            rand() > 0.75 ? "#FFF3DC" : "#F0C88E"
          }" opacity="${round(0.35 + rand() * 0.6)}"/>`;
        }
      }
    }
    cx += w + 2 + rand() * 7;
  }
  // Soft bloom sitting over the whole waterfront.
  const lightCount = night ? 220 : 150;
  for (let i = 0; i < lightCount; i++) {
    const x = rand() * width;
    const y = shore - rand() * height * 0.03;
    lights += `<circle cx="${round(x)}" cy="${round(y)}" r="${round(1.2 + rand() * 3.4)}" fill="${
      rand() > 0.72 ? "#FFF1D6" : "#E8B97C"
    }" opacity="${round(0.14 + rand() * 0.4)}"/>`;
  }

  // Specular path of light on the water.
  let glints = "";
  for (let i = 0; i < 90; i++) {
    const spread = 1 - Math.abs(rand() - 0.5) * 2;
    const y = horizon + 6 + rand() * (height - horizon) * 0.85;
    const depth = (y - horizon) / (height - horizon);
    const w = 8 + depth * 130 * (0.3 + rand());
    const x = sunX - w / 2 + (rand() - 0.5) * (60 + depth * 420);
    glints += `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(
      0.7 + depth * 1.6,
    )}" rx="1" fill="${night ? "#8FA6C8" : "#E8C79A"}" opacity="${round(
      (night ? 0.1 : 0.16) * spread * (1 - depth * 0.55),
    )}"/>`;
  }

  const U = height; // profile heights are expressed as a fraction of the frame

  // Djebel Murdjadjo: a heavy massif on the left falling away into the bay.
  const ridgeFar = profileRidge({
    width,
    height,
    baseline: horizon + 6,
    points: [
      [0, 0.05 * U],
      [0.08, 0.14 * U],
      [0.17, 0.235 * U],
      [0.26, 0.205 * U],
      [0.35, 0.145 * U],
      [0.46, 0.09 * U],
      [0.58, 0.055 * U],
      [0.72, 0.03 * U],
      [0.86, 0.02 * U],
      [1, 0.035 * U],
    ],
    seed: 7,
    jitter: U * 0.006,
  });

  // The nearer coastal shoulder that closes the bay on the right.
  const ridgeNear = profileRidge({
    width,
    height,
    baseline: horizon + 12,
    points: [
      [0, 0.055 * U],
      [0.14, 0.075 * U],
      [0.3, 0.045 * U],
      [0.5, 0.028 * U],
      [0.68, 0.038 * U],
      [0.84, 0.075 * U],
      [1, 0.105 * U],
    ],
    seed: 41,
    jitter: U * 0.004,
  });

  // The fort is planted on the true crest of the massif.
  const fortT = 0.185;
  const fortX = width * fortT;
  const fortY = ridgeFar.at(fortT) + height * 0.014;
  const fortScale = Math.max(0.34, (width / 1800) * 0.6);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      ${sky.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}
    </linearGradient>
    <radialGradient id="sun" cx="${round(sunX / width * 100)}%" cy="${round((horizon / height) * 100)}%" r="42%">
      <stop offset="0%" stop-color="${night ? "#2C3A55" : "#FFD9A3"}" stop-opacity="${night ? 0.5 : 0.95}"/>
      <stop offset="22%" stop-color="${night ? "#1B2436" : "#C98C4B"}" stop-opacity="${night ? 0.34 : 0.55}"/>
      <stop offset="60%" stop-color="${night ? "#0B0F18" : "#4A3222"}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${night ? "#0A0E16" : "#221C18"}"/>
      <stop offset="45%" stop-color="${night ? "#070A11" : "#100E0D"}"/>
      <stop offset="100%" stop-color="#040507"/>
    </linearGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${night ? "#5C7196" : "#E0B183"}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${night ? "#5C7196" : "#E0B183"}" stop-opacity="${night ? 0.14 : 0.26}"/>
    </linearGradient>
    <radialGradient id="vig" cx="50%" cy="46%" r="76%">
      <stop offset="45%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.72"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${round(height * 0.012)}"/>
    </filter>
    <filter id="softer" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${round(height * 0.03)}"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#sky)"/>
  <rect width="${width}" height="${height}" fill="url(#sun)"/>

  <!-- atmospheric haze sitting on the horizon -->
  <rect x="0" y="${round(horizon - height * 0.16)}" width="${width}" height="${round(height * 0.16)}" fill="url(#haze)"/>

  <!-- far ridge: Djebel Murdjadjo, crowned by the fort of Santa Cruz -->
  <g opacity="0.97"><path d="${ridgeFar.d}" fill="${night ? "#0A0D14" : "#0E0F14"}"/></g>
  <g filter="url(#soft)" opacity="${night ? 0.5 : 0.75}">
    ${santaCruz({ x: fortX, y: fortY, scale: fortScale * 1.08, fill: night ? "#5D779E" : "#E8B77A" })}
  </g>
  ${santaCruz({ x: fortX, y: fortY, scale: fortScale, fill: night ? "#05070C" : "#07080C" })}

  <!-- near headland -->
  <g opacity="0.98"><path d="${ridgeNear.d}" fill="#06070B"/></g>

  <!-- the city on the shore -->
  <g>${city}</g>
  <g filter="url(#soft)" opacity="${night ? 0.85 : 0.7}">${lights}</g>
  <g>${windows}</g>
  <rect x="0" y="${round(shore)}" width="${width}" height="1.6" fill="#E8C79A" opacity="${night ? 0.16 : 0.22}"/>

  <!-- the bay -->
  <rect x="0" y="${round(horizon + 8)}" width="${width}" height="${round(height - horizon)}" fill="url(#sea)"/>
  <g>${glints}</g>
  <ellipse cx="${round(sunX)}" cy="${round(horizon + 10)}" rx="${round(width * 0.16)}" ry="${round(
    height * 0.05,
  )}" fill="${night ? "#39506F" : "#D9A461"}" opacity="${night ? 0.12 : 0.2}" filter="url(#softer)"/>

  <!-- foreground rock -->
  <path d="M 0 ${height} L 0 ${round(height * 0.86)} C ${round(width * 0.12)} ${round(
    height * 0.8,
  )} ${round(width * 0.2)} ${round(height * 0.95)} ${round(width * 0.34)} ${height} Z" fill="#030405"/>

  <rect width="${width}" height="${height}" fill="url(#vig)"/>
</svg>`;
}

/* -------------------------------------------------------- project artwork */

const PROJECT_ART = [
  {
    file: "work-01-restaurant.jpg",
    seed: 11,
    palette: { bg: "#0B0705", a: "#C08A4E", b: "#F2E4CE", c: "#2A1A10" },
    motif: "arcs",
  },
  {
    file: "work-02-coffee.jpg",
    seed: 23,
    palette: { bg: "#080607", a: "#B4794C", b: "#E8DACB", c: "#241812" },
    motif: "rings",
  },
  {
    file: "work-03-agency.jpg",
    seed: 37,
    palette: { bg: "#050506", a: "#EFEBE4", b: "#8A8F98", c: "#141518" },
    motif: "grid",
  },
  {
    file: "work-04-business.jpg",
    seed: 53,
    palette: { bg: "#050609", a: "#7E93B4", b: "#E4E9F1", c: "#101520" },
    motif: "towers",
  },
];

function projectArt({ width, height, seed, palette, motif }) {
  const rand = rng(seed);
  const { bg, a, b, c } = palette;

  // Blurred light behind everything, so the frame has depth without mush.
  let soft = "";
  for (let i = 0; i < 3; i++) {
    soft += `<circle cx="${round(width * (0.15 + rand() * 0.7))}" cy="${round(
      height * (0.15 + rand() * 0.7),
    )}" r="${round(width * (0.16 + rand() * 0.2))}" fill="${i === 0 ? a : b}" opacity="${round(
      0.05 + rand() * 0.09,
    )}"/>`;
  }

  let shapes = "";

  if (motif === "arcs") {
    // Luxury restaurant: concentric arches, candle-lit.
    for (let i = 0; i < 6; i++) {
      const r = width * (0.16 + i * 0.1);
      shapes += `<path d="M ${round(width * 0.5 - r)} ${round(height * 0.92)} a ${round(r)} ${round(
        r * 1.12,
      )} 0 0 1 ${round(r * 2)} 0" fill="none" stroke="${a}" stroke-opacity="${round(
        0.55 - i * 0.075,
      )}" stroke-width="${round(1.2 + i * 0.35)}"/>`;
    }
    shapes += `<path d="M ${round(width * 0.34)} ${round(height * 0.92)} a ${round(width * 0.16)} ${round(
      width * 0.18,
    )} 0 0 1 ${round(width * 0.32)} 0 Z" fill="${a}" fill-opacity="0.1"/>`;
    shapes += `<line x1="0" y1="${round(height * 0.92)}" x2="${width}" y2="${round(
      height * 0.92,
    )}" stroke="${b}" stroke-opacity="0.35" stroke-width="1.4"/>`;
  } else if (motif === "rings") {
    // Coffee: cup rings on a table, one filled.
    const spots = [
      [0.3, 0.36, 0.15],
      [0.63, 0.3, 0.1],
      [0.5, 0.66, 0.19],
      [0.82, 0.62, 0.08],
      [0.16, 0.72, 0.07],
    ];
    spots.forEach(([x, y, r], i) => {
      shapes += `<circle cx="${round(width * x)}" cy="${round(height * y)}" r="${round(
        width * r,
      )}" fill="none" stroke="${i % 2 ? b : a}" stroke-opacity="${round(0.22 + (i % 3) * 0.14)}" stroke-width="${
        i === 2 ? 2.6 : 1.4
      }"/>`;
      if (i === 2) {
        shapes += `<circle cx="${round(width * x)}" cy="${round(height * y)}" r="${round(
          width * r * 0.72,
        )}" fill="${a}" fill-opacity="0.12"/>`;
      }
    });
    // rising steam
    for (let i = 0; i < 3; i++) {
      const x = width * (0.44 + i * 0.06);
      shapes += `<path d="M ${round(x)} ${round(height * 0.5)} C ${round(x - width * 0.03)} ${round(
        height * 0.38,
      )} ${round(x + width * 0.03)} ${round(height * 0.3)} ${round(x)} ${round(
        height * 0.16,
      )}" fill="none" stroke="${b}" stroke-opacity="0.16" stroke-width="1.2"/>`;
    }
  } else if (motif === "grid") {
    // Creative agency: a hard editorial grid with a few solid cells.
    const cols = 8;
    const rows = 5;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (rand() > 0.78) {
          shapes += `<rect x="${round((x / cols) * width)}" y="${round((y / rows) * height)}" width="${round(
            width / cols,
          )}" height="${round(height / rows)}" fill="${a}" fill-opacity="${round(0.06 + rand() * 0.12)}"/>`;
        }
      }
    }
    for (let x = 1; x < cols; x++) {
      shapes += `<line x1="${round((x / cols) * width)}" y1="0" x2="${round(
        (x / cols) * width,
      )}" y2="${height}" stroke="${b}" stroke-opacity="0.13" stroke-width="1"/>`;
    }
    for (let y = 1; y < rows; y++) {
      shapes += `<line x1="0" y1="${round((y / rows) * height)}" x2="${width}" y2="${round(
        (y / rows) * height,
      )}" stroke="${b}" stroke-opacity="0.08" stroke-width="1"/>`;
    }
    shapes += `<rect x="${round(width * 0.25)}" y="${round(height * 0.2)}" width="${round(
      width * 0.5,
    )}" height="${round(height * 0.6)}" fill="none" stroke="${a}" stroke-opacity="0.55" stroke-width="2"/>`;
    shapes += `<line x1="${round(width * 0.25)}" y1="${round(height * 0.8)}" x2="${round(
      width * 0.75,
    )}" y2="${round(height * 0.2)}" stroke="${a}" stroke-opacity="0.2" stroke-width="1.5"/>`;
  } else {
    // Business: an architectural skyline of lit floors.
    let x = width * 0.06;
    while (x < width * 0.96) {
      const w = width * (0.045 + rand() * 0.075);
      const h = height * (0.2 + rand() * 0.62);
      shapes += `<rect x="${round(x)}" y="${round(height - h)}" width="${round(w)}" height="${round(
        h,
      )}" fill="${c}" fill-opacity="0.95" stroke="${a}" stroke-opacity="0.2" stroke-width="1"/>`;
      const floors = Math.floor(h / (height * 0.055));
      for (let f = 0; f < floors; f++) {
        shapes += `<rect x="${round(x + w * 0.16)}" y="${round(
          height - h + f * height * 0.055 + height * 0.018,
        )}" width="${round(w * 0.68)}" height="${round(height * 0.012)}" fill="${a}" fill-opacity="${round(
          0.12 + rand() * 0.42,
        )}"/>`;
      }
      x += w + width * 0.018;
    }
    shapes += `<line x1="0" y1="${round(height * 0.999)}" x2="${width}" y2="${round(
      height * 0.999,
    )}" stroke="${a}" stroke-opacity="0.4" stroke-width="2"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="55%" stop-color="${c}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${bg}"/>
    </linearGradient>
    <radialGradient id="glow" cx="74%" cy="18%" r="66%">
      <stop offset="0%" stop-color="${a}" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="pv" cx="50%" cy="50%" r="74%">
      <stop offset="42%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.66"/>
    </radialGradient>
    <filter id="pb" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${round(width * 0.05)}"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#pg)"/>
  <g filter="url(#pb)">${soft}</g>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <g>${shapes}</g>
  <rect width="${width}" height="${height}" fill="url(#pv)"/>
</svg>`;
}

/* -------------------------------------------------------------- og image */

function ogImage({ width, height }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="og" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050505"/>
      <stop offset="55%" stop-color="#0C0D10"/>
      <stop offset="100%" stop-color="#050505"/>
    </linearGradient>
    <radialGradient id="ogg" cx="76%" cy="16%" r="66%">
      <stop offset="0%" stop-color="#C8A27A" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#C8A27A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#og)"/>
  <rect width="${width}" height="${height}" fill="url(#ogg)"/>
  <g stroke="#EFEBE4" stroke-opacity="0.07">
    ${Array.from({ length: 12 }, (_, i) => `<line x1="${round(((i + 1) / 13) * width)}" y1="0" x2="${round(((i + 1) / 13) * width)}" y2="${height}"/>`).join("")}
  </g>
  <text x="80" y="${round(height * 0.52)}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="146" font-weight="800" letter-spacing="-4" fill="#EFEBE4">MSDEV</text>
  <text x="86" y="${round(height * 0.63)}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="30" letter-spacing="7" fill="#8A8F98">PREMIUM WEB DEVELOPMENT</text>
  <text x="86" y="${round(height * 0.71)}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="30" letter-spacing="7" fill="#C8A27A">DIGITAL EXPERIENCES · ORAN, DZ</text>
  <rect x="80" y="${round(height * 0.76)}" width="180" height="2" fill="#C8A27A"/>
</svg>`;
}

/* ---------------------------------------------------------------- favicon */

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#050505"/>
  <path d="M13 45V19h6.4l8.1 15.2L35.6 19H42v26h-6V30.6l-6.2 11.6h-4.6L19 30.6V45z" fill="#EFEBE4"/>
  <circle cx="48" cy="20" r="4" fill="#C8A27A"/>
</svg>`;

/* -------------------------------------------------------------------- run */

async function toJpeg(svg, out, quality = 84) {
  await sharp(Buffer.from(svg)).jpeg({ quality, mozjpeg: true, progressive: true }).toFile(out);
  console.log("  ✓", path.relative(ROOT, out));
}

async function main() {
  await mkdir(MEDIA, { recursive: true });
  console.log("MSDEV assets →");

  // The hero's own footage of Santa Cruz replaced the generated still; only the
  // night backdrop behind it is still drawn here.
  await toJpeg(oranBay({ width: 1920, height: 1200, night: true }), path.join(MEDIA, "oran-night.jpg"), 82);

  for (const p of PROJECT_ART) {
    await toJpeg(projectArt({ width: 1400, height: 1000, ...p }), path.join(MEDIA, p.file), 82);
  }

  await toJpeg(ogImage({ width: 1200, height: 630 }), path.join(MEDIA, "og.jpg"), 88);

  await writeFile(path.join(APP, "icon.svg"), FAVICON, "utf8");
  console.log("  ✓", path.relative(ROOT, path.join(APP, "icon.svg")));

  await sharp(Buffer.from(FAVICON)).resize(180, 180).png().toFile(path.join(APP, "apple-icon.png"));
  console.log("  ✓", path.relative(ROOT, path.join(APP, "apple-icon.png")));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
