import { writeFileSync } from 'node:fs';

const output = process.argv[2] ?? 'docs/media/agent-studio-demo.gif';
const width = 800;
const height = 420;
const steps = ['PLANNER', 'TOOL', 'KNOWLEDGE', 'MEMORY', 'REFLECT', 'EVAL', 'ANSWER'];

const palette = [
  [15, 23, 42],
  [30, 41, 59],
  [51, 65, 85],
  [148, 163, 184],
  [226, 232, 240],
  [248, 250, 252],
  [37, 99, 235],
  [59, 130, 246],
  [16, 185, 129],
  [239, 68, 68],
  [245, 158, 11],
  [124, 58, 237],
  [2, 132, 199],
  [20, 184, 166],
  [255, 255, 255],
  [96, 165, 250],
];

while (palette.length < 256) palette.push([0, 0, 0]);

const glyphs = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '>': ['10000', '01000', '00100', '00010', '00100', '01000', '10000'],
};

function frame(active) {
  const pixels = new Uint8Array(width * height).fill(0);
  rect(pixels, 0, 0, width, height, 0);
  rect(pixels, 28, 24, width - 56, 56, 1);
  text(pixels, 48, 42, 'AGENT STUDIO RUNTIME DEMO', 14, 2);
  text(pixels, 48, 64, 'PLANNING  EXECUTION  OBSERVATION  EVALUATION', 4, 1);
  text(pixels, 600, 42, 'LIVE SSE', 8, 2);

  const startX = 68;
  const gap = 100;
  const y = 160;
  for (let i = 0; i < steps.length; i += 1) {
    const x = startX + i * gap;
    if (i > 0) {
      const color = i <= active ? 8 : 2;
      line(pixels, startX + (i - 1) * gap + 54, y + 34, x - 14, y + 34, color);
    }
    const isActive = i === active;
    const isDone = i < active;
    const color = isActive ? 7 : isDone ? 8 : 2;
    if (isActive) {
      rect(pixels, x - 8, y - 8, 76, 84, 15);
      rect(pixels, x - 6, y - 6, 72, 80, 6);
    }
    rect(pixels, x, y, 60, 60, color);
    rect(pixels, x + 4, y + 4, 52, 52, isActive ? 6 : isDone ? 8 : 1);
    text(pixels, x + 17, y + 22, steps[i].slice(0, 2), 14, 3);
    text(pixels, x - 12, y + 76, steps[i], isActive ? 14 : 4, 1);
  }

  rect(pixels, 44, 292, 712, 78, 1);
  const summary = [
    'USER GOAL: EAST CHINA SALES DECLINE',
    `CURRENT: ${steps[active]}`,
    active < steps.length - 1 ? 'GRAPH + TIMELINE + INSPECTOR SYNC' : 'FINAL ANSWER READY',
  ];
  summary.forEach((lineText, index) => text(pixels, 68, 316 + index * 20, lineText, index === 1 ? 7 : 4, 1));
  return pixels;
}

function rect(pixels, x, y, w, h, color) {
  for (let row = Math.max(0, y); row < Math.min(height, y + h); row += 1) {
    for (let col = Math.max(0, x); col < Math.min(width, x + w); col += 1) {
      pixels[row * width + col] = color;
    }
  }
}

function line(pixels, x1, y1, x2, y2, color) {
  const dx = Math.abs(x2 - x1);
  const sx = x1 < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y1);
  const sy = y1 < y2 ? 1 : -1;
  let error = dx + dy;
  let x = x1;
  let y = y1;
  while (true) {
    rect(pixels, x, y, 2, 2, color);
    if (x === x2 && y === y2) break;
    const e2 = 2 * error;
    if (e2 >= dy) {
      error += dy;
      x += sx;
    }
    if (e2 <= dx) {
      error += dx;
      y += sy;
    }
  }
}

function text(pixels, x, y, value, color, scale = 1) {
  let cursor = x;
  for (const char of value.toUpperCase()) {
    const glyph = glyphs[char] ?? glyphs[' '];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] === '1') rect(pixels, cursor + col * scale, y + row * scale, scale, scale, color);
      }
    }
    cursor += 6 * scale;
  }
}

function word(value, bytes = 2) {
  const result = [];
  for (let i = 0; i < bytes; i += 1) result.push((value >> (8 * i)) & 255);
  return result;
}

class BitWriter {
  constructor() {
    this.bytes = [];
    this.buffer = 0;
    this.bits = 0;
  }
  write(code, size) {
    this.buffer |= code << this.bits;
    this.bits += size;
    while (this.bits >= 8) {
      this.bytes.push(this.buffer & 255);
      this.buffer >>= 8;
      this.bits -= 8;
    }
  }
  finish() {
    if (this.bits > 0) this.bytes.push(this.buffer & 255);
    return this.bytes;
  }
}

function lzw(indices) {
  const writer = new BitWriter();
  const clear = 256;
  const end = 257;
  let emittedSinceClear = 0;
  writer.write(clear, 9);
  for (const index of indices) {
    if (emittedSinceClear >= 240) {
      writer.write(clear, 9);
      emittedSinceClear = 0;
    }
    writer.write(index, 9);
    emittedSinceClear += 1;
  }
  writer.write(end, 9);
  return writer.finish();
}

function subBlocks(data) {
  const blocks = [];
  for (let i = 0; i < data.length; i += 255) {
    const chunk = data.slice(i, i + 255);
    blocks.push(chunk.length, ...chunk);
  }
  blocks.push(0);
  return blocks;
}

function append(target, values) {
  for (const value of values) target.push(value);
}

const bytes = [];
append(bytes, Buffer.from('GIF89a', 'ascii'));
append(bytes, [...word(width), ...word(height), 0xf7, 0, 0]);
for (const [r, g, b] of palette) bytes.push(r, g, b);
append(bytes, [0x21, 0xff, 0x0b, ...Buffer.from('NETSCAPE2.0', 'ascii'), 0x03, 0x01, 0x00, 0x00, 0x00]);

for (let active = 0; active < steps.length; active += 1) {
  append(bytes, [0x21, 0xf9, 0x04, 0x00, ...word(110), 0x00, 0x00]);
  append(bytes, [0x2c, ...word(0), ...word(0), ...word(width), ...word(height), 0x00]);
  bytes.push(0x08);
  append(bytes, subBlocks(lzw(frame(active))));
}
bytes.push(0x3b);

writeFileSync(output, Buffer.from(bytes));
console.log(`Generated ${output}`);
