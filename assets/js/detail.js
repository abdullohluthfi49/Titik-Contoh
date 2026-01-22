/* =========================================================
   TITIK FIKSI — Detail Controller
   File: assets/js/detail.js

   Cara kerja:
   - Ambil slug dari nama file detail (.html)
   - Cari di JSON
   - Tampilkan isi
   ========================================================= */

const TitikFiksiDetail = (() => {

  // Karena halaman detail berada di folder pages/...
  // maka akses JSON harus naik 2 tingkat: ../../
  const PATHS = {
    works: "../../content/works/works.json",
    writings: "../../content/writings/writings.json"
  };

  const Utils = {
    async fetchJSON(path) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal load JSON: " + path);
        return await res.json();
      } catch (e) {
        console.error(e);
        return null;
      }
    },

    safeText(value, fallback = "-") {
      const v = (value ?? "").toString().trim();
      return v !== "" ? v : fallback;
    },

    getCover(coverUrl) {
      if (coverUrl && String(coverUrl).trim() !== "") return coverUrl;
      return "../../assets/images/defaults/cover-default.jpg";
    },

    getSlugFromFilename() {
      const path = window.location.pathname;
      const file = path.split("/").pop() || "";
      return file.replace(".html", "").toLowerCase();
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
    }
  };

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value ?? "";
  }

  function setHTML(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = value ?? "";
  }

  function showNotFound(type = "konten") {
    const box = document.getElementById("detail-box");
    if (!box) return;

    box.innerHTML = `
      <div class="glass-card" style="padding:18px;">
        <h2 style="margin-top:0;">Konten tidak ditemukan</h2>
        <p style="color: var(--muted); line-height:1.7;">
          Maaf, ${type} ini belum tersedia atau slug tidak cocok dengan JSON.
        </p>
        <a href="../../index.html" class="btn btn-primary">⬅️ Kembali ke Beranda</a>
      </div>
    `;
  }

  async function initWorkDetail() {
    const slug = Utils.getSlugFromFilename();
    const data = await Utils.fetchJSON(PATHS.works);
    if (!data) return showNotFound("novel");

    const works = data.works || [];
    const work = works.find((x) => (x.slug || "").toLowerCase() === slug);

    if (!work) return showNotFound("novel");

    document.title = `${work.title || "Detail Novel"} | Titik Fiksi`;

    setText("work-title", Utils.safeText(work.title, "Judul belum diisi"));
    setHTML("work-genre", `📌 ${Utils.safeText(work.genre, "Genre belum diisi")}`);
    setHTML("work-status", `✅ ${Utils.safeText(work.status, "Ongoing")}`);
    setText("work-synopsis", Utils.safeText(work.synopsis, "Sinopsis belum ditulis."));

    const cover = document.getElementById("work-cover-img");
    if (cover) {
      cover.src = Utils.getCover(work.cover);
      cover.alt = work.title || "Cover";
    }
  }

  async function initWritingDetail() {
    const slug = Utils.getSlugFromFilename();
    const data = await Utils.fetchJSON(PATHS.writings);
    if (!data) return showNotFound("tulisan");

    const writings = data.writings || [];
    const writing = writings.find((x) => (x.slug || "").toLowerCase() === slug);

    if (!writing) return showNotFound("tulisan");

    document.title = `${writing.title || "Detail Tulisan"} | Titik Fiksi`;

    setText("writing-title", Utils.safeText(writing.title, "Judul belum diisi"));

    const category = Utils.safeText(writing.category, "Umum");
    const date = Utils.formatDate(writing.date);
    setText("writing-meta", `${category}${date ? " • " + date : ""}`);

    setText("writing-content", Utils.safeText(writing.content, "Belum ada isi tulisan."));
  }

  function init() {
    const type = document.body.getAttribute("data-detail-type");
    if (type === "work") initWorkDetail();
    if (type === "writing") initWritingDetail();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  TitikFiksiDetail.init();
});
