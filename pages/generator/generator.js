// Palette Generator: space makes a new palette, locked colors stay put

const columnsBox = document.getElementById("gen-colors");
const harmonySelect = document.getElementById("harmony-select");
const harmonyNote = document.getElementById("harmony-note");
const minColors = 2;
const maxColors = 8;

let colors = [];
let history = [];

// Simple line icons (24 x 24)
const icons = {
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.6-1.8"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  inspect: '<circle cx="11" cy="11" r="6.5"/><path d="M20.5 20.5l-4.8-4.8"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  remove: '<path d="M6 6l12 12M18 6L6 18"/>'
};

function iconSvg(name) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + "</svg>";
}

function makeTool(iconName, label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "gen-tool " + iconName + "-tool";
  button.innerHTML = iconSvg(iconName);
  button.title = label;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", onClick);
  return button;
}

function saveState() {
  const list = [];
  for (let index = 0; index < colors.length; index++) {
    list.push(colors[index].hex);
  }
  savePalette(list);
}

function rememberForUndo() {
  history.push(JSON.stringify(colors));
  if (history.length > 50) {
    history.shift();
  }
}

function undo() {
  if (history.length === 0) {
    showToast("Nothing to undo");
    return;
  }
  colors = JSON.parse(history.pop());
  render();
}

// Build a list of new colors from a harmony, then add lighter and darker versions if more are needed
function harmonyPool(baseHex, harmonyId, needed, skipBase) {
  const pool = [];
  const start = harmonyColors(baseHex, harmonyId);
  for (let index = skipBase ? 1 : 0; index < start.length; index++) {
    if (pool.indexOf(start[index]) === -1) {
      pool.push(start[index]);
    }
  }

  let step = 0;
  const source = start.slice();
  while (pool.length < needed && step < 40) {
    const hsl = hexToHsl(source[step % source.length]);
    const shift = (Math.floor(step / source.length) + 1) * 16;
    const direction = step % 2 === 0 ? 1 : -1;
    const variant = hslToHex({ h: hsl.h, s: hsl.s, l: clamp(hsl.l + shift * direction, 10, 92) });
    if (pool.indexOf(variant) === -1) {
      pool.push(variant);
    }
    step = step + 1;
  }
  return pool;
}

function generate() {
  rememberForUndo();

  let mode = harmonySelect.value;
  const unlocked = [];
  let lockedBase = null;

  for (let index = 0; index < colors.length; index++) {
    if (colors[index].locked) {
      if (!lockedBase) {
        lockedBase = colors[index].hex;
      }
    } else {
      unlocked.push(index);
    }
  }

  if (unlocked.length === 0) {
    showToast("Every color is locked. Unlock one to change it.");
    history.pop();
    return;
  }

  if (mode === "random") {
    for (let index = 0; index < unlocked.length; index++) {
      colors[unlocked[index]].hex = randomColor();
    }
    harmonyNote.textContent = "Totally random: no color rules at all. Some palettes will clash. Can you tell why?";
    render();
    return;
  }

  if (mode === "surprise") {
    const choices = ["analogous", "monochromatic", "complementary", "split", "triadic", "square"];
    mode = choices[Math.floor(Math.random() * choices.length)];
  }

  const harmony = findHarmony(mode);
  const base = lockedBase || randomColor();
  const pool = harmonyPool(base, mode, unlocked.length, Boolean(lockedBase));

  for (let index = 0; index < unlocked.length; index++) {
    colors[unlocked[index]].hex = pool[index % pool.length];
  }

  let note = harmony.name + ": " + harmony.about;
  if (lockedBase) {
    note = note + " Built from your locked color " + lockedBase + ".";
  }
  harmonyNote.textContent = note;
  render();
}

function moveColor(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= colors.length) {
    return;
  }
  rememberForUndo();
  const moving = colors[index];
  colors[index] = colors[target];
  colors[target] = moving;
  render();
}

