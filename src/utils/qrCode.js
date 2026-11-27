/**
 * Lightweight, zero-dependency client-side QR Code SVG generator.
 * Supports Byte mode, Error Correction Level L, Versions 1–6 (up to 134 bytes).
 * Produces a `data:image/svg+xml` URI compatible with strict CSP (`img-src 'self' data: blob:`).
 */

const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
(() => {
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v <<= 1;
    if (v & 0x100) v ^= 0x11d;
  }
  EXP[255] = EXP[0];
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[(LOG[a] + LOG[b]) % 255];
}

function rsGeneratorPoly(ecCount) {
  let poly = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsRemainder(data, ecCount) {
  const gen = rsGeneratorPoly(ecCount);
  const res = new Uint8Array(data.length + ecCount);
  res.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

// Versions 1-6 (Error Correction Level L)
const VERSIONS = [
  { version: 1, size: 21, dataCodewords: 19, blocks: 1, ecPerBlock: 7, align: [] },
  { version: 2, size: 25, dataCodewords: 34, blocks: 1, ecPerBlock: 10, align: [6, 18] },
  { version: 3, size: 29, dataCodewords: 55, blocks: 1, ecPerBlock: 15, align: [6, 22] },
  { version: 4, size: 33, dataCodewords: 80, blocks: 1, ecPerBlock: 20, align: [6, 26] },
  { version: 5, size: 37, dataCodewords: 108, blocks: 1, ecPerBlock: 26, align: [6, 30] },
  { version: 6, size: 41, dataCodewords: 136, blocks: 2, ecPerBlock: 18, align: [6, 34] }
];

function encodeBytes(text) {
  if (typeof TextEncoder !== 'undefined') {
    return Array.from(new TextEncoder().encode(text));
  }
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    bytes.push(text.charCodeAt(i) & 0xff);
  }
  return bytes;
}

function buildCodewords(bytes, spec) {
  const bits = [];
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };

  // Mode: Byte (0100), Length: 8 bits (for versions 1-9)
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);

  const maxBits = spec.dataCodewords * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    data.push(byte);
  }

  let padIdx = 0;
  while (data.length < spec.dataCodewords) {
    data.push(padIdx % 2 === 0 ? 0xec : 0x11);
    padIdx++;
  }

  const blockSize = spec.dataCodewords / spec.blocks;
  const dataBlocks = [];
  const ecBlocks = [];
  for (let b = 0; b < spec.blocks; b++) {
    const slice = data.slice(b * blockSize, (b + 1) * blockSize);
    dataBlocks.push(slice);
    ecBlocks.push(Array.from(rsRemainder(slice, spec.ecPerBlock)));
  }

  const finalBytes = [];
  for (let i = 0; i < blockSize; i++) {
    for (let b = 0; b < spec.blocks; b++) finalBytes.push(dataBlocks[b][i]);
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) finalBytes.push(ecBlocks[b][i]);
  }
  return finalBytes;
}

function getFormatBits(maskPattern) {
  const data = (1 << 3) | maskPattern; // EC Level L = 01
  let rem = data << 10;
  const gen = 0x537;
  for (let i = 14; i >= 10; i--) {
    if ((rem >> i) & 1) rem ^= gen << (i - 10);
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function createMatrix(spec) {
  const size = spec.size;
  const modules = Array.from({ length: size }, () => new Array(size).fill(null));
  const isFunc = Array.from({ length: size }, () => new Array(size).fill(false));

  const setFunc = (r, c, val) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = val;
      isFunc[r][c] = true;
    }
  };

  const placeFinder = (top, left) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = top + r;
        const cc = left + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const inBorder = r === -1 || r === 7 || c === -1 || c === 7;
        const inOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        setFunc(rr, cc, !inBorder && (inOuter || inInner));
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  for (const ar of spec.align) {
    for (const ac of spec.align) {
      if (isFunc[ar][ac]) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const val = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
          setFunc(ar + r, ac + c, val);
        }
      }
    }
  }

  // Dark module & reserve format info areas
  setFunc(size - 8, 8, true);
  for (let i = 0; i < 9; i++) {
    if (!isFunc[8][i]) setFunc(8, i, false);
    if (!isFunc[i][8]) setFunc(i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunc[8][size - 1 - i]) setFunc(8, size - 1 - i, false);
    if (!isFunc[size - 1 - i][8]) setFunc(size - 1 - i, 8, false);
  }

  return { modules, isFunc };
}

function applyMaskAndFormat(baseModules, isFunc, codewords, maskPattern) {
  const size = baseModules.length;
  const grid = baseModules.map((row) => [...row]);

  const maskFn = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (_, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
  ][maskPattern];

  // Place data bits in zig-zag order
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const c = right - j;
        const upward = ((right + 1) & 2) === 0;
        const r = upward ? size - 1 - vert : vert;
        if (isFunc[r][c]) continue;
        let bit = false;
        if (bitIdx < totalBits) {
          bit = ((codewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1) === 1;
          bitIdx++;
        }
        grid[r][c] = maskFn(r, c) ? !bit : bit;
      }
    }
  }

  // Write format info
  const fmt = getFormatBits(maskPattern);
  for (let i = 0; i < 15; i++) {
    const bit = ((fmt >> i) & 1) === 1;
    if (i < 6) grid[8][i] = bit;
    else if (i < 8) grid[8][i + 1] = bit;
    else grid[8][size - 15 + i] = bit;

    if (i < 8) grid[size - 1 - i][8] = bit;
    else if (i < 9) grid[15 - i][8] = bit;
    else grid[14 - i][8] = bit;
  }

  return grid;
}

function penaltyScore(grid) {
  const size = grid.length;
  let score = 0;

  // Rule 1: 5+ consecutive same-color modules in row/col
  for (let r = 0; r < size; r++) {
    let runR = 1;
    let runC = 1;
    for (let i = 1; i < size; i++) {
      if (grid[r][i] === grid[r][i - 1]) runR++;
      else {
        if (runR >= 5) score += 3 + (runR - 5);
        runR = 1;
      }
      if (grid[i][r] === grid[i - 1][r]) runC++;
      else {
        if (runC >= 5) score += 3 + (runC - 5);
        runC = 1;
      }
    }
    if (runR >= 5) score += 3 + (runR - 5);
    if (runC >= 5) score += 3 + (runC - 5);
  }

  // Rule 2: 2x2 blocks
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = grid[r][c];
      if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) {
        score += 3;
      }
    }
  }

  return score;
}

/**
 * Generates a scannable QR code as a `data:image/svg+xml` URI.
 */
export function generateQrSvgDataUrl(text, { color = '#059669', background = '#ffffff' } = {}) {
  const bytes = encodeBytes(String(text || ''));
  const spec = VERSIONS.find((v) => bytes.length <= v.dataCodewords - 2) || VERSIONS[VERSIONS.length - 1];
  const clampedBytes = bytes.slice(0, spec.dataCodewords - 2);

  const codewords = buildCodewords(clampedBytes, spec);
  const { modules, isFunc } = createMatrix(spec);

  let bestGrid = null;
  let bestScore = Infinity;
  for (let m = 0; m < 8; m++) {
    const candidate = applyMaskAndFormat(modules, isFunc, codewords, m);
    const s = penaltyScore(candidate);
    if (s < bestScore) {
      bestScore = s;
      bestGrid = candidate;
    }
  }

  const size = spec.size;
  const quiet = 4;
  const total = size + quiet * 2;
  let pathD = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (bestGrid[r][c]) {
        pathD += `M${c + quiet},${r + quiet}h1v1h-1z`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="${background}"/><path d="${pathD}" fill="${color}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
