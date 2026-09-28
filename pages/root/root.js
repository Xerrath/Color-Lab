// Root Builder: pick a primary color, choose the other 4 roles, copy the :root variables

const stepsBox = document.getElementById("root-steps");
const preview = document.getElementById("preview");

// The five roles in the order students pick them
const roles = [
  { id: "primary", variable: "--primary-color", step: "Step 1", about: "Your main color. It should say something about the person you are honoring." },
  { id: "secondary", variable: "--secondary-color", step: "Step 2", about: "Supports the primary. A neighbor on the wheel (analogous) or a lighter / darker version." },
  { id: "contrast", variable: "--contrast-color", step: "Step 3", about: "The complement: straight across the wheel from your primary. Use it for things that should pop, like buttons." },
  { id: "triadic", variable: "--triadic-color", step: "Step 4", about: "A third of the way around the wheel from your primary. Great for borders and small highlights." },
  { id: "extra", variable: "--extra-color", step: "Step 5", about: "One more from another category. A light or dark neutral works great as a background." }
];

let primaryHex = "#1D4E89";
const chosen = {};
const chosenOption = {};

function shift(hex, lightnessChange) {
  const hsl = hexToHsl(hex);
  return hslToHex({ h: hsl.h, s: hsl.s, l: clamp(hsl.l + lightnessChange, 4, 97) });
}

function rotate(hex, degrees) {
  const hsl = hexToHsl(hex);
  return hslToHex({ h: hsl.h + degrees, s: hsl.s, l: hsl.l });
}

// Suggested colors for each role, built from the primary
function optionsFor(roleId) {
  const p = primaryHex;
  if (roleId === "secondary") {
    return [
      { label: "Analogous left", hex: rotate(p, -30) },
      { label: "Analogous right", hex: rotate(p, 30) },
      { label: "Lighter tint", hex: tintsOf(p, 5)[2] },
      { label: "Darker shade", hex: shadesOf(p, 5)[2] }
    ];
  }
  if (roleId === "contrast") {
    const complement = rotate(p, 180);
    return [
      { label: "Complement", hex: complement },
      { label: "Lighter complement", hex: shift(complement, 20) },
      { label: "Darker complement", hex: shift(complement, -20) }
    ];
  }
  if (roleId === "triadic") {
    return [
      { label: "Triadic A", hex: rotate(p, 120) },
      { label: "Triadic B", hex: rotate(p, 240) },
      { label: "Lighter A", hex: shift(rotate(p, 120), 20) },
      { label: "Lighter B", hex: shift(rotate(p, 240), 20) }
    ];
  }
  if (roleId === "extra") {
    return [
      { label: "Light neutral", hex: mixHex(tintsOf(p, 10)[8], "#F5F2EA", 0.6) },
      { label: "Dark neutral", hex: mixHex(shadesOf(p, 10)[8], "#1A1A1A", 0.5) },
      { label: "Split comp. A", hex: rotate(p, 150) },
      { label: "Split comp. B", hex: rotate(p, 210) }
    ];
  }
  return [];
}

function buildSteps() {
  stepsBox.innerHTML = "";

  for (let index = 0; index < roles.length; index++) {
    const role = roles[index];
    const card = document.createElement("div");
    card.className = "role-card";

    const top = document.createElement("div");
    top.className = "role-top";
    const chip = document.createElement("span");
    chip.className = "role-chip";
    chip.style.background = chosen[role.id];
    const names = document.createElement("div");
    const step = document.createElement("p");
    step.className = "role-step";
    step.textContent = role.step;
    const name = document.createElement("p");
    name.className = "role-name";
    name.textContent = role.variable;
    names.appendChild(step);
    names.appendChild(name);
    const hex = document.createElement("span");
    hex.className = "role-hex";
    hex.textContent = chosen[role.id];
    top.appendChild(chip);
    top.appendChild(names);
    top.appendChild(hex);
    card.appendChild(top);

    const about = document.createElement("p");
    about.className = "role-about";
    about.textContent = role.about;
    card.appendChild(about);

    if (role.id === "primary") {
      const field = document.createElement("div");
      field.className = "color-field";
      const text = document.createElement("input");
      text.className = "text-input hex-input";
      text.type = "text";
      text.maxLength = 7;
      text.value = primaryHex;
      text.setAttribute("aria-label", "Primary color hex code");
      const picker = document.createElement("input");
      picker.type = "color";
      picker.value = primaryHex.toLowerCase();
      picker.setAttribute("aria-label", "Pick the primary color");

      text.addEventListener("change", function () {
        if (hexToRgb(text.value)) {
          setPrimary(text.value);
        } else {
          text.value = primaryHex;
        }
      });
      picker.addEventListener("change", function () {
        setPrimary(picker.value);
      });
      field.appendChild(text);
      field.appendChild(picker);
      card.appendChild(field);
    } else {
      const row = document.createElement("div");
      row.className = "option-row";
      const options = optionsFor(role.id);
      for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
        const option = options[optionIndex];
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option";
        button.setAttribute("aria-pressed", String(chosenOption[role.id] === optionIndex));
        const dot = document.createElement("span");
        dot.className = "option-dot";
        dot.style.background = option.hex;
        button.appendChild(dot);
        button.appendChild(document.createTextNode(option.label));
        button.title = option.hex;
        button.addEventListener("click", function () {
          chosenOption[role.id] = optionIndex;
          chosen[role.id] = option.hex;
          refresh();
        });
        row.appendChild(button);
      }
      card.appendChild(row);
    }

    // Fine-tune any color lighter or darker (same hue)
    const tune = document.createElement("div");
    tune.className = "tune-row";
    const lighter = document.createElement("button");
    lighter.type = "button";
    lighter.className = "tune-button";
    lighter.textContent = "Lighter";
    lighter.addEventListener("click", function () {
      tuneRole(role.id, 5);
    });
    const darker = document.createElement("button");
    darker.type = "button";
    darker.className = "tune-button";
    darker.textContent = "Darker";
    darker.addEventListener("click", function () {
      tuneRole(role.id, -5);
    });
    tune.appendChild(lighter);
    tune.appendChild(darker);
    card.appendChild(tune);

    stepsBox.appendChild(card);
  }
}

