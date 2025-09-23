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

// Normalisasi path (hapus trailing slash, fallback root ke /quiz1)
function normalizePath(path) {
  if (!path || path === "/") return "/quiz1";
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}

// Fungsi untuk tampilkan 404 (custom, bisa diganti dengan fetch template jika mau)
function show404(path) {
  content.innerHTML = `
    <div class="row justify-content-center mt-5">
      <div class="col-md-6 text-center">
        <h1 class="display-1 fw-bold text-danger">404</h1>
        <p class="lead">Page Not Found</p>
        <p>The requested path "${path}" does not exist.</p>
        <a href="/quiz1" class="btn btn-primary">Go to Home</a>
      </div>
    </div>
  `;
  // Hapus CSS khusus halaman
  pageStyle.setAttribute("href", "");
}

// Load konten + CSS
async function loadContent(path) {
  const normalizedPath = normalizePath(path);
  
  // Cek jika route tidak terdaftar -> tampilkan 404
  if (!routes[normalizedPath]) {
    show404(normalizedPath);
    return;
  }

  const route = routes[normalizedPath];

  try {
    const res = await fetch(route.html);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const html = await res.text();
    content.innerHTML = html;
    pageStyle.setAttribute("href", route.css);
  } catch (err) {
    // Jika fetch gagal (file hilang/error), tampilkan 404
    show404(normalizedPath);
    console.error("Error loading content:", err);
  }
}

// Delegasi klik link (navbar & page-box)
document.addEventListener("click", (e) => {
  const link = e.target.closest("a.nav-link, a.page-box");
  if (!link) return;

  e.preventDefault();
  const href = link.getAttribute("href");
  const normalizedHref = normalizePath(href);

  // Hanya pushState jika path berbeda
  if (window.location.pathname !== normalizedHref) {
    window.history.pushState({}, "", normalizedHref);
    loadContent(normalizedHref);
  }
});

// Back/forward browser
window.addEventListener("popstate", () => {
  loadContent(window.location.pathname);
});

// Load pertama kali
window.addEventListener("DOMContentLoaded", () => {
  let initialPath = window.location.pathname;
  
  // Handle restore dari sessionStorage (dari 404.html atau direct access)
  if (sessionStorage.redirect) {
    initialPath = normalizePath(sessionStorage.redirect);
    delete sessionStorage.redirect;
    // Update history untuk path asli
    window.history.replaceState({}, "", initialPath);
  }
  
  loadContent(initialPath);
});