function removeColor(index) {
  if (colors.length <= minColors) {
    showToast("A palette needs at least " + minColors + " colors");
    return;
  }
  rememberForUndo();
  colors.splice(index, 1);
  render();
}

function addColor() {
  if (colors.length >= maxColors) {
    showToast("That's the most colors (" + maxColors + ")");
    return;
  }
  rememberForUndo();
  const last = colors[colors.length - 1].hex;
  const before = colors[colors.length - 2].hex;
  colors.push({ hex: mixHex(last, before, 0.5), locked: false });
  render();
}

function toggleLock(index) {
  colors[index].locked = !colors[index].locked;
  render();
}

function render() {
  columnsBox.innerHTML = "";

  for (let index = 0; index < colors.length; index++) {
    const color = colors[index];
    const textColor = readableTextColor(color.hex);

    const column = document.createElement("section");
    column.className = "gen-color";
    if (color.locked) {
      column.classList.add("is-locked");
    }
    column.style.backgroundColor = color.hex;
    column.style.color = textColor;
    column.setAttribute("aria-label", "Color " + (index + 1) + ": " + color.hex + (color.locked ? ", locked" : ""));

    const badge = document.createElement("span");
    badge.className = "gen-lock-badge";
    badge.innerHTML = iconSvg("lock");
    column.appendChild(badge);

    const tools = document.createElement("div");
    tools.className = "gen-tools";
    tools.appendChild(makeTool(color.locked ? "lock" : "unlock", color.locked ? "Unlock this color" : "Lock this color", function () {
      toggleLock(index);
    }));
    tools.appendChild(makeTool("copy", "Copy " + color.hex, function () {
      copyText(color.hex);
    }));

    const inspect = document.createElement("a");
    inspect.className = "gen-tool";
    inspect.href = inspectorLink(siteRoot, color.hex);
    inspect.innerHTML = iconSvg("inspect");
    inspect.title = "Inspect this color";
    inspect.setAttribute("aria-label", "Inspect " + color.hex);
    tools.appendChild(inspect);

    if (index > 0) {
      tools.appendChild(makeTool("left", "Move left", function () {
        moveColor(index, -1);
      }));
    }
    if (index < colors.length - 1) {
      tools.appendChild(makeTool("right", "Move right", function () {
        moveColor(index, 1);
      }));
    }
    if (colors.length > minColors) {
      tools.appendChild(makeTool("remove", "Remove this color", function () {
        removeColor(index);
      }));
    }
    column.appendChild(tools);

    const text = document.createElement("div");
    text.className = "gen-text";

    const hex = document.createElement("button");
    hex.type = "button";
    hex.className = "gen-hex";
    hex.textContent = color.hex.replace("#", "");
    hex.title = "Click to copy";
    hex.addEventListener("click", function () {
      copyText(color.hex);
    });

    const name = document.createElement("p");
    name.className = "gen-name";
    name.textContent = nearestColorName(color.hex);

    text.appendChild(hex);
    text.appendChild(name);
    column.appendChild(text);

    columnsBox.appendChild(column);
  }

  saveState();
}

// Space generates (unless you are typing or picking from the dropdown). Ctrl + Z undoes.
document.addEventListener("keydown", function (event) {
  const tag = event.target.tagName;
  const typing = tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";

  if (event.code === "Space" && !typing) {
    event.preventDefault();
    generate();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !typing) {
    event.preventDefault();
    undo();
  }
});

document.getElementById("generate-button").addEventListener("click", generate);
document.getElementById("undo-button").addEventListener("click", undo);
document.getElementById("add-button").addEventListener("click", addColor);

// Start with the saved palette
const savedPalette = loadPalette();
for (let index = 0; index < savedPalette.length; index++) {
  colors.push({ hex: savedPalette[index], locked: false });
}
harmonyNote.textContent = "Pick a harmony, then press Space. Each harmony follows a different rule on the color wheel.";
render();
