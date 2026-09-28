// Color Basics: RGB builder, artist wheel, warm and cool, color meanings

// ---------- Artist (red, yellow, blue) wheel ----------

const artistColors = [
  { name: "Yellow", hex: "#F9E11E", type: "primary" },
  { name: "Yellow-Orange", hex: "#F9B31E", type: "tertiary" },
  { name: "Orange", hex: "#F58A1F", type: "secondary" },
  { name: "Red-Orange", hex: "#F0612C", type: "tertiary" },
  { name: "Red", hex: "#E63B2E", type: "primary" },
  { name: "Red-Violet", hex: "#B3257A", type: "tertiary" },
  { name: "Violet", hex: "#7B3294", type: "secondary" },
  { name: "Blue-Violet", hex: "#4E3E9E", type: "tertiary" },
  { name: "Blue", hex: "#2E5FB8", type: "primary" },
  { name: "Blue-Green", hex: "#1B9C8E", type: "tertiary" },
  { name: "Green", hex: "#3AA655", type: "secondary" },
  { name: "Yellow-Green", hex: "#A6CE39", type: "tertiary" }
];

const typeInfo = {
  all: { title: "All 12 colors", text: "3 primary, 3 secondary, and 6 tertiary colors. Colors across from each other are complementary. Neighbors are analogous." },
  primary: { title: "Primary colors", text: "Red, yellow, and blue. On the artist's wheel you can't mix these from other colors. Every other color starts with them." },
  secondary: { title: "Secondary colors", text: "Orange, green, and violet. Mix two primaries: red + yellow = orange, yellow + blue = green, blue + red = violet." },
  tertiary: { title: "Tertiary colors", text: "Mix a primary with the secondary next to it. Their names say it: red-orange, yellow-green, blue-violet, and so on." }
};

const svgNamespace = "http://www.w3.org/2000/svg";
const artistWheel = document.getElementById("artist-wheel");

function polar(radius, degrees) {
  const angle = (degrees - 90) * (Math.PI / 180);
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}

function slicePath(inner, outer, start, end) {
  const a = polar(outer, start);
  const b = polar(outer, end);
  const c = polar(inner, end);
  const d = polar(inner, start);
  return "M " + a.x + " " + a.y + " A " + outer + " " + outer + " 0 0 1 " + b.x + " " + b.y + " L " + c.x + " " + c.y + " A " + inner + " " + inner + " 0 0 0 " + d.x + " " + d.y + " Z";
}

function drawArtistWheel() {
  for (let index = 0; index < artistColors.length; index++) {
    const color = artistColors[index];
    const start = index * 30 - 15;
    const end = start + 30;

    const slice = document.createElementNS(svgNamespace, "path");
    slice.setAttribute("d", slicePath(55, 150, start, end));
    slice.setAttribute("fill", color.hex);
    slice.setAttribute("class", "artist-slice");
    slice.dataset.type = color.type;
    slice.setAttribute("tabindex", "0");
    slice.setAttribute("role", "button");
    slice.setAttribute("aria-label", color.name + ", " + color.type);
    slice.addEventListener("click", function () {
      showPicked(color);
    });
    slice.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showPicked(color);
      }
    });
    artistWheel.appendChild(slice);

    // Short labels: P, S, T for the three groups
    const spot = polar(102, index * 30);
    const label = document.createElementNS(svgNamespace, "text");
    label.setAttribute("x", spot.x);
    label.setAttribute("y", spot.y + 4);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "artist-label");
    label.setAttribute("fill", readableTextColor(color.hex));
    label.textContent = color.type === "primary" ? "P" : (color.type === "secondary" ? "S" : "T");
    artistWheel.appendChild(label);
  }

  const middle = document.createElementNS(svgNamespace, "text");
  middle.setAttribute("x", 0);
  middle.setAttribute("y", 5);
  middle.setAttribute("text-anchor", "middle");
  middle.setAttribute("class", "artist-label");
  middle.setAttribute("fill", "#6b7280");
  middle.textContent = "RYB";
  artistWheel.appendChild(middle);
}

