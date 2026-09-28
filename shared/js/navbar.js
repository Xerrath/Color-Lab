// Site header and nav for every page

const siteRoot = document.body.dataset.root || "./";
const currentPage = document.body.dataset.page || "home";

const sitePages = [
  { id: "home", name: "Home", path: "" },
  { id: "basics", name: "Color Basics", path: "pages/basics/" },
  { id: "wheel", name: "Color Wheel", path: "pages/wheel/" },
  { id: "generator", name: "Generator", path: "pages/generator/" },
  { id: "inspector", name: "Inspector", path: "pages/inspector/" },
  { id: "contrast", name: "Contrast", path: "pages/contrast/" },
  { id: "visualizer", name: "Visualizer", path: "pages/visualizer/" },
  { id: "root", name: "Root Builder", path: "pages/root/" }
];

function buildHeader() {
  const header = document.getElementById("site-header");
  if (!header) {
    return;
  }

  const inner = document.createElement("div");
  inner.className = "header-inner";

  const brand = document.createElement("a");
  brand.className = "brand";
  brand.href = siteRoot;

  const logo = document.createElement("img");
  logo.className = "brand-logo";
  logo.src = siteRoot + "assets/images/coding-logo.png";
  logo.alt = "West-MEC Coding";

  const dots = document.createElement("span");
  dots.className = "brand-dots";
  dots.setAttribute("aria-hidden", "true");
  const dotColors = ["#E63946", "#F4A261", "#E9C46A", "#2A9D8F", "#457B9D"];
  for (let index = 0; index < dotColors.length; index++) {
    const dot = document.createElement("span");
    dot.style.background = dotColors[index];
    dots.appendChild(dot);
  }

  const name = document.createElement("span");
  name.className = "brand-name";
  name.textContent = "Color Lab";

  brand.appendChild(logo);
  brand.appendChild(dots);
  brand.appendChild(name);
  inner.appendChild(brand);

  const nav = document.createElement("nav");
  nav.className = "main-nav";
  nav.setAttribute("aria-label", "Main");
  const list = document.createElement("ul");
  list.className = "nav-list";

  for (let index = 0; index < sitePages.length; index++) {
    const page = sitePages[index];
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = siteRoot + page.path;
    link.textContent = page.name;
    if (page.id === currentPage) {
      link.setAttribute("aria-current", "page");
    }
    item.appendChild(link);
    list.appendChild(item);
  }

  nav.appendChild(list);
  inner.appendChild(nav);
  header.appendChild(inner);
}

buildHeader();
