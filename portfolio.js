const PROXY_URL = "https://florian-a-a-flow.github.io/flowingframes-blogfilter/proxy.html";
let allItems = [];
let visibleCount = 50;

// DOM
const grid = document.getElementById("portfolio-grid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const categoryFilters = document.getElementById("categoryFilters");

// ----------------------------------------
// Fetch JSON through your proxy
// ----------------------------------------
fetch(PROXY_URL)
  .then(r => r.text())
  .then(t => {
    const data = JSON.parse(t);
    allItems = data.items || [];
    buildCategoryFilters();
    renderGrid();
  });

// ----------------------------------------
// Build category checkboxes
// ----------------------------------------
function buildCategoryFilters() {
  const catSet = new Set();
  allItems.forEach(item => {
    (item.categories || []).forEach(c => catSet.add(c));
  });

  [...catSet].sort().forEach(cat => {
    const id = "cat_" + cat.replace(/\s+/g, "_");

    categoryFilters.innerHTML += `
      <label>
        <input type="checkbox" value="${cat}" onchange="renderGrid()">
        ${cat}
      </label>
    `;
  });
}

// ----------------------------------------
// Render the grid
// ----------------------------------------
function renderGrid() {
  const selected = [...categoryFilters.querySelectorAll("input:checked")].map(i => i.value);

  let filtered = allItems;

  if (selected.length > 0) {
    filtered = allItems.filter(item =>
      selected.every(cat => item.categories.includes(cat))
    );
  }

  // show only first X
  const subset = filtered.slice(0, visibleCount);

  grid.innerHTML = subset.map(item => {
    const img = item.assetUrl;
    const url = item.fullUrl; 
    const cat = item.categories.join(", ");
    const title = item.title;
    const excerpt = cleanExcerpt(item.excerpt);

    return `
      <a class="card" href="${url}">
        <img class="card-img" src="${img}" loading="lazy">
        <div class="card-category">${cat}</div>
        <div class="card-title">${title}</div>
        <div class="card-excerpt">${excerpt}</div>
      </a>
    `;
  }).join("");

  loadMoreBtn.style.display = (filtered.length > visibleCount) ? "block" : "none";
}

// Clean excerpt from HTML
function cleanExcerpt(html) {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

// Load more
loadMoreBtn.onclick = () => {
  visibleCount = 99999;
  renderGrid();
};
