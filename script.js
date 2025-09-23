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

// Fungsi untuk normalisasi path (hapus trailing slash)
function normalizePath(path) {
  if (!path) return "/quiz1";
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}

// Fungsi load konten + CSS
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

// Handle klik link
document.querySelectorAll("nav a, .page-box").forEach((link) => {
  link.addEventListener("click", function(e) {
    e.preventDefault(); // mencegah browser reload / 404
    const path = normalizePath(link.getAttribute("href"));
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path); // update URL
      loadContent(path); // fetch konten & CSS
    }
  });
});


// Back/forward browser
window.addEventListener("popstate", () => {
  loadContent(window.location.pathname);
});

// Load pertama kali
loadContent(window.location.pathname);
