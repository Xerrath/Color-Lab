// Color math used by every page: conversions, harmonies, contrast, names, and color blindness

// ---------- Conversions ----------

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// "#4ecdc4", "4ECDC4", or "#4cc" -> { r, g, b } or null if it isn't a valid hex
function hexToRgb(hex) {
  let clean = String(hex).trim().replace("#", "");
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return null;
  }
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex(rgb) {
  function part(value) {
    return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  }
  return ("#" + part(rgb.r) + part(rgb.g) + part(rgb.b)).toUpperCase();
}

// Hue / saturation / lightness math. Used behind the scenes for the color wheel, harmonies, and
// variations. Students never see hsl() codes: every result is shown as hex or rgb.
// h: 0 to 360, s and l: 0 to 100
function rgbToHsl(rgb) {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const difference = max - min;
    saturation = lightness > 0.5 ? difference / (2 - max - min) : difference / (max + min);
    if (max === r) {
      hue = (g - b) / difference + (g < b ? 6 : 0);
    } else if (max === g) {
      hue = (b - r) / difference + 2;
    } else {
      hue = (r - g) / difference + 4;
    }
    hue = hue * 60;
  }

  return { h: hue, s: saturation * 100, l: lightness * 100 };
}

function hslToRgb(hsl) {
  const h = (((hsl.h % 360) + 360) % 360) / 360;
  const s = clamp(hsl.s, 0, 100) / 100;
  const l = clamp(hsl.l, 0, 100) / 100;

  if (s === 0) {
    return { r: l * 255, g: l * 255, b: l * 255 };
  }

  function hueToChannel(p, q, t) {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hueToChannel(p, q, h + 1 / 3) * 255,
    g: hueToChannel(p, q, h) * 255,
    b: hueToChannel(p, q, h - 1 / 3) * 255
  };
}

function hslToHex(hsl) {
  return rgbToHex(hslToRgb(hsl));
}

function hexToHsl(hex) {
  return rgbToHsl(hexToRgb(hex));
}

// ---------- Formatting (students only ever see hex, rgb, and rgba) ----------

function formatRgb(rgb) {
  return "rgb(" + Math.round(rgb.r) + ", " + Math.round(rgb.g) + ", " + Math.round(rgb.b) + ")";
}

// alpha: 0 (invisible) to 1 (solid)
function formatRgba(rgb, alpha) {
  let alphaText = String(Math.round(alpha * 100) / 100);
  if (alpha === 1) {
    alphaText = "1";
  }
  return "rgba(" + Math.round(rgb.r) + ", " + Math.round(rgb.g) + ", " + Math.round(rgb.b) + ", " + alphaText + ")";
}

// ---------- Mixing and variations ----------

function mixHex(hexA, hexB, amount) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount
  });
}

// Shades add black, tints add white, tones add gray
function makeScale(hex, target, steps) {
  const list = [];
  for (let index = 0; index < steps; index++) {
    list.push(mixHex(hex, target, index / (steps - 1)));
  }
  return list;
}

function shadesOf(hex, steps) {
  return makeScale(hex, "#000000", steps || 11);
}

function tintsOf(hex, steps) {
  return makeScale(hex, "#FFFFFF", steps || 11);
}

function tonesOf(hex, steps) {
  return makeScale(hex, "#808080", steps || 11);
}

// Same saturation and lightness, hue walks around the wheel
function huesOf(hex, steps) {
  const hsl = hexToHsl(hex);
  const count = steps || 12;
  const list = [];
  for (let index = 0; index < count; index++) {
    list.push(hslToHex({ h: hsl.h + (360 / count) * index, s: hsl.s, l: hsl.l }));
  }
  return list;
}

// ---------- Harmonies ----------

const harmonies = [
  { id: "complementary", name: "Complementary", offsets: [0, 180], about: "Two colors straight across the wheel from each other. High contrast and lots of energy." },
  { id: "analogous", name: "Analogous", offsets: [-30, 0, 30], about: "Neighbors on the wheel. Calm and natural, like a sunset or a forest." },
  { id: "triadic", name: "Triadic", offsets: [0, 120, 240], about: "Three colors evenly spaced, like a triangle. Bright and balanced." },
  { id: "split", name: "Split Complementary", offsets: [0, 150, 210], about: "One color plus the two neighbors of its complement. Strong contrast, less harsh." },
  { id: "square", name: "Square", offsets: [0, 90, 180, 270], about: "Four colors evenly spaced. Rich, but let one color lead." },
  { id: "monochromatic", name: "Monochromatic", offsets: [0, 0, 0, 0, 0], about: "One hue in different lightness levels. Clean and safe." }
];

function findHarmony(id) {
  for (let index = 0; index < harmonies.length; index++) {
    if (harmonies[index].id === id) {
      return harmonies[index];
    }
  }
  return harmonies[0];
}