function showPicked(color) {
  const picked = document.getElementById("artist-picked");
  const opposite = artistColors[(artistColors.indexOf(color) + 6) % 12];
  picked.textContent = color.name + " is a " + color.type + " color. Its complement (straight across) is " + opposite.name + ".";
  picked.style.background = color.hex;
  picked.style.color = readableTextColor(color.hex);
}

function highlightType(type) {
  const slices = artistWheel.querySelectorAll(".artist-slice");
  for (let index = 0; index < slices.length; index++) {
    const dim = type !== "all" && slices[index].dataset.type !== type;
    slices[index].classList.toggle("is-dim", dim);
  }
  const buttons = document.querySelectorAll(".type-button");
  for (let index = 0; index < buttons.length; index++) {
    buttons[index].setAttribute("aria-pressed", String(buttons[index].dataset.type === type));
  }
  document.getElementById("type-title").textContent = typeInfo[type].title;
  document.getElementById("type-text").textContent = typeInfo[type].text;
}

const typeButtons = document.querySelectorAll(".type-button");
for (let index = 0; index < typeButtons.length; index++) {
  typeButtons[index].addEventListener("click", function () {
    highlightType(typeButtons[index].dataset.type);
  });
}

// ---------- RGB builder ----------

const redSlider = document.getElementById("red-slider");
const greenSlider = document.getElementById("green-slider");
const blueSlider = document.getElementById("blue-slider");
const alphaSlider = document.getElementById("alpha-slider");

const presets = [
  { name: "Red", rgb: [255, 0, 0] },
  { name: "Yellow", rgb: [255, 255, 0] },
  { name: "Cyan", rgb: [0, 255, 255] },
  { name: "Magenta", rgb: [255, 0, 255] },
  { name: "White", rgb: [255, 255, 255] },
  { name: "Gray", rgb: [128, 128, 128] },
  { name: "Black", rgb: [0, 0, 0] }
];

