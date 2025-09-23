// Ambil elemen konten dan link CSS
const content = document.getElementById("content");
const pageStyle = document.getElementById("page-style");

// Definisikan route beserta file HTML dan CSS
const routes = {
  "/quiz1": { html: "/quiz1/templates/home.html", css: "/quiz1/styles/home.css" },
  "/quiz1/profile": { html: "/quiz1/templates/profile.html", css: "/quiz1/styles/profile.css" },
  "/quiz1/hometown": { html: "/quiz1/templates/hometown.html", css: "/quiz1/styles/hometown.css" },
  "/quiz1/food": { html: "/quiz1/templates/food.html", css: "/quiz1/styles/food.css" },
  "/quiz1/tourist": { html: "/quiz1/templates/tourist.html", css: "/quiz1/styles/tourist.css" },
};

// Normalisasi path (hapus trailing slash)
function normalizePath(path) {
  if (!path) return "/quiz1";
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}

// Load konten + CSS
async function loadContent(path) {
  const normalizedPath = normalizePath(path);
  const route = routes[normalizedPath] || routes["/quiz1"];

  try {
    const res = await fetch(route.html);
    if (!res.ok) throw new Error("File not found");
    const html = await res.text();
    content.innerHTML = html;
    pageStyle.setAttribute("href", route.css);
  } catch (err) {
    content.innerHTML = "<h2>404 Page Not Found</h2>";
    pageStyle.setAttribute("href", "");
    console.error(err);
  }
}

// Delegasi klik link (navbar & page-box)
document.addEventListener("click", (e) => {
  const link = e.target.closest("a.nav-link, a.page-box");
  if (!link) return; // bukan link target

  e.preventDefault();
  const path = normalizePath(link.getAttribute("href"));

  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
    loadContent(path);
  }
});

// Back/forward browser
window.addEventListener("popstate", () => {
  loadContent(window.location.pathname);
});

// Load pertama kali
window.addEventListener("DOMContentLoaded", () => {
  loadContent(window.location.pathname);
});
