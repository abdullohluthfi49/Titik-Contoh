/* =========================================================
   TITIK FIKSI — Main Controller (FINAL + Novel/Chapter PRO)
   File: assets/js/main.js
   ========================================================= */

const TitikFiksi = (() => {
  const PATHS = {
    settings: "content/settings/settings_general.json",
    home: "content/home/home.json",
    works: "content/works/works.json",
    writings: "content/writings/writings.json",
    chaptersFolder: "content/chapters/"
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
    },

    qs(key) {
      const url = new URL(window.location.href);
      return url.searchParams.get(key);
    },

    setVisible(el, visible) {
      if (!el) return;
      el.style.display = visible ? "block" : "none";
    },

    // ✅ ubah text bab menjadi paragraf HTML rapi
    toParagraphHTML(text) {
      const raw = (text ?? "").toString().trim();
      if (!raw) return "<p>(Bab ini belum memiliki isi)</p>";

      // normalisasi newline
      const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

      // split berdasarkan 2 newline (paragraf)
      const paras = normalized.split("\n\n").map(p => p.trim()).filter(Boolean);

      // escape HTML supaya aman
      const escape = (s) =>
        s.replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;");

      return paras
        .map(p => `<p>${escape(p).replace(/\n/g, "<br>")}</p>`)
        .join("");
    }
  };

  async function applyBranding() {
    const settings = await Utils.fetchJSON(PATHS.settings);
    if (!settings) return;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings.meta_description) {
      metaDesc.setAttribute("content", settings.meta_description);
    }

    const logoUrl = Utils.safeText(settings.brand_logo, "");
    if (logoUrl) {
      document.querySelectorAll('img[data-brand="logo"]').forEach((img) => {
        img.src = logoUrl;
        img.style.display = "block";
      });
    }

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
      iframe.style.display = yt ? "block" : "none";
      if (yt) iframe.src = yt;
    }
  }

  function buildWorkCard(work) {
    const title = Utils.safeText(work?.title, "Judul belum diisi");
    const genre = Utils.safeText(work?.genre, "Genre belum diisi");
    const status = Utils.safeText(work?.status, "Ongoing");
    const synopsis = Utils.safeText(work?.synopsis, "Sinopsis belum ditulis.");
    const cover = Utils.getCover(work?.cover);

    const slug = Utils.safeText(work?.slug, "").toLowerCase();
    const detailUrl = slug ? `novel.html?slug=${encodeURIComponent(slug)}` : null;

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

  async function initNovelDetailPage() {
    const detailBox = document.getElementById("novel-detail");
    if (!detailBox) return;

    const slug = (Utils.qs("slug") || "").trim().toLowerCase();
    const errorBox = document.getElementById("novel-error");

    if (!slug) {
      errorBox.innerHTML = `❌ Novel tidak ditemukan. Link tidak memiliki <b>slug</b>.`;
      Utils.setVisible(errorBox, true);
      return;
    }

    const worksData = await Utils.fetchJSON(PATHS.works);
    if (!worksData) {
      errorBox.innerHTML = `❌ Gagal memuat data novel.`;
      Utils.setVisible(errorBox, true);
      return;
    }

    const works = worksData.works || [];
    const novel = works.find(w => (w.slug || "").toLowerCase() === slug);

    if (!novel) {
      errorBox.innerHTML = `❌ Novel dengan slug <b>${slug}</b> tidak ditemukan.`;
      Utils.setVisible(errorBox, true);
      return;
    }

    document.getElementById("novel-title").textContent = Utils.safeText(novel.title, "Judul belum diisi");
    document.getElementById("novel-genre").textContent = "📌 " + Utils.safeText(novel.genre, "Genre");
    document.getElementById("novel-status").textContent = "✅ " + Utils.safeText(novel.status, "Ongoing");
    document.getElementById("novel-synopsis").textContent = Utils.safeText(novel.synopsis, "Sinopsis belum ditulis.");
    document.getElementById("novel-cover").src = Utils.getCover(novel.cover);

    const chapterPath = `${PATHS.chaptersFolder}${slug}.json`;
    const chapterData = await Utils.fetchJSON(chapterPath);

    const listEl = document.getElementById("chapters-list");
    const searchEl = document.getElementById("chapter-search");

    if (!chapterData || !Array.isArray(chapterData.chapters)) {
      listEl.innerHTML = `<div class="glass-card" style="padding:14px;">Belum ada bab untuk novel ini.</div>`;
      Utils.setVisible(detailBox, true);
      return;
    }

    const publishedChapters = chapterData.chapters
      .filter(ch => ch && ch.published === true)
      .sort((a, b) => (a.code || "").localeCompare(b.code || ""));

    if (publishedChapters.length === 0) {
      listEl.innerHTML = `<div class="glass-card" style="padding:14px;">Bab belum dipublikasikan.</div>`;
      Utils.setVisible(detailBox, true);
      return;
    }

    const first = publishedChapters[0];
    document.getElementById("btn-read-first").href =
      `chapter.html?novel=${encodeURIComponent(slug)}&chapter=${encodeURIComponent(first.code)}`;

    function renderList(filterText = "") {
      const ft = (filterText || "").trim().toLowerCase();

      const filtered = publishedChapters.filter(ch => {
        const code = (ch.code || "").toLowerCase();
        const title = (ch.title || "").toLowerCase();
        return code.includes(ft) || title.includes(ft);
      });

      listEl.innerHTML = filtered.map(ch => {
        const code = Utils.safeText(ch.code, "--");
        const title = Utils.safeText(ch.title, "Judul bab belum diisi");
        const date = Utils.formatDate(ch.date);
        const url = `chapter.html?novel=${encodeURIComponent(slug)}&chapter=${encodeURIComponent(code)}`;

        return `
          <div class="glass-card" style="padding:14px; display:flex; justify-content:space-between; gap:10px; align-items:center;">
            <div>
              <div style="color:var(--muted); font-size:13px;">Bab ${code}${date ? " • " + date : ""}</div>
              <div style="font-weight:800;">${title}</div>
            </div>
            <a class="btn btn-primary" href="${url}">Baca</a>
          </div>
        `;
      }).join("");

      if (filtered.length === 0) {
        listEl.innerHTML = `<div class="glass-card" style="padding:14px;">Tidak ada bab yang cocok.</div>`;
      }
    }

    renderList("");

    if (searchEl) {
      searchEl.addEventListener("input", (e) => renderList(e.target.value));
    }

    Utils.setVisible(detailBox, true);
  }

  async function initChapterPage() {
    const chapterBox = document.getElementById("chapter-box");
    if (!chapterBox) return;

    const novelSlug = (Utils.qs("novel") || "").trim().toLowerCase();
    const code = (Utils.qs("chapter") || "").trim();
    const errorBox = document.getElementById("chapter-error");

    if (!novelSlug || !code) {
      errorBox.innerHTML = `❌ Link bab tidak lengkap. Pastikan ada <b>novel</b> dan <b>chapter</b>.`;
      Utils.setVisible(errorBox, true);
      return;
    }

    const chapterPath = `${PATHS.chaptersFolder}${novelSlug}.json`;
    const chapterData = await Utils.fetchJSON(chapterPath);

    if (!chapterData || !Array.isArray(chapterData.chapters)) {
      errorBox.innerHTML = `❌ Data bab untuk novel ini belum ada.`;
      Utils.setVisible(errorBox, true);
      return;
    }

    const publishedChapters = chapterData.chapters
      .filter(ch => ch && ch.published === true)
      .sort((a, b) => (a.code || "").localeCompare(b.code || ""));

    const current = publishedChapters.find(ch => String(ch.code) === String(code));

    if (!current) {
      errorBox.innerHTML = `❌ Bab <b>${code}</b> tidak ditemukan atau belum dipublikasikan.`;
      Utils.setVisible(errorBox, true);
      return;
    }

    const title = Utils.safeText(current.title, `Bab ${code}`);
    document.getElementById("chapter-top").textContent = `Novel: ${novelSlug} • Bab ${code}`;
    document.getElementById("chapter-title").textContent = title;

    // ✅ render jadi paragraf cantik (premium)
    document.getElementById("chapter-content").innerHTML = Utils.toParagraphHTML(current.content);

    document.getElementById("btn-back-novel").href = `novel.html?slug=${encodeURIComponent(novelSlug)}`;

    const idx = publishedChapters.findIndex(ch => String(ch.code) === String(code));
    const prev = idx > 0 ? publishedChapters[idx - 1] : null;
    const next = idx < publishedChapters.length - 1 ? publishedChapters[idx + 1] : null;

    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");

    if (prev) {
      btnPrev.href = `chapter.html?novel=${encodeURIComponent(novelSlug)}&chapter=${encodeURIComponent(prev.code)}`;
      btnPrev.style.display = "inline-flex";
    } else {
      btnPrev.style.display = "none";
    }

    if (next) {
      btnNext.href = `chapter.html?novel=${encodeURIComponent(novelSlug)}&chapter=${encodeURIComponent(next.code)}`;
      btnNext.style.display = "inline-flex";
    } else {
      btnNext.style.display = "none";
    }

    Utils.setVisible(chapterBox, true);
  }

  async function init() {
    await applyBranding();
    await initHomePage();
    await initWorksPage();
    await initWritingsPage();
    await initNovelDetailPage();
    await initChapterPage();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  TitikFiksi.init();
});
