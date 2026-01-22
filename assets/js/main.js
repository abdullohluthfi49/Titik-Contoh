/* =========================================================
   TITIK FIKSI — Main Controller (Final Version)
   Fungsi: Mengatur tampilan Novel, Bab, dan Navigasi
   ========================================================= */

const TitikFiksi = (() => {
  // Konfigurasi Path File
  const PATHS = {
    works: "content/works/works.json",
    writings: "content/writings/writings.json",
    chaptersDir: "content/chapters/" // Folder tempat bab disimpan
  };

  // --- Utility Functions (Alat Bantu) ---
  const Utils = {
    // Mengambil parameter URL (?slug=...)
    getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    },

    // Format tanggal Indonesia
    formatDate(dateString) {
      if (!dateString) return "";
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    },

    // Fetch JSON data aman
    async fetchJSON(path) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        console.error("Gagal load:", path);
        return null;
      }
    },

    // Tampilkan elemen
    show(id) {
      const el = document.getElementById(id);
      if (el) el.style.display = "block";
    },
    
    // Sembunyikan elemen
    hide(id) {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    },

    // Set Text Content
    setText(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    },

    // Render Markdown sederhana ke HTML (untuk paragraf)
    renderMarkdown(text) {
      if (!text) return "";
      // Ubah baris baru jadi <br> atau <p>
      return text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
        .replace(/\*(.*?)\*/g, '<i>$1</i>');    // Italic
    }
  };

  /* =======================================================
     1. LOGIKA HALAMAN DETAIL NOVEL (novel.html)
     ======================================================= */
  async function initNovelDetail() {
    const slug = Utils.getQueryParam("slug");
    if (!slug) {
      alert("Novel tidak ditemukan (URL salah).");
      window.location.href = "works.html";
      return;
    }

    // 1. Ambil data Novel (Judul, Sinopsis, dll)
    const data = await Utils.fetchJSON(PATHS.works);
    if (!data || !data.works) return;

    const novel = data.works.find(w => w.slug === slug);
    if (!novel) {
      Utils.setText("work-title", "Novel Tidak Ditemukan");
      return;
    }

    // Render Info Novel
    document.title = `${novel.title} | Titik Fiksi`;
    Utils.setText("work-title", novel.title);
    Utils.setText("work-genre", `📌 ${novel.genre}`);
    Utils.setText("work-status", `✅ ${novel.status}`);
    Utils.setText("work-synopsis", novel.synopsis);
    
    const imgEl = document.getElementById("work-cover-img");
    if (imgEl && novel.cover) imgEl.src = novel.cover;

    // 2. SCANNING BAB (Mencari file bab secara otomatis)
    // Karena ini static hosting, kita akan coba fetch file:
    // slug-01.json, slug-02.json, dst sampai error (404).
    
    const listContainer = document.getElementById("chapters-list");
    listContainer.innerHTML = '<p class="loading-text">Memuat daftar bab...</p>';
    
    let chapterCount = 1;
    let foundChapters = [];
    let keepSearching = true;

    // Kita batasi pencarian max 200 bab agar browser tidak hang jika error
    while (keepSearching && chapterCount <= 200) {
      // Format kode harus 2 digit: 01, 02, ... 10, 11
      const code = String(chapterCount).padStart(2, '0');
      const filename = `${slug}-${code}.json`;
      const path = `${PATHS.chaptersDir}${filename}`;

      const chapterData = await Utils.fetchJSON(path);

      if (chapterData) {
        // Jika file ada
        if (chapterData.published !== false) {
           foundChapters.push({ ...chapterData, code: code });
        }
        chapterCount++;
      } else {
        // Jika file tidak ditemukan (404), berhenti mencari
        // TAPI: Kita coba cek 1 angka lagi ke depan jaga-jaga kalau ada loncat (misal 01 ada, 02 hilang, 03 ada)
        // Kalau mau ketat (berhenti saat 404), uncomment baris bawah:
        // keepSearching = false; 
        
        // Versi toleransi: Coba skip max 3 kosong, kalau 3x berturut kosong baru stop.
        // Untuk simpelnya sekarang, kita stop jika file urutan tidak ada.
        keepSearching = false; 
      }
    }

    // Render Daftar Bab
    listContainer.innerHTML = "";
    if (foundChapters.length === 0) {
      listContainer.innerHTML = '<div class="empty-state">Belum ada bab yang dirilis.</div>';
    } else {
      foundChapters.forEach(chap => {
        const item = document.createElement("a");
        item.className = "chapter-item glass-panel";
        item.href = `chapter.html?novel=${slug}&chapter=${chap.code}`;
        item.innerHTML = `
          <div class="chap-num">#${chap.code}</div>
          <div class="chap-info">
            <strong>${chap.title || 'Tanpa Judul'}</strong>
            <span>${Utils.formatDate(chap.date)}</span>
          </div>
        `;
        listContainer.appendChild(item);
      });
    }
  }

  /* =======================================================
     2. LOGIKA HALAMAN BACA BAB (chapter.html)
     ======================================================= */
  async function initReadChapter() {
    const novelSlug = Utils.getQueryParam("novel");
    const chapCode = Utils.getQueryParam("chapter");

    if (!novelSlug || !chapCode) {
      window.location.href = "works.html";
      return;
    }

    // Load File Bab Spesifik
    const filename = `${novelSlug}-${chapCode}.json`;
    const path = `${PATHS.chaptersDir}${filename}`;
    
    const data = await Utils.fetchJSON(path);

    if (!data) {
      Utils.setText("chapter-title", "Bab tidak ditemukan atau belum terbit.");
      return;
    }

    // Render Konten
    document.title = `${data.title} | Baca Novel`;
    Utils.setText("chapter-top", `Chapter ${chapCode}`);
    Utils.setText("chapter-title", data.title);
    
    const contentBox = document.getElementById("chapter-content");
    // Gunakan Markdown renderer atau text biasa
    contentBox.innerHTML = `<p>${Utils.renderMarkdown(data.content)}</p>`;

    // Atur Tombol Navigasi (Next / Prev / Back)
    const btnBack = document.getElementById("btn-back-novel");
    btnBack.href = `novel.html?slug=${novelSlug}`;

    const prevCode = String(parseInt(chapCode) - 1).padStart(2, '0');
    const nextCode = String(parseInt(chapCode) + 1).padStart(2, '0');

    // Cek tombol Prev
    const btnPrev = document.getElementById("btn-prev");
    if (parseInt(chapCode) > 1) {
       btnPrev.href = `chapter.html?novel=${novelSlug}&chapter=${prevCode}`;
       btnPrev.style.display = "inline-flex";
    } else {
       btnPrev.style.display = "none";
    }

    // Cek tombol Next (Cek apakah file next ada)
    const btnNext = document.getElementById("btn-next");
    const nextPath = `${PATHS.chaptersDir}${novelSlug}-${nextCode}.json`;
    const nextExist = await Utils.fetchJSON(nextPath);
    
    if (nextExist) {
      btnNext.href = `chapter.html?novel=${novelSlug}&chapter=${nextCode}`;
      btnNext.style.display = "inline-flex";
    } else {
      btnNext.style.display = "none"; // Sembunyikan jika bab terakhir
    }
  }

  // --- Router Sederhana ---
  function init() {
    const path = window.location.pathname;
    if (path.includes("novel.html")) {
      initNovelDetail();
    } else if (path.includes("chapter.html")) {
      initReadChapter();
    }
    // Halaman Works dan Writings sudah pakai load statis via HTML 
    // atau bisa ditambahkan logic load JSON di sini jika mau full dinamis nanti.
  }

  return { init, Utils };
})();

// Jalankan saat halaman siap
document.addEventListener("DOMContentLoaded", TitikFiksi.init);