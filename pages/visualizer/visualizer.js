// Palette Visualizer: put the saved palette on a website using the 60-30-10 rule

const mock = document.getElementById("mock");
const roleMain = document.getElementById("role-main");
const roleSecondary = document.getElementById("role-secondary");
const roleAccent = document.getElementById("role-accent");
const warning = document.getElementById("vis-warning");

const palette = loadPalette();

function fillSelect(select) {
  select.innerHTML = "";
  for (let index = 0; index < palette.length; index++) {
    const option = document.createElement("option");
    option.value = palette[index];
    option.textContent = palette[index] + "  " + nearestColorName(palette[index]);
    option.style.background = palette[index];
    option.style.color = readableTextColor(palette[index]);
    select.appendChild(option);
  }
  // White and near black are always options for the main color
  const extras = [["#FFFFFF", "White"], ["#F7F5F2", "Off White"], ["#15171C", "Near Black"]];
  for (let index = 0; index < extras.length; index++) {
    const option = document.createElement("option");
    option.value = extras[index][0];
    option.textContent = extras[index][0] + "  " + extras[index][1];
    select.appendChild(option);
  }
}

function saturationOf(hex) {
  return hexToHsl(hex).s;
}

// Lightest color for the main background, darkest for secondary, boldest leftover for the accent
function autoPick() {
  const sortedByLight = palette.slice().sort(function (a, b) {
    return relativeLuminance(b) - relativeLuminance(a);
  });
  let main = sortedByLight[0];
  let secondary = sortedByLight[sortedByLight.length - 1];

  // A very colorful "lightest" color makes a loud background, so fall back to off white
  if (saturationOf(main) > 60 && relativeLuminance(main) < 0.6) {
    main = "#F7F5F2";
  }

  let accent = null;
  let bestScore = -1;
  for (let index = 0; index < palette.length; index++) {
    const hex = palette[index];
    if (hex === main || hex === secondary) {
      continue;
    }
    const score = saturationOf(hex) + contrastRatio(hex, main) * 8;
    if (score > bestScore) {
      bestScore = score;
      accent = hex;
    }
  }
  if (!accent) {
    accent = palette[1];
  }

  roleMain.value = main;
  roleSecondary.value = secondary;
  roleAccent.value = accent;
  apply();
}

function shuffle() {
  const list = palette.slice();
  for (let index = list.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = list[index];
    list[index] = list[swapIndex];
    list[swapIndex] = temp;
  }
  roleMain.value = list[0];
  roleSecondary.value = list[1];
  roleAccent.value = list[2 % list.length];
  apply();
}

function styleSelect(select) {
  select.style.background = select.value;
  select.style.color = readableTextColor(select.value);
}

function apply() {
  const main = roleMain.value;
  const secondary = roleSecondary.value;
  const accent = roleAccent.value;

  mock.style.setProperty("--main", main);
  mock.style.setProperty("--main-text", readableTextColor(main));
  mock.style.setProperty("--secondary", secondary);
  mock.style.setProperty("--secondary-text", readableTextColor(secondary));
  mock.style.setProperty("--accent", accent);
  mock.style.setProperty("--accent-text", readableTextColor(accent));

  // Accent text on the main background only if it is readable. Otherwise use the normal text color.
  const accentReadable = contrastRatio(accent, main) >= 3;
  mock.style.setProperty("--accent-on-main", accentReadable ? accent : readableTextColor(main));

  styleSelect(roleMain);
  styleSelect(roleSecondary);
  styleSelect(roleAccent);

  // The 60-30-10 bar
  const bar = document.getElementById("split-bar");
  bar.innerHTML = "";
  const parts = [[main, 60], [secondary, 30], [accent, 10]];
  for (let index = 0; index < parts.length; index++) {
    const part = document.createElement("div");
    part.className = "split-part";
    part.style.width = parts[index][1] + "%";
    part.style.background = parts[index][0];
    part.style.color = readableTextColor(parts[index][0]);
    part.textContent = parts[index][1] + "%";
    bar.appendChild(part);
  }

  // Friendly warnings
  const messages = [];
  if (main === secondary || main === accent || secondary === accent) {
    messages.push("Two roles use the same color, so parts of the page blend together.");
  }
  if (contrastRatio(main, secondary) < 1.5) {
    messages.push("The main and secondary colors are very close. The cards may disappear into the page.");
  }
  if (!accentReadable) {
    messages.push("The accent is hard to read on the main color, so links switched to the text color.");
  }
  warning.textContent = messages.join(" ");
}

fillSelect(roleMain);
fillSelect(roleSecondary);
fillSelect(roleAccent);
buildSwatchRow(document.getElementById("vis-palette"), palette);

roleMain.addEventListener("change", apply);
roleSecondary.addEventListener("change", apply);
roleAccent.addEventListener("change", apply);
document.getElementById("auto-button").addEventListener("click", autoPick);
document.getElementById("shuffle-button").addEventListener("click", shuffle);

autoPick();
