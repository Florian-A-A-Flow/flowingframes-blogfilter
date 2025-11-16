/* ============================
   Portfolio Loader & Filter
   ============================ */

// Deine funktionierende Proxy-URL
const PROXY = "https://flowingframes-proxy.florian-augustus-alexander.workers.dev/?url=";

// Squarespace JSON-Feed URL (alle Projekte)
const FEED_URL = "https://www.flowingframes.media/all-projekte?format=json-pretty";

// Anzahl, die initial angezeigt werden
const INITIAL_COUNT = 12;
const LOAD_MORE_COUNT = 12;

// State
let allPosts = [];
let visiblePosts = [];
let selectedCategories = new Set();

// DOM
const grid = document.getElementById("portfolioGrid");
const filterContainer = document.getElementById("categoryFilters");
const loadMoreBtn = document.getElementById("loadMore");

// -------------------------------
// Fetch Blogposts über Proxy
// -------------------------------
async function loadPortfolio() {
    try {
        const res = await fetch(PROXY + FEED_URL);
        const data = await res.json();

        if (!data.items) {
            console.error("Keine Blogposts im Feed gefunden");
            return;
        }

        // Neueste 50 Einträge
        allPosts = data.items.slice(0, 50);
        createCategoryFilters(allPosts);

        // Erste Ladung anzeigen
        visiblePosts = allPosts.slice(0, INITIAL_COUNT);
        renderPosts(visiblePosts);

        if (allPosts.length > INITIAL_COUNT) {
            loadMoreBtn.style.display = "block";
        }

    } catch (err) {
        console.error("Portfolio Load Error:", err);
    }
}

// -------------------------------
// Kategorien automatisch erstellen
// -------------------------------
function createCategoryFilters(posts) {
    const categories = new Set();

    posts.forEach(post => {
        if (post.categories) {
            post.categories.forEach(cat => categories.add(cat));
        }
    });

    // Filter UI erzeugen
    categories.forEach(cat => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
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
        label.append(" " + cat);

        filterContainer.appendChild(label);
    });
}

// -------------------------------
// Filter anwenden
// -------------------------------
function applyFilters() {
    if (selectedCategories.size === 0) {
        visiblePosts = allPosts.slice(0, INITIAL_COUNT);
    } else {
        const filtered = allPosts.filter(post =>
            post.categories &&
            post.categories.some(cat => selectedCategories.has(cat))
        );
        visiblePosts = filtered.slice(0, INITIAL_COUNT);
    }
    renderPosts(visiblePosts);
}

// -------------------------------
// Blogposts rendern (Cards)
// -------------------------------
function renderPosts(posts) {
    grid.innerHTML = "";

    posts.forEach(post => {
        const url = post.fullUrl;
        const img = post.assetUrl;
        const title = post.title;
        const categories = post.categories ? post.categories.join(", ") : "";
        const excerpt = post.excerpt ? post.excerpt : "";

        const card = document.createElement("a");
        card.href = url;
        card.className = "card";

        card.innerHTML = `
            <img class="card-img" src="${img}" alt="${title}">
            <div class="card-category">${categories}</div>
            <div class="card-title">${title}</div>
            <div class="card-excerpt">${excerpt}</div>
        `;

        grid.appendChild(card);
    });
}

// -------------------------------
// Load More
// -------------------------------
loadMoreBtn.addEventListener("click", () => {
    const currentCount = visiblePosts.length;
    const nextItems = allPosts.slice(
        currentCount,
        currentCount + LOAD_MORE_COUNT
    );
    visiblePosts = visiblePosts.concat(nextItems);
    renderPosts(visiblePosts);

    if (visiblePosts.length >= allPosts.length) {
        loadMoreBtn.style.display = "none";
    }
});

// Start
loadPortfolio();
