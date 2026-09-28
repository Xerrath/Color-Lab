// Color Inspector: everything about one color

const colorInput = document.getElementById("color-input");
const colorPicker = document.getElementById("color-picker");

let currentHex = "#2A9D8F";

function makeCard(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

function renderHero() {
  const hero = document.getElementById("inspect-hero");
  hero.style.backgroundColor = currentHex;
  hero.style.color = readableTextColor(currentHex);
  document.getElementById("inspect-hex").textContent = currentHex.replace("#", "");
  document.getElementById("inspect-name").textContent = "Closest named color: " + nearestColorName(currentHex);
  document.getElementById("inspect-temp").textContent = temperatureOf(currentHex) + " color";
  document.title = currentHex + " | Color Inspector";
}

function renderCodes() {
  const rgb = hexToRgb(currentHex);

  const codes = [
    { label: "HEX", value: currentHex, about: "Red, green, and blue written in base 16. Two characters for each light." },
    { label: "RGB", value: formatRgb(rgb), about: "How much red, green, and blue light, each from 0 (off) to 255 (full)." },
    { label: "RGBA", value: formatRgba(rgb, 1), about: "RGB plus alpha: how see-through it is. 1 is solid, 0 is invisible." },
    { label: "HEX with alpha", value: currentHex + "FF", about: "Hex can hold alpha too. The last two characters: FF is solid, 00 is invisible." }
  ];

  const grid = document.getElementById("code-grid");
  grid.innerHTML = "";
  for (let index = 0; index < codes.length; index++) {
    const code = codes[index];
    const card = makeCard("button", "code-card");
    card.type = "button";
    card.title = "Copy " + code.value;

    const label = makeCard("span", "code-label");
    label.textContent = code.label;
    const value = makeCard("span", "code-value");
    value.textContent = code.value;
    const about = makeCard("span", "code-about");
    about.textContent = code.about;

    card.appendChild(label);
    card.appendChild(value);
    card.appendChild(about);
    card.addEventListener("click", function () {
      copyText(code.value);
    });
    grid.appendChild(card);
  }
}

// Transparency: the same color at different alpha levels, over a checkerboard. Click copies the rgba() code.
function buildAlphaRow() {
  const rgb = hexToRgb(currentHex);
  const wrap = document.createElement("div");

  const title = makeCard("h3", "variation-title");
  title.textContent = "Transparency (alpha)";
  const about = makeCard("p", "variation-about");
  about.textContent = "Same color, more and more see-through. The checkerboard shows through as alpha goes down.";

  const row = makeCard("div", "swatch-row alpha-row");
  const levels = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  for (let index = 0; index < levels.length; index++) {
    const code = formatRgba(rgb, levels[index]);
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch alpha-swatch";
    swatch.style.background = code;
    swatch.style.color = levels[index] >= 0.5 ? readableTextColor(currentHex) : "#111111";
    swatch.textContent = levels[index].toFixed(1);
    swatch.title = "Copy " + code;
    swatch.setAttribute("aria-label", "Copy " + code);
    swatch.addEventListener("click", function () {
      copyText(code);
    });
    row.appendChild(swatch);
  }

  wrap.appendChild(title);
  wrap.appendChild(about);
  wrap.appendChild(row);
  return wrap;
}

function renderVariations() {
  const temperatures = [];
  const hsl = hexToHsl(currentHex);
  for (let step = -6; step <= 6; step++) {
    // Cooler = shift toward blue (hue 220), warmer = shift toward orange (hue 30)
    const target = step < 0 ? 220 : 30;
    let difference = target - hsl.h;
    if (difference > 180) difference -= 360;
    if (difference < -180) difference += 360;
    temperatures.push(hslToHex({ h: hsl.h + difference * (Math.abs(step) / 6) * 0.6, s: hsl.s, l: hsl.l }));
  }

  const rows = [
    { title: "Shades", about: "Add black. The color gets darker and richer.", colors: shadesOf(currentHex, 11) },
    { title: "Tints", about: "Add white. The color gets lighter and softer, like pastels.", colors: tintsOf(currentHex, 11) },
    { title: "Tones", about: "Add gray. The color gets calmer and more muted.", colors: tonesOf(currentHex, 11) },
    { title: "Hues", about: "Keep the same boldness and lightness, but walk around the color wheel.", colors: huesOf(currentHex, 12) },
    { title: "Temperature", about: "Cooler toward blue on the left, warmer toward orange on the right.", colors: temperatures }
  ];

  const list = document.getElementById("variation-list");
  list.innerHTML = "";
  list.appendChild(buildAlphaRow());
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const wrap = document.createElement("div");
    const title = makeCard("h3", "variation-title");
    title.textContent = row.title;
    const about = makeCard("p", "variation-about");
    about.textContent = row.about;
    const swatches = makeCard("div", "swatch-row");
    buildSwatchRow(swatches, row.colors);
    wrap.appendChild(title);
    wrap.appendChild(about);
    wrap.appendChild(swatches);
    list.appendChild(wrap);
  }
}

