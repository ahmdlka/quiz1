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
    <div class="row justify-content-center mt-5 error-container">
      <div class="col-md-6 text-center">
        <h1 class="display-1 fw-bold error-heading">404</h1>
        <p class="lead error-lead">Page Not Found</p>
        <p class="error-text">The requested path "${path}" does not exist.</p>
        <a href="/quiz1" class="btn btn-primary error-btn">Go to Home</a>
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

// Food Hover Effect - Blur others on hover
function initFoodHover() {
  const foodItems = document.querySelectorAll('.food-item');
  
  foodItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      foodItems.forEach(other => {
        if (other !== item) {
          other.classList.add('blurred');
        }
      });
      item.classList.add('focused');
      item.classList.remove('blurred');
    });
    
    item.addEventListener('mouseleave', () => {
      foodItems.forEach(other => {
        other.classList.remove('blurred');
      });
      item.classList.remove('focused');
    });
  });
}
// Panggil init setelah load konten food
// Di fungsi loadPage, setelah content.innerHTML = ..., tambah:
if (window.location.pathname.includes('/food')) {
  initFoodHover();
}

// Profile Animations - Dengan fallback anti-hilang
function initProfileAnimations() {
  const container = document.querySelector('.profile-container');
  const sections = document.querySelectorAll('.profile-section');
  let observer = null;

  // Disable no-js fallback setelah JS load
  document.documentElement.classList.remove('no-js');

  // Initial Load: Tambah .loaded dan hidden class untuk anim
  if (container) {
    // Sembunyikan sections untuk animasi (jika JS aktif)
    sections.forEach(section => section.classList.add('animate-hidden'));
    console.log('Profile: Initial hidden applied'); // Debug

    setTimeout(() => {
      container.classList.add('loaded');
      console.log('Profile: Loaded class added'); // Debug
    }, 100);
  }

  // Cek support IntersectionObserver
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('animate-hidden');
          entry.target.classList.add('animate-in');
          console.log('Profile: Animate-in triggered for', entry.target); // Debug
        } else {
          entry.target.classList.add('animate-hidden');
          entry.target.classList.remove('animate-in');
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
    console.log('Profile: Observer initialized'); // Debug
  } else {
    // Fallback: Tampilkan semua setelah delay jika no support
    console.warn('Profile: No IntersectionObserver, fallback to visible');
    setTimeout(() => {
      sections.forEach(section => {
        section.classList.remove('animate-hidden');
        section.classList.add('animate-in');
      });
    }, 500);
  }

  // Cleanup function untuk SPA (panggil saat route change)
  return () => {
    if (observer) observer.disconnect();
    console.log('Profile: Cleanup observer'); // Debug
  };
}

// Integrasi di loadPage (contoh lengkap untuk route 'profile')
function loadPage(path) {
  const content = document.getElementById('content'); // Asumsi ID content
  let cleanup = null;

  if (path === 'profile') {
    fetch('/quiz1/templates/profile.html')
      .then(res => res.text())
      .then(html => {
        content.innerHTML = html;
        // Load CSS
        let pageStyle = document.getElementById('page-style');
        if (!pageStyle) {
          pageStyle = document.createElement('link');
          pageStyle.id = 'page-style';
          pageStyle.rel = 'stylesheet';
          document.head.appendChild(pageStyle);
        }
        pageStyle.href = '/quiz1/styles/profile.css';
        
        // Init animasi
        cleanup = initProfileAnimations();
        
        // Update URL jika SPA
        history.pushState({path: path}, '', '/quiz1/profile');
      })
      .catch(err => {
        console.error('Profile load error:', err);
        content.innerHTML = '<p>Error loading profile. Check console.</p>';
      });
  }

  // Saat route change (misalnya popstate listener), panggil cleanup jika ada
  window.addEventListener('popstate', (e) => {
    if (cleanup) cleanup();
  });
}