// Returns an array of hex colors for a harmony built from one base color
function harmonyColors(baseHex, harmonyId) {
  const base = hexToHsl(baseHex);
  const harmony = findHarmony(harmonyId);
  const list = [];

  if (harmony.id === "monochromatic") {
    const levels = [base.l, clamp(base.l - 30, 8, 92), clamp(base.l - 15, 8, 92), clamp(base.l + 15, 8, 92), clamp(base.l + 30, 8, 92)];
    for (let index = 0; index < levels.length; index++) {
      list.push(hslToHex({ h: base.h, s: base.s, l: levels[index] }));
    }
    return list;
  }

  for (let index = 0; index < harmony.offsets.length; index++) {
    list.push(hslToHex({ h: base.h + harmony.offsets[index], s: base.s, l: base.l }));
  }
  return list;
}

// ---------- Contrast (WCAG) ----------

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  function channel(value) {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrastRatio(hexA, hexB) {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

// Black or white, whichever is easier to read on this background
function readableTextColor(backgroundHex) {
  if (contrastRatio(backgroundHex, "#000000") >= contrastRatio(backgroundHex, "#FFFFFF")) {
    return "#111111";
  }
  return "#FFFFFF";
}

function contrastGrades(ratio) {
  return {
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5
  };
}

// ---------- Color blindness simulation ----------
// Simulation matrices (Machado et al. 2009, full severity), applied in linear RGB

const visionTypes = [
  { id: "normal", name: "Normal vision", about: "How most people see it.", matrix: null },
  { id: "protanopia", name: "Protanopia", about: "Red-blind. About 1 in 100 males.", matrix: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]] },
  { id: "deuteranopia", name: "Deuteranopia", about: "Green-blind. The most common type, about 1 in 100 males.", matrix: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]] },
  { id: "tritanopia", name: "Tritanopia", about: "Blue-blind. Very rare.", matrix: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]] },
  { id: "achromatopsia", name: "Achromatopsia", about: "No color at all, only light and dark. Very rare.", matrix: "gray" }
];

function simulateVision(hex, typeId) {
  let type = visionTypes[0];
  for (let index = 0; index < visionTypes.length; index++) {
    if (visionTypes[index].id === typeId) {
      type = visionTypes[index];
    }
  }
  if (!type.matrix) {
    return hex.toUpperCase();
  }

  const rgb = hexToRgb(hex);
  function toLinear(value) {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function toSrgb(value) {
    const c = clamp(value, 0, 1);
    const encoded = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return encoded * 255;
  }

  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);

  if (type.matrix === "gray") {
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return rgbToHex({ r: toSrgb(y), g: toSrgb(y), b: toSrgb(y) });
  }

  const m = type.matrix;
  return rgbToHex({
    r: toSrgb(m[0][0] * r + m[0][1] * g + m[0][2] * b),
    g: toSrgb(m[1][0] * r + m[1][1] * g + m[1][2] * b),
    b: toSrgb(m[2][0] * r + m[2][1] * g + m[2][2] * b)
  });
}

// ---------- Warm or cool ----------

function temperatureOf(hex) {
  const hsl = hexToHsl(hex);
  if (hsl.s < 12) {
    return "Neutral";
  }
  if (hsl.h < 75 || hsl.h >= 315) {
    return "Warm";
  }
  return "Cool";
}

// ---------- Random colors that look good ----------

function randomColor() {
  return hslToHex({
    h: Math.random() * 360,
    s: 45 + Math.random() * 45,
    l: 30 + Math.random() * 45
  });
}

// ---------- Names ----------
// The 148 named CSS colors. The closest one gives a friendly name to any color.