function tuneRole(roleId, amount) {
  if (roleId === "primary") {
    setPrimary(shift(primaryHex, amount), true);
    return;
  }
  chosen[roleId] = shift(chosen[roleId], amount);
  chosenOption[roleId] = -1;
  refresh();
}

// Picking a new primary resets the other roles to their first suggestion
function setPrimary(hex, keepOthers) {
  primaryHex = rgbToHex(hexToRgb(hex));
  chosen.primary = primaryHex;
  if (!keepOthers) {
    for (let index = 1; index < roles.length; index++) {
      const id = roles[index].id;
      chosenOption[id] = 0;
      chosen[id] = optionsFor(id)[0].hex;
    }
    // A light background is the friendliest starting point for the extra color
    chosen.extra = optionsFor("extra")[0].hex;
    chosen.contrast = optionsFor("contrast")[1].hex;
    chosenOption.contrast = 1;
  }
  refresh();
}

function codeText() {
  let text = ":root {\n";
  for (let index = 0; index < roles.length; index++) {
    text = text + "  " + roles[index].variable + ": " + chosen[roles[index].id] + ";\n";
  }
  return text + "}";
}

function renderChecks() {
  const pairs = [
    ["Body text", "primary", "extra"],
    ["Header text", "extra", "primary"],
    ["Button text", "primary", "contrast"],
    ["Quote text", "extra", "secondary"],
    ["Timeline years", "triadic", "extra"]
  ];
  const list = document.getElementById("check-list");
  list.innerHTML = "";

  for (let index = 0; index < pairs.length; index++) {
    const pair = pairs[index];
    const textHex = chosen[pair[1]];
    const backgroundHex = chosen[pair[2]];
    const ratio = contrastRatio(textHex, backgroundHex);

    const item = document.createElement("li");
    item.className = "check-item";

    const sample = document.createElement("span");
    sample.className = "check-sample";
    sample.style.color = textHex;
    sample.style.background = backgroundHex;
    sample.textContent = "Aa";

    const label = document.createElement("span");
    label.className = "check-label";
    label.textContent = pair[0] + ": --" + pair[1] + "-color on --" + pair[2] + "-color";

    const ratioText = document.createElement("span");
    ratioText.className = "check-ratio";
    ratioText.textContent = ratio.toFixed(2) + " : 1";

    const badge = document.createElement("span");
    badge.className = "badge " + (ratio >= 4.5 ? "badge-pass" : "badge-fail");
    badge.textContent = ratio >= 4.5 ? "Pass" : "Fail";

    item.appendChild(sample);
    item.appendChild(label);
    item.appendChild(ratioText);
    item.appendChild(badge);
    list.appendChild(item);
  }
}

function refresh() {
  for (let index = 0; index < roles.length; index++) {
    preview.style.setProperty(roles[index].variable, chosen[roles[index].id]);
  }
  document.getElementById("root-code").textContent = codeText();
  renderChecks();
  buildSteps();
}

document.getElementById("copy-code").addEventListener("click", function () {
  copyText(codeText());
});

document.getElementById("save-palette").addEventListener("click", function () {
  const list = [];
  for (let index = 0; index < roles.length; index++) {
    list.push(chosen[roles[index].id]);
  }
  savePalette(list);
  showToast("Saved! The other Color Lab tools will use it.");
});

setPrimary(primaryHex);
