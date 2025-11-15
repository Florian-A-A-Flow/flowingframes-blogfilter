// portfolio.js

// 🔗 Proxy-URL: hier NUR die Proxy-Adresse verwenden
const API_URL =
  "https://flowingframes-proxy.florian-augustus-alexander.workers.dev/?url=https://www.flowingframes.media/all-projekte?format=json-pretty";

const gridEl = document.getElementById("portfolioGrid");
const categoryFiltersEl = document.getElementById("categoryFilters");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let allItems = [];
let filteredItems = [];
let visibleCount = 50; // zuerst 50 anzeigen

let selectedCategories = new Set();

// -----------------------------
// Helpers
// -----------------------------
function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function formatCategories(catArray) {
  if (!Array.isArray(catArray) || catArray.length === 0) return "";
  return catArray.join(", ");
}

// -----------------------------
// Rendering
// -----------------------------
function createCard(item) {
  const link = document.createElement("a");
  link.className = "card";

  // fullUrl ist relativ ("/all-projekte/…") – hier absolut machen via GitHub-Pages-Domain,
  // damit die Links auf deiner GitHub-Preview funktionieren.
  // Wenn du später direkt auf Squarespace verlinken willst, Domain hier ändern.
  const base = "https://www.flowingframes.media";
  const href = item.fullUrl ? base + item.fullUrl : "#";
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener";

  const inner = document.createElement("div");
  inner.className = "card-inner";

  // Bild
  const imgWrapper = document.createElement("div");
  imgWrapper.className = "card-img-wrapper";

  const img = document.createElement("img");
  img.className = "card-img";
  img.src = item.assetUrl || "";
  img.alt = item.title || "";

  const overlay = document.createElement("div");
  overlay.className = "card-img-overlay";

  imgWrapper.appendChild(img);
  imgWrapper.appendChild(overlay);

  // Text
  const text = document.createElement("div");
  text.className = "card-text";

  const cat = document.createElement("div");
  cat.className = "card-category";
  cat.textContent = formatCategories(item.categories);

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = item.title || "";

  const excerpt = document.createElement("div");
  excerpt.className = "card-excerpt";
  excerpt.textContent = stripHtml(item.excerpt);

  text.appendChild(cat);
  text.appendChild(title);
  text.appendChild(excerpt);

  inner.appendChild(imgWrapper);
  inner.appendChild(text);
  link.appendChild(inner);

  return link;
}

function renderGrid() {
  gridEl.innerHTML = "";

  const itemsToShow = filteredItems.slice(0, visibleCount);

  if (itemsToShow.length === 0) {
    const msg = document.createElement("div");
    msg.className = "status-message";
    msg.textContent = "Keine Projekte für die gewählten Kategorien gefunden.";
    gridEl.appendChild(msg);
    loadMoreBtn.style.display = "none";
    return;
  }

  itemsToShow.forEach((item) => {
    const card = createCard(item);
    gridEl.appendChild(card);
  });

  // Load-More-Button ein-/ausblenden
  if (filteredItems.length > visibleCount) {
    loadMoreBtn.style.display = "block";
  } else {
    loadMoreBtn.style.display = "none";
  }
}

// -----------------------------
// Filter
// -----------------------------
function applyFilters() {
  if (selectedCategories.size === 0) {
    filteredItems = [...allItems];
  } else {
    filteredItems = allItems.filter((item) => {
      if (!Array.isArray(item.categories)) return false;
      return item.categories.some((cat) => selectedCategories.has(cat));
    });
  }
  visibleCount = 50; // bei jedem Filterwechsel wieder bei 50 starten
  renderGrid();
}

function buildCategoryFilters() {
  const catSet = new Set();

  allItems.forEach((item) => {
    if (Array.isArray(item.categories)) {
      item.categories.forEach((c) => catSet.add(c));
    }
  });

  const cats = Array.from(catSet).sort((a, b) =>
    a.localeCompare(b, "de", { sensitivity: "base" })
  );

  categoryFiltersEl.innerHTML = "";

  cats.forEach((cat) => {
    const id = `cat-${cat.toLowerCase().replace(/\s+/g, "-")}`;

    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.value = cat;

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedCategories.add(cat);
      } else {
        selectedCategories.delete(cat);
      }
      applyFilters();
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(cat));
    categoryFiltersEl.appendChild(label);
  });
}

// -----------------------------
// Fetch & Init
// -----------------------------
async function init() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        // Proxy kümmert sich um CORS, hier reicht GET
      },
    });

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json();

    if (!data || !Array.isArray(data.items)) {
      throw new Error("Unerwartetes JSON-Format");
    }

    // Neueste zuerst nach publishOn
    allItems = [...data.items].sort((a, b) => {
      const tA = a.publishOn || 0;
      const tB = b.publishOn || 0;
      return tB - tA;
    });

    filteredItems = [...allItems];

    buildCategoryFilters();
    renderGrid();
  } catch (err) {
    console.error(err);
    gridEl.innerHTML =
      '<div class="status-message">Fehler beim Laden der Projekte.</div>';
  }
}

// Load More
loadMoreBtn.addEventListener("click", () => {
  visibleCount = filteredItems.length; // alles anzeigen
  renderGrid();
});

// Init beim Laden
document.addEventListener("DOMContentLoaded", init);