const namedColors = {
  AliceBlue: "#F0F8FF", AntiqueWhite: "#FAEBD7", Aqua: "#00FFFF", Aquamarine: "#7FFFD4", Azure: "#F0FFFF", Beige: "#F5F5DC",
  Bisque: "#FFE4C4", Black: "#000000", BlanchedAlmond: "#FFEBCD", Blue: "#0000FF", BlueViolet: "#8A2BE2", Brown: "#A52A2A",
  BurlyWood: "#DEB887", CadetBlue: "#5F9EA0", Chartreuse: "#7FFF00", Chocolate: "#D2691E", Coral: "#FF7F50", CornflowerBlue: "#6495ED",
  Cornsilk: "#FFF8DC", Crimson: "#DC143C", DarkBlue: "#00008B", DarkCyan: "#008B8B", DarkGoldenrod: "#B8860B", DarkGray: "#A9A9A9",
  DarkGreen: "#006400", DarkKhaki: "#BDB76B", DarkMagenta: "#8B008B", DarkOliveGreen: "#556B2F", DarkOrange: "#FF8C00", DarkOrchid: "#9932CC",
  DarkRed: "#8B0000", DarkSalmon: "#E9967A", DarkSeaGreen: "#8FBC8F", DarkSlateBlue: "#483D8B", DarkSlateGray: "#2F4F4F", DarkTurquoise: "#00CED1",
  DarkViolet: "#9400D3", DeepPink: "#FF1493", DeepSkyBlue: "#00BFFF", DimGray: "#696969", DodgerBlue: "#1E90FF", FireBrick: "#B22222",
  FloralWhite: "#FFFAF0", ForestGreen: "#228B22", Fuchsia: "#FF00FF", Gainsboro: "#DCDCDC", GhostWhite: "#F8F8FF", Gold: "#FFD700",
  Goldenrod: "#DAA520", Gray: "#808080", Green: "#008000", GreenYellow: "#ADFF2F", Honeydew: "#F0FFF0", HotPink: "#FF69B4",
  IndianRed: "#CD5C5C", Indigo: "#4B0082", Ivory: "#FFFFF0", Khaki: "#F0E68C", Lavender: "#E6E6FA", LavenderBlush: "#FFF0F5",
  LawnGreen: "#7CFC00", LemonChiffon: "#FFFACD", LightBlue: "#ADD8E6", LightCoral: "#F08080", LightCyan: "#E0FFFF", LightGoldenrodYellow: "#FAFAD2",
  LightGray: "#D3D3D3", LightGreen: "#90EE90", LightPink: "#FFB6C1", LightSalmon: "#FFA07A", LightSeaGreen: "#20B2AA", LightSkyBlue: "#87CEFA",
  LightSlateGray: "#778899", LightSteelBlue: "#B0C4DE", LightYellow: "#FFFFE0", Lime: "#00FF00", LimeGreen: "#32CD32", Linen: "#FAF0E6",
  Maroon: "#800000", MediumAquamarine: "#66CDAA", MediumBlue: "#0000CD", MediumOrchid: "#BA55D3", MediumPurple: "#9370DB", MediumSeaGreen: "#3CB371",
  MediumSlateBlue: "#7B68EE", MediumSpringGreen: "#00FA9A", MediumTurquoise: "#48D1CC", MediumVioletRed: "#C71585", MidnightBlue: "#191970", MintCream: "#F5FFFA",
  MistyRose: "#FFE4E1", Moccasin: "#FFE4B5", NavajoWhite: "#FFDEAD", Navy: "#000080", OldLace: "#FDF5E6", Olive: "#808000",
  OliveDrab: "#6B8E23", Orange: "#FFA500", OrangeRed: "#FF4500", Orchid: "#DA70D6", PaleGoldenrod: "#EEE8AA", PaleGreen: "#98FB98",
  PaleTurquoise: "#AFEEEE", PaleVioletRed: "#DB7093", PapayaWhip: "#FFEFD5", PeachPuff: "#FFDAB9", Peru: "#CD853F", Pink: "#FFC0CB",
  Plum: "#DDA0DD", PowderBlue: "#B0E0E6", Purple: "#800080", RebeccaPurple: "#663399", Red: "#FF0000", RosyBrown: "#BC8F8F",
  RoyalBlue: "#4169E1", SaddleBrown: "#8B4513", Salmon: "#FA8072", SandyBrown: "#F4A460", SeaGreen: "#2E8B57", Seashell: "#FFF5EE",
  Sienna: "#A0522D", Silver: "#C0C0C0", SkyBlue: "#87CEEB", SlateBlue: "#6A5ACD", SlateGray: "#708090", Snow: "#FFFAFA",
  SpringGreen: "#00FF7F", SteelBlue: "#4682B4", Tan: "#D2B48C", Teal: "#008080", Thistle: "#D8BFD8", Tomato: "#FF6347",
  Turquoise: "#40E0D0", Violet: "#EE82EE", Wheat: "#F5DEB3", White: "#FFFFFF", WhiteSmoke: "#F5F5F5", Yellow: "#FFFF00",
  YellowGreen: "#9ACD32"
};

// "DarkSlateGray" -> "Dark Slate Gray"
function spacedName(name) {
  return name.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function nearestColorName(hex) {
  const target = hexToRgb(hex);
  let bestName = "Black";
  let bestDistance = Infinity;
  for (const name in namedColors) {
    const rgb = hexToRgb(namedColors[name]);
    // Weighted distance: eyes are most sensitive to green, least to blue
    const distance = 2 * Math.pow(rgb.r - target.r, 2) + 4 * Math.pow(rgb.g - target.g, 2) + 3 * Math.pow(rgb.b - target.b, 2);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestName = name;
    }
  }
  return spacedName(bestName);
}
