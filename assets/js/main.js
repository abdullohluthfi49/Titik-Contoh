/* =========================================================
   TITIK FIKSI — Main Controller (FINAL)
   File: assets/js/main.js
   ========================================================= */

const TitikFiksi = (() => {
  const PATHS = {
    settings: "content/settings/settings_general.json",
    home: "content/home/home.json",
    works: "content/works/works.json",
    writings: "content/writings/writings.json"
  };

  const Utils = {
    async fetchJSON(path) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error(`Gagal load JSON: ${path}`);
        return await res.json();
      } catch (err) {
        console.error(err);
        return null;
      }
    },

    safeText(value, fallback = "") {
      const v = (value ?? "").toString().trim();
      return v !== "" ? v : fallback;
    },

    truncate(text, max = 160) {
      const t = (text ?? "").toString().trim();
      if (!t) return "";
      if (t.length <= max) return t;
      return t.slice(0, max) + "...";
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        });
      } catch {
        return dateStr;
      }
    },

    getCover(coverUrl) {
      if (coverUrl && String(coverUrl).trim() !== "") return coverUrl;
      return "assets/images/defaults/cover-default.jpg";
    }
  };

  async function applyBranding() {
    const settings = await Utils.fetchJSON(PATHS.settings);
    if (!settings) return;

    // Update Meta description if exists
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings.meta_description) {
      metaDesc.setAttribute("content", settings.meta_description);
    }

    // Logo
    const logoUrl = Utils.safeText(settings.brand_logo, "");
    if (logoUrl) {
      document.querySelectorAll('img[data-brand="logo"]').forEach((img) => {
        img.src = logoUrl;
        img.style.display = "block";
      });
    }

    // Favicon
    const faviconUrl = Utils.safeText(settings.brand_favicon, "");
    if (faviconUrl) {
      let link = document.querySelector('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  }

  async function initHomePage() {
    const heroTitleEl = document.getElementById("hero-title");
    if (!heroTitleEl) return;

    const home = await Utils.fetchJSON(PATHS.home);
    if (!home) return;

    document.getElementById("hero-title").textContent = home?.hero?.title || "Titik Fiksi";
    document.getElementById("hero-subtitle").textContent = home?.hero?.subtitle || "Novelis • Penulis";
    document.getElementById("intro-text").textContent = home?.hero?.intro || "";

    const iframe = document.getElementById("youtube-frame");
    if (iframe) {
      const yt = (home?.hero?.youtube_embed || "").trim();
      if (yt) {
        iframe.src = yt;
        iframe.style.display = "block";
      } else {
        iframe.style.display = "none";
      }
    }
  }

  function buildWorkCard(work) {
    const title = Utils.safeText(work?.title, "Judul belum diisi");
    const genre = Utils.safeText(work?.genre, "Genre belum diisi");
    const status = Utils.safeText(work?.status, "Ongoing");
    const synopsis = Utils.safeText(work?.synopsis, "Sinopsis belum ditulis.");
    const cover = Utils.getCover(work?.cover);

    const slug = Utils.safeText(work?.slug, "").toLowerCase();
    const detailUrl = slug ? `pages/works/${slug}.html` : null;

    return `
      <article class="glass-card work-card">
        <div class="work-cover">
          <img src="${cover}" alt="${title}" loading="lazy" />
        </div>

        <div class="work-meta">
          <span class="badge">📌 ${genre}</span>
          <span class="badge">✅ ${status}</span>
        </div>

        <h3 class="work-title">${title}</h3>
        <p class="work-desc">${Utils.truncate(synopsis, 170)}</p>

        <div class="work-actions">
          ${detailUrl ? `<a class="btn btn-primary" href="${detailUrl}">📖 Detail</a>` : ""}
        </div>
      </article>
    `;
  }

  async function initWorksPage() {
    const container = document.getElementById("works-container");
    if (!container) return;

    const data = await Utils.fetchJSON(PATHS.works);
    if (!data) {
      container.innerHTML = `<div class="glass-card" style="padding:16px;">Gagal memuat karya.</div>`;
      return;
    }

    const works = data.works || [];
    if (works.length === 0) {
      container.innerHTML = `<div class="glass-card" style="padding:16px;">Belum ada novel.</div>`;
      return;
    }

    container.innerHTML = works.map(buildWorkCard).join("");
  }

  function buildWritingCard(w) {
    const title = Utils.safeText(w?.title, "Judul belum diisi");
    const category = Utils.safeText(w?.category, "Umum");
    const date = Utils.formatDate(w?.date);
    const content = Utils.safeText(w?.content, "");

    const slug = Utils.safeText(w?.slug, "").toLowerCase();
    const detailUrl = slug ? `pages/writings/${slug}.html` : null;

    return `
      <article class="glass-card writing-card">
        <h3 class="writing-title">${title}</h3>
        <div class="writing-meta">🗂️ ${category}${date ? " • 📅 " + date : ""}</div>
        <div class="writing-body">${Utils.truncate(content, 200) || "Belum ada isi tulisan."}</div>

        <div class="work-actions" style="margin-top:12px;">
          ${detailUrl ? `<a class="btn btn-primary" href="${detailUrl}">📄 Baca</a>` : ""}
        </div>
      </article>
    `;
  }

  async function initWritingsPage() {
    const container = document.getElementById("writings-container");
    if (!container) return;

    const data = await Utils.fetchJSON(PATHS.writings);
    if (!data) {
      container.innerHTML = `<div class="glass-card" style="padding:16px;">Gagal memuat tulisan.</div>`;
      return;
    }

    const writings = data.writings || [];
    if (writings.length === 0) {
      container.innerHTML = `<div class="glass-card" style="padding:16px;">Belum ada tulisan.</div>`;
      return;
    }

    container.innerHTML = writings.map(buildWritingCard).join("");
  }

  async function init() {
    await applyBranding();
    await initHomePage();
    await initWorksPage();
    await initWritingsPage();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  TitikFiksi.init();
});
