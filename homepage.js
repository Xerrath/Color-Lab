// Home page: current palette and a card for each tool

const tools = [
  { path: "pages/basics/", name: "Color Basics", text: "How screens mix light, building colors with rgb(), rgba(), and hex, the artist's wheel, warm and cool, and what colors mean.", strip: ["#E63B2E", "#F9E11E", "#2E5FB8"] },
  { path: "pages/wheel/", name: "Color Wheel", text: "Drag around the wheel and watch complementary, triadic, and other harmonies follow along.", strip: ["#2A9D8F", "#9D2A38"] },
  { path: "pages/generator/", name: "Palette Generator", text: "Press Space for a new palette. Lock the colors you love and keep going.", strip: ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"] },
  { path: "pages/inspector/", name: "Color Inspector", text: "Every code for one color, plus its shades, tints, harmonies, and how color-blind users see it.", strip: tintsOf("#457B9D", 6) },
  { path: "pages/contrast/", name: "Contrast Checker", text: "Can people read your text? Check the ratio, see pass or fail, and fix it in one click.", strip: ["#111318", "#FFFFFF"] },
  { path: "pages/visualizer/", name: "Palette Visualizer", text: "See your palette on a real website using the 60-30-10 rule.", strip: ["#F7F5F2", "#F7F5F2", "#F7F5F2", "#264653", "#264653", "#E76F51"] },
  { path: "pages/root/", name: "Root Builder", text: "Build your 5-color tribute palette and copy it as CSS :root variables.", strip: ["#1D4E89", "#1A787C", "#E8B873", "#A62A61", "#F5F2EA"] }
];

function buildTools() {
  const grid = document.getElementById("tool-grid");
  for (let index = 0; index < tools.length; index++) {
    const tool = tools[index];
    const card = document.createElement("a");
    card.className = "tool-card";
    card.href = "./" + tool.path;

    const strip = document.createElement("div");
    strip.className = "tool-strip";
    strip.setAttribute("aria-hidden", "true");
    for (let colorIndex = 0; colorIndex < tool.strip.length; colorIndex++) {
      const piece = document.createElement("span");
      piece.style.background = tool.strip[colorIndex];
      strip.appendChild(piece);
    }

    const body = document.createElement("div");
    body.className = "tool-body";
    const step = document.createElement("p");
    step.className = "tool-step";
    step.textContent = "Step " + (index + 1);
    const name = document.createElement("h3");
    name.className = "tool-name";
    name.textContent = tool.name;
    const text = document.createElement("p");
    text.className = "tool-text";
    text.textContent = tool.text;

    body.appendChild(step);
    body.appendChild(name);
    body.appendChild(text);
    card.appendChild(strip);
    card.appendChild(body);
    grid.appendChild(card);
  }
}

buildSwatchRow(document.getElementById("home-palette"), loadPalette());
buildTools();
