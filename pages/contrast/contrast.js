// Contrast Checker

const textHex = document.getElementById("text-hex");
const textPicker = document.getElementById("text-picker");
const bgHex = document.getElementById("bg-hex");
const bgPicker = document.getElementById("bg-picker");
const fixNote = document.getElementById("fix-note");

let textColor = "#264653";
let backgroundColor = "#E9C46A";

function wordFor(ratio) {
  if (ratio >= 7) {
    return "Excellent";
  }
  if (ratio >= 4.5) {
    return "Good";
  }
  if (ratio >= 3) {
    return "OK for big text only";
  }
  return "Hard to read";
}

function render() {
  const preview = document.getElementById("contrast-preview");
  preview.style.backgroundColor = backgroundColor;
  preview.style.color = textColor;

  const ratio = contrastRatio(textColor, backgroundColor);
  const grades = contrastGrades(ratio);
  document.getElementById("ratio-number").textContent = ratio.toFixed(2) + " : 1";
  document.getElementById("ratio-word").textContent = wordFor(ratio);

  const list = [
    { label: "AA normal text", pass: grades.aaNormal },
    { label: "AA big text", pass: grades.aaLarge },
    { label: "AAA normal text", pass: grades.aaaNormal },
    { label: "AAA big text", pass: grades.aaaLarge }
  ];
  const grid = document.getElementById("grade-grid");
  grid.innerHTML = "";
  for (let index = 0; index < list.length; index++) {
    const grade = document.createElement("div");
    grade.className = "grade " + (list[index].pass ? "grade-pass" : "grade-fail");
    const label = document.createElement("span");
    label.className = "grade-label";
    label.textContent = list[index].label;
    const result = document.createElement("span");
    result.className = "grade-result";
    result.textContent = list[index].pass ? "Pass" : "Fail";
    grade.appendChild(label);
    grade.appendChild(result);
    grid.appendChild(grade);
  }

  // Don't overwrite a box while someone is typing in it
  if (document.activeElement !== textHex) {
    textHex.value = textColor;
  }
  if (document.activeElement !== bgHex) {
    bgHex.value = backgroundColor;
  }
  textPicker.value = textColor.toLowerCase();
  bgPicker.value = backgroundColor.toLowerCase();
}

// Make the text lighter or darker (same hue) until it reaches 4.5 : 1
function fixContrast() {
  if (contrastRatio(textColor, backgroundColor) >= 4.5) {
    fixNote.textContent = "It already passes AA for normal text.";
    return;
  }

  const hsl = hexToHsl(textColor);
  const goDarker = relativeLuminance(backgroundColor) > 0.18;
  let lightness = hsl.l;
  let fixed = textColor;

  for (let step = 0; step < 100; step++) {
    lightness = goDarker ? lightness - 1 : lightness + 1;
    fixed = hslToHex({ h: hsl.h, s: hsl.s, l: clamp(lightness, 0, 100) });
    if (contrastRatio(fixed, backgroundColor) >= 4.5 || lightness <= 0 || lightness >= 100) {
      break;
    }
  }

  const before = textColor;
  textColor = fixed;
  fixNote.textContent = "Changed the text from " + before + " to " + fixed + " by making it " + (goDarker ? "darker" : "lighter") + ". Same hue, just more contrast.";
  render();
}

function setFromInput(input, which) {
  if (hexToRgb(input.value) && input.value.replace("#", "").length === 6) {
    if (which === "text") {
      textColor = rgbToHex(hexToRgb(input.value));
    } else {
      backgroundColor = rgbToHex(hexToRgb(input.value));
    }
    fixNote.textContent = "";
    render();
  }
}

textHex.addEventListener("input", function () {
  setFromInput(textHex, "text");
});

bgHex.addEventListener("input", function () {
  setFromInput(bgHex, "bg");
});

textHex.addEventListener("blur", render);
bgHex.addEventListener("blur", render);

textPicker.addEventListener("input", function () {
  textColor = rgbToHex(hexToRgb(textPicker.value));
  fixNote.textContent = "";
  render();
});

bgPicker.addEventListener("input", function () {
  backgroundColor = rgbToHex(hexToRgb(bgPicker.value));
  fixNote.textContent = "";
  render();
});

document.getElementById("swap-button").addEventListener("click", function () {
  const oldText = textColor;
  textColor = backgroundColor;
  backgroundColor = oldText;
  fixNote.textContent = "";
  render();
});

document.getElementById("fix-button").addEventListener("click", fixContrast);

// Quick picks from the saved palette, plus black and white
function buildPicks(containerId, which) {
  const box = document.getElementById(containerId);
  const colors = loadPalette().concat(["#FFFFFF", "#111111"]);
  for (let index = 0; index < colors.length; index++) {
    const hex = colors[index];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pick-swatch";
    button.style.background = hex;
    button.title = hex;
    button.setAttribute("aria-label", "Use " + hex + " for the " + which);
    button.addEventListener("click", function () {
      if (which === "text") {
        textColor = hex;
      } else {
        backgroundColor = hex;
      }
      fixNote.textContent = "";
      render();
    });
    box.appendChild(button);
  }
}

buildPicks("pick-text", "text");
buildPicks("pick-bg", "background");

// Start with the darkest and lightest colors in the saved palette
const startPalette = loadPalette();
let darkest = startPalette[0];
let lightest = startPalette[0];
for (let index = 0; index < startPalette.length; index++) {
  if (relativeLuminance(startPalette[index]) < relativeLuminance(darkest)) {
    darkest = startPalette[index];
  }
  if (relativeLuminance(startPalette[index]) > relativeLuminance(lightest)) {
    lightest = startPalette[index];
  }
}
textColor = darkest;
backgroundColor = lightest;
render();