// Two hex characters for one light, like 2A
function hexPart(value) {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

function updateRgb() {
  const r = Number(redSlider.value);
  const g = Number(greenSlider.value);
  const b = Number(blueSlider.value);
  const alpha = Number(alphaSlider.value) / 100;
  const hex = rgbToHex({ r: r, g: g, b: b });
  const alphaHex = hexPart(Math.round(alpha * 255));

  document.getElementById("red-value").textContent = r;
  document.getElementById("green-value").textContent = g;
  document.getElementById("blue-value").textContent = b;
  document.getElementById("alpha-value").textContent = alpha.toFixed(2);

  const codes = {
    "code-hex": hex,
    "code-rgb": "rgb(" + r + ", " + g + ", " + b + ")",
    "code-rgba": "rgba(" + r + ", " + g + ", " + b + ", " + alpha.toFixed(2) + ")",
    "code-hex-alpha": hex + alphaHex
  };
  for (const id in codes) {
    document.getElementById(id).textContent = codes[id];
  }

  // The swatch shows the see-through color over a checkerboard
  const swatch = document.getElementById("rgb-swatch");
  swatch.style.background = codes["code-rgba"];
  if (alpha < 0.5) {
    swatch.style.color = "#111111";
  } else {
    swatch.style.color = readableTextColor(hex);
  }

  // Each hex pair lines up with its light
  const pairs = document.getElementById("hex-pairs");
  pairs.innerHTML = "";
  const channels = [["Red", r, "#E63946"], ["Green", g, "#2A9D4F"], ["Blue", b, "#2E5FB8"]];
  const hashMark = document.createElement("span");
  hashMark.className = "hex-hash";
  hashMark.textContent = "#";
  pairs.appendChild(hashMark);
  for (let index = 0; index < channels.length; index++) {
    const pair = document.createElement("span");
    pair.className = "hex-pair";
    pair.style.borderColor = channels[index][2];

    const characters = document.createElement("span");
    characters.className = "hex-pair-code";
    characters.style.color = channels[index][2];
    characters.textContent = hexPart(channels[index][1]);

    const meaning = document.createElement("span");
    meaning.className = "hex-pair-meaning";
    meaning.textContent = channels[index][0] + " = " + channels[index][1];

    pair.appendChild(characters);
    pair.appendChild(meaning);
    pairs.appendChild(pair);
  }

  buildSwatchRow(document.getElementById("tint-row"), tintsOf(hex, 7));
  buildSwatchRow(document.getElementById("shade-row"), shadesOf(hex, 7));
  buildSwatchRow(document.getElementById("tone-row"), tonesOf(hex, 7));
}

function buildPresets() {
  const row = document.getElementById("preset-row");
  for (let index = 0; index < presets.length; index++) {
    const preset = presets[index];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset-button";
    button.textContent = preset.name;
    const presetHex = rgbToHex({ r: preset.rgb[0], g: preset.rgb[1], b: preset.rgb[2] });
    button.style.background = presetHex;
    button.style.color = readableTextColor(presetHex);
    button.addEventListener("click", function () {
      redSlider.value = preset.rgb[0];
      greenSlider.value = preset.rgb[1];
      blueSlider.value = preset.rgb[2];
      alphaSlider.value = 100;
      updateRgb();
    });
    row.appendChild(button);
  }
}

redSlider.addEventListener("input", updateRgb);
greenSlider.addEventListener("input", updateRgb);
blueSlider.addEventListener("input", updateRgb);
alphaSlider.addEventListener("input", updateRgb);

const codeButtons = ["code-hex", "code-rgb", "code-rgba", "code-hex-alpha"];
for (let index = 0; index < codeButtons.length; index++) {
  const button = document.getElementById(codeButtons[index]);
  button.addEventListener("click", function () {
    copyText(button.textContent);
  });
}

// ---------- Warm and cool ----------

const warmColors = ["#9E1B32", "#E63B2E", "#F0612C", "#F58A1F", "#F9B31E", "#F9E11E"];
const coolColors = ["#A6CE39", "#3AA655", "#1B9C8E", "#2E5FB8", "#4E3E9E", "#7B3294"];

// ---------- Meanings ----------

const meanings = [
  { name: "Red", hex: "#E63B2E", text: "Energy, love, danger, and \"look here!\" Great for sale signs and warnings." },
  { name: "Orange", hex: "#F58A1F", text: "Friendly, fun, and warm. Popular for buttons that say \"sign up.\"" },
  { name: "Yellow", hex: "#F9D71E", text: "Happy, sunny, and attention grabbing. Hard to read as text on white." },
  { name: "Green", hex: "#3AA655", text: "Nature, growth, health, and money. Also means \"go\" or \"success.\"" },
  { name: "Blue", hex: "#2E5FB8", text: "Trust, calm, and safety. The most common color for banks and tech sites." },
  { name: "Purple", hex: "#7B3294", text: "Creative, magical, and royal. Feels a little mysterious." },
  { name: "Pink", hex: "#F06BA8", text: "Playful, sweet, and caring. Bright pinks feel bold and modern." },
  { name: "Brown", hex: "#7A4E2D", text: "Earthy, cozy, and dependable. Think coffee shops and outdoor brands." },
  { name: "Black", hex: "#15171C", text: "Powerful, elegant, and serious. Great for luxury and bold text." },
  { name: "White", hex: "#FFFFFF", text: "Clean, simple, and open. Gives everything else room to breathe." },
  { name: "Gray", hex: "#8A8F99", text: "Neutral and balanced. Supports other colors without competing." }
];

function buildMeanings() {
  const grid = document.getElementById("meaning-grid");
  for (let index = 0; index < meanings.length; index++) {
    const item = meanings[index];
    const card = document.createElement("article");
    card.className = "meaning-card";

    const color = document.createElement("div");
    color.className = "meaning-color";
    color.style.background = item.hex;
    if (item.hex === "#FFFFFF") {
      color.style.borderBottom = "1px solid var(--line)";
    }

    const body = document.createElement("div");
    body.className = "meaning-body";
    const name = document.createElement("h3");
    name.className = "meaning-name";
    name.textContent = item.name;
    const text = document.createElement("p");
    text.className = "meaning-text";
    text.textContent = item.text;

    body.appendChild(name);
    body.appendChild(text);
    card.appendChild(color);
    card.appendChild(body);
    grid.appendChild(card);
  }
}

// Start up
drawArtistWheel();
highlightType("all");
buildPresets();
updateRgb();
buildSwatchRow(document.getElementById("warm-row"), warmColors);
buildSwatchRow(document.getElementById("cool-row"), coolColors);
buildMeanings();