function renderHarmonies() {
  const grid = document.getElementById("harmony-grid");
  grid.innerHTML = "";
  for (let index = 0; index < harmonies.length; index++) {
    const harmony = harmonies[index];
    const card = makeCard("div", "card");
    const title = makeCard("h3", "harmony-card-title");
    title.textContent = harmony.name;
    const text = makeCard("p", "harmony-card-text");
    text.textContent = harmony.about;
    const swatches = makeCard("div", "swatch-row");
    buildSwatchRow(swatches, harmonyColors(currentHex, harmony.id));
    card.appendChild(title);
    card.appendChild(text);
    card.appendChild(swatches);
    grid.appendChild(card);
  }
}

function renderVision() {
  const palette = loadPalette();
  const grid = document.getElementById("vision-grid");
  grid.innerHTML = "";

  for (let index = 0; index < visionTypes.length; index++) {
    const type = visionTypes[index];
    const card = makeCard("div", "card");

    const main = makeCard("div", "vision-main");
    main.style.background = simulateVision(currentHex, type.id);

    const title = makeCard("h3", "vision-title");
    title.textContent = type.name;
    const about = makeCard("p", "vision-about");
    about.textContent = type.about;

    const row = makeCard("div", "swatch-row");
    const simulated = [];
    for (let colorIndex = 0; colorIndex < palette.length; colorIndex++) {
      simulated.push(simulateVision(palette[colorIndex], type.id));
    }
    buildSwatchRow(row, simulated, { showHex: false, onPick: function () {} });

    card.appendChild(main);
    card.appendChild(title);
    card.appendChild(about);
    card.appendChild(row);
    grid.appendChild(card);
  }
}

function renderContrast() {
  const box = document.getElementById("contrast-pair");
  box.innerHTML = "";
  const backgrounds = [{ name: "on white", bg: "#FFFFFF" }, { name: "on black", bg: "#000000" }];

  for (let index = 0; index < backgrounds.length; index++) {
    const item = backgrounds[index];
    const ratio = contrastRatio(currentHex, item.bg);
    const grades = contrastGrades(ratio);

    const sample = makeCard("div", "contrast-sample");
    sample.style.background = item.bg;
    sample.style.color = currentHex;

    const big = makeCard("p", "contrast-sample-big");
    big.textContent = "Big heading " + item.name;
    const small = makeCard("p", "contrast-sample-small");
    small.textContent = "This is normal paragraph text. Is it easy to read?";

    const result = makeCard("div", "contrast-sample-result");
    result.appendChild(document.createTextNode(ratio.toFixed(2) + " : 1"));
    const normal = makeCard("span", "badge " + (grades.aaNormal ? "badge-pass" : "badge-fail"));
    normal.textContent = (grades.aaNormal ? "Pass" : "Fail") + " normal text";
    const large = makeCard("span", "badge " + (grades.aaLarge ? "badge-pass" : "badge-fail"));
    large.textContent = (grades.aaLarge ? "Pass" : "Fail") + " big text";
    result.appendChild(normal);
    result.appendChild(large);

    sample.appendChild(big);
    sample.appendChild(small);
    sample.appendChild(result);
    box.appendChild(sample);
  }
}

function setColor(hex, updateAddress) {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return;
  }
  currentHex = rgbToHex(rgb);
  if (document.activeElement !== colorInput) {
    colorInput.value = currentHex;
  }
  colorPicker.value = currentHex.toLowerCase();

  renderHero();
  renderCodes();
  renderVariations();
  renderHarmonies();
  renderVision();
  renderContrast();

  // Keep the address bar in sync so a link to this page shows this color
  if (updateAddress) {
    history.replaceState(null, "", "?hex=" + currentHex.replace("#", ""));
  }
}

colorInput.addEventListener("input", function () {
  if (hexToRgb(colorInput.value) && colorInput.value.replace("#", "").length === 6) {
    setColor(colorInput.value, true);
  }
});

colorInput.addEventListener("blur", function () {
  colorInput.value = currentHex;
});

colorPicker.addEventListener("input", function () {
  setColor(colorPicker.value, true);
});

document.getElementById("add-to-palette").addEventListener("click", function () {
  const palette = loadPalette();
  if (palette.indexOf(currentHex) !== -1) {
    showToast("Already in your palette");
    return;
  }
  if (palette.length >= 8) {
    palette.shift();
  }
  palette.push(currentHex);
  savePalette(palette);
  renderVision();
  showToast("Added " + currentHex + " to your palette");
});

// Start with ?hex= from the address, or the first saved palette color
const startHex = new URLSearchParams(window.location.search).get("hex");
if (startHex && hexToRgb(startHex)) {
  setColor(startHex, false);
} else {
  setColor(loadPalette()[0], false);
}
