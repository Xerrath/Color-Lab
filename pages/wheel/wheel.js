// Color Wheel: angle = hue, distance from center = saturation, slider = lightness

const canvas = document.getElementById("wheel-canvas");
const context = canvas.getContext("2d");
const stage = document.getElementById("wheel-stage");
const linesSvg = document.getElementById("wheel-lines");
const handlesBox = document.getElementById("wheel-handles");
const lightnessSlider = document.getElementById("lightness-slider");
const lightnessValue = document.getElementById("lightness-value");
const harmonyButtons = document.getElementById("harmony-buttons");
const baseHexInput = document.getElementById("base-hex");
const basePicker = document.getElementById("base-picker");

const size = canvas.width;
const center = size / 2;
const radius = size / 2 - 4;

let base = { h: 200, s: 75, l: 50 };
let currentHarmony = "complementary";

// Paint every pixel of the wheel for the current lightness
function drawWheel() {
  const image = context.createImageData(size, size);
  const data = image.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const offset = (y * size + x) * 4;

      if (distance > radius) {
        data[offset + 3] = 0;
        continue;
      }

      // 0 degrees (red) at the top, going clockwise
      let hue = Math.atan2(dx, -dy) * (180 / Math.PI);
      if (hue < 0) {
        hue = hue + 360;
      }
      const rgb = hslToRgb({ h: hue, s: (distance / radius) * 100, l: base.l });
      data[offset] = rgb.r;
      data[offset + 1] = rgb.g;
      data[offset + 2] = rgb.b;
      data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
}

// Where a hue / saturation sits on the wheel, in canvas units
function pointFor(hue, saturation) {
  const angle = hue * (Math.PI / 180);
  const distance = (saturation / 100) * radius;
  return { x: center + distance * Math.sin(angle), y: center - distance * Math.cos(angle) };
}

function baseHex() {
  return hslToHex(base);
}

function currentColors() {
  return harmonyColors(baseHex(), currentHarmony);
}

function drawHandles() {
  const colors = currentColors();
  handlesBox.innerHTML = "";
  linesSvg.innerHTML = "";

  const points = [];
  for (let index = 0; index < colors.length; index++) {
    const hsl = hexToHsl(colors[index]);
    let point = pointFor(hsl.h, hsl.s);

    // Monochromatic colors share a hue, so spread them along the same line
    if (currentHarmony === "monochromatic") {
      const spread = [1, 0.35, 0.55, 0.75, 0.9];
      point = pointFor(base.h, base.s * spread[index]);
      if (index === 0) {
        point = pointFor(base.h, base.s);
      }
    }
    points.push(point);
  }

  // Lines from the center to each handle
  for (let index = 0; index < points.length; index++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", center);
    line.setAttribute("y1", center);
    line.setAttribute("x2", points[index].x);
    line.setAttribute("y2", points[index].y);
    line.setAttribute("stroke", "rgba(255,255,255,0.9)");
    line.setAttribute("stroke-width", "2.5");
    linesSvg.appendChild(line);
  }

  // Connect the handles so the shape of the harmony shows (line, triangle, square)
  if (points.length >= 3 && currentHarmony !== "monochromatic" && currentHarmony !== "analogous") {
    const shape = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    let list = "";
    for (let index = 0; index < points.length; index++) {
      list = list + points[index].x + "," + points[index].y + " ";
    }
    shape.setAttribute("points", list.trim());
    shape.setAttribute("fill", "rgba(255,255,255,0.12)");
    shape.setAttribute("stroke", "rgba(255,255,255,0.9)");
    shape.setAttribute("stroke-width", "2");
    shape.setAttribute("stroke-dasharray", "6 5");
    linesSvg.appendChild(shape);
  }

  // Handles are placed in percent so they line up at any wheel size
  for (let index = points.length - 1; index >= 0; index--) {
    const handle = document.createElement("div");
    handle.className = "wheel-handle";
    if (index === 0) {
      handle.classList.add("is-base");
      handle.title = "Drag me";
    }
    handle.style.left = (points[index].x / size) * 100 + "%";
    handle.style.top = (points[index].y / size) * 100 + "%";
    handle.style.background = colors[index];
    handlesBox.appendChild(handle);
  }
}

function updateInfo() {
  const harmony = findHarmony(currentHarmony);
  const hex = baseHex();
  document.getElementById("harmony-name").textContent = harmony.name;
  document.getElementById("harmony-about").textContent = harmony.about;
  buildSwatchRow(document.getElementById("harmony-swatches"), currentColors());
  if (document.activeElement !== baseHexInput) {
    baseHexInput.value = hex;
  }
  basePicker.value = hex.toLowerCase();
  document.getElementById("inspect-link").href = inspectorLink(siteRoot, hex);

  const buttons = harmonyButtons.querySelectorAll(".harmony-button");
  for (let index = 0; index < buttons.length; index++) {
    buttons[index].setAttribute("aria-pressed", String(buttons[index].dataset.harmony === currentHarmony));
  }
}

function refresh(redrawWheel) {
  if (redrawWheel) {
    drawWheel();
  }
  drawHandles();
  updateInfo();
}

// Dragging: convert the pointer position into hue and saturation
function pickFromPointer(event) {
  const box = stage.getBoundingClientRect();
  const x = ((event.clientX - box.left) / box.width) * size;
  const y = ((event.clientY - box.top) / box.height) * size;
  const dx = x - center;
  const dy = y - center;
  let hue = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (hue < 0) {
    hue = hue + 360;
  }
  const distance = Math.min(Math.sqrt(dx * dx + dy * dy), radius);
  base.h = hue;
  base.s = Math.max(5, (distance / radius) * 100);
  refresh(false);
}

let dragging = false;

stage.addEventListener("pointerdown", function (event) {
  dragging = true;
  stage.setPointerCapture(event.pointerId);
  pickFromPointer(event);
});

stage.addEventListener("pointermove", function (event) {
  if (dragging) {
    pickFromPointer(event);
  }
});

stage.addEventListener("pointerup", function () {
  dragging = false;
});

lightnessSlider.addEventListener("input", function () {
  base.l = Number(lightnessSlider.value);
  lightnessValue.textContent = lightnessSlider.value;
  refresh(true);
});

function setBaseFromHex(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return;
  }
  const hsl = rgbToHsl(rgb);
  base = { h: hsl.h, s: Math.max(5, hsl.s), l: clamp(hsl.l, 10, 90) };
  lightnessSlider.value = Math.round(base.l);
  lightnessValue.textContent = Math.round(base.l);
  refresh(true);
}

baseHexInput.addEventListener("input", function () {
  if (hexToRgb(baseHexInput.value)) {
    setBaseFromHex(baseHexInput.value);
  }
});

baseHexInput.addEventListener("blur", function () {
  baseHexInput.value = baseHex();
});

basePicker.addEventListener("input", function () {
  setBaseFromHex(basePicker.value);
});

document.getElementById("use-palette").addEventListener("click", function () {
  savePalette(currentColors());
  showToast("Saved! Open the Generator or Visualizer to use it.");
});

// Harmony buttons
for (let index = 0; index < harmonies.length; index++) {
  const harmony = harmonies[index];
  const button = document.createElement("button");
  button.type = "button";
  button.className = "harmony-button";
  button.dataset.harmony = harmony.id;
  button.textContent = harmony.name;
  button.addEventListener("click", function () {
    currentHarmony = harmony.id;
    refresh(false);
  });
  harmonyButtons.appendChild(button);
}

// Start from the second color of the saved palette
setBaseFromHex(loadPalette()[1]);
