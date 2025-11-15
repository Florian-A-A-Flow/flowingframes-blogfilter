const PROXY_URL = "https://flowingframes-proxy.florian-augustus-alexander.workers.dev/?url=https://www.flowingframes.media/all-projekte?format=json-pretty";
let allItems = [];
let visibleCount = 50;

// DOM elements
const grid = document.getElementById("portfolio-grid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const categoryFilters = document.getElementById("categoryFilters");

// Fetch JSON from proxy
fetch(PROXY_URL)
  .then(r => r.json())
  .then(data => {
    allItems = data.items || [];
    buildCategoryFilters();
    renderGrid();
  })
  .catch(err => {
    console.error("Error fetching data", err);
  });

// Build category checkboxes for multi-select OR filter
function buildCategoryFilters() {
  const catSet = new Set();
  allItems.forEach(item => {
    (item.categories || []).forEach(cat => catSet.add(cat));
  });
  // Clear existing
  categoryFilters.innerHTML = "";
  [...catSet].sort().forEach(cat => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = cat;
    input.addEventListener("change", () => {
      visibleCount = 50; // reset
      renderGrid();
    });
    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + cat));
    categoryFilters.appendChild(label);
  });
}

// Render grid with filters and pagination
function renderGrid() {
  const selected = [...categoryFilters.querySelectorAll("input:checked")].map(i => i.value);
  let filtered = allItems;
  if (selected.length > 0) {
    filtered = allItems.filter(item => {
      const itemCats = item.categories || [];
      return selected.some(cat => itemCats.includes(cat));
    });
  }
  const subset = filtered.slice(0, visibleCount);
  grid.innerHTML = subset.map(item => {
    const img = item.assetUrl || "";
    const url = item.fullUrl || "#";
    const cats = (item.categories || []).join(", ");
    const title = item.title || "";
    const excerpt = cleanExcerpt(item.excerpt || "");
    return `
      <a class="card" href="${url}">
        <img class="card-img" src="${img}" loading="lazy">
        <div class="card-category">${cats}</div>
        <div class="card-title">${title}</div>
        <div class="card-excerpt">${excerpt}</div>
      </a>
    `;
  }).join("");
  loadMoreBtn.style.display = filtered.length > visibleCount ? "block" : "none";
}

// Clean excerpt by stripping HTML tags
function cleanExcerpt(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent.trim();
}

// Load more button event
loadMoreBtn.addEventListener("click", () => {
  visibleCount = allItems.length;
  renderGrid();
});
