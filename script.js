const content = document.getElementById("content");
const pageStyle = document.getElementById("page-style");

// Definisikan route beserta file HTML dan CSS
const routes = {
  "/quiz1": { html: "templates/home.html", css: "styles/home.css" },
  "/quiz1/profile": { html: "templates/profile.html", css: "styles/profile.css" },
  "/quiz1/hometown": { html: "templates/hometown.html", css: "styles/hometown.css" },
  "/quiz1/food": { html: "templates/food.html", css: "styles/food.css" },
  "/quiz1/tourist": { html: "templates/tourist.html", css: "styles/tourist.css" },
};

// Fungsi load konten + CSS
async function loadContent(path) {
  const route = routes[path] || routes["/quiz1"];
  try {
    console.log(route.html);
    const res = await fetch(route.html);
    const html = await res.text();
    content.innerHTML = html;
    pageStyle.setAttribute("href", route.css); // ganti CSS sesuai halaman
  } catch (err) {
    content.innerHTML = "<h2>404 Page Not Found</h2>";
    pageStyle.setAttribute("href", ""); // hapus CSS jika tidak ada
  }
}

// Handle klik link
document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const path = link.getAttribute("href");
    window.history.pushState({}, "", path);
    loadContent(path);
  });
});
 
// Back/forward browser
window.addEventListener("popstate", () => {
  loadContent(window.location.pathname);
});

// Load pertama kali
loadContent(window.location.pathname);
