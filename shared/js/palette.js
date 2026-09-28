// Your current palette follows you from tool to tool (saved in this browser only)

const paletteKey = "colorLabPalette";
const startingPalette = ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"];

function loadPalette() {
  try {
    const saved = JSON.parse(localStorage.getItem(paletteKey));
    if (Array.isArray(saved) && saved.length >= 2) {
      const valid = [];
      for (let index = 0; index < saved.length; index++) {
        if (hexToRgb(saved[index])) {
          valid.push(rgbToHex(hexToRgb(saved[index])));
        }
      }
      if (valid.length >= 2) {
        return valid;
      }
    }
  } catch (error) {
    return startingPalette.slice();
  }
  return startingPalette.slice();
}

function savePalette(colors) {
  try {
    localStorage.setItem(paletteKey, JSON.stringify(colors));
  } catch (error) {
    // Storage blocked: the page still works, it just won't remember
  }
}

// Link to the Color Inspector for one color
function inspectorLink(root, hex) {
  return root + "pages/inspector/?hex=" + hex.replace("#", "");
}

// Copy text and show a small message at the bottom of the screen
function copyText(text) {
  function done() {
    showToast("Copied " + text);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () {
      fallbackCopy(text);
      done();
    });
  } else {
    fallbackCopy(text);
    done();
  }
}

function fallbackCopy(text) {
  const box = document.createElement("textarea");
  box.value = text;
  box.style.position = "fixed";
  box.style.opacity = "0";
  document.body.appendChild(box);
  box.select();
  try {
    document.execCommand("copy");
  } catch (error) {
    // Nothing else to try
  }
  box.remove();
}

let toastTimer = null;

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 1600);
}

// A row of clickable swatches (click copies the hex). Used on several pages.
function buildSwatchRow(container, colors, options) {
  const settings = options || {};
  container.innerHTML = "";
  for (let index = 0; index < colors.length; index++) {
    const hex = colors[index];
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch";
    swatch.style.background = hex;
    swatch.style.color = readableTextColor(hex);
    swatch.title = "Copy " + hex;
    swatch.setAttribute("aria-label", "Copy " + hex);
    if (settings.showHex !== false) {
      swatch.textContent = hex.replace("#", "");
    }
    swatch.addEventListener("click", function () {
      if (settings.onPick) {
        settings.onPick(hex);
      } else {
        copyText(hex);
      }
    });
    container.appendChild(swatch);
  }
}
