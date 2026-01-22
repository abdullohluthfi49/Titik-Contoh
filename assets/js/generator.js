/* =========================================================
   TITIK FIKSI — Generator Detail Pages (FINAL)
   File: assets/js/generator.js

   Fungsi:
   - baca JSON works dan writings
   - generate file HTML detail sesuai slug
   - download file hasil generate
   ========================================================= */

(function () {
  const PATH_WORKS = "../content/works/works.json";
  const PATH_WRITINGS = "../content/writings/writings.json";

  const logBox = () => document.getElementById("logBox");

  function clearLog() {
    const box = logBox();
    if (!box) return;
    box.textContent = "";
    box.classList.remove("danger");
  }

  function log(text) {
    const box = logBox();
    if (!box) return;
    box.textContent += text + "\n";
  }

  function logError(text) {
    const box = logBox();
    if (!box) return;
    box.textContent += "❌ " + text + "\n";
    box.classList.add("danger");
  }

  async function fetchJSON(path) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil file: " + path);
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  function safeSlug(slug) {
    return String(slug || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\- ]/g, "")  // buang karakter aneh
      .replace(/\s+/g, "-");        // spasi jadi strip
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 300);
  }

  function templateWorkDetailHTML() {
    return `<!DOCTYPE html>
<html lang="id" data-theme="pearl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Detail Novel | Titik Fiksi</title>

  <link rel="stylesheet" href="../../assets/css/themes.css" />
  <link rel="stylesheet" href="../../assets/css/style.css" />
  <link rel="stylesheet" href="../../assets/css/detail.css" />
</head>

<body data-detail-type="work">

  <div class="navbar-wrap">
    <div class="container">
      <nav class="navbar glass-panel">
        <a class="brand" href="../../index.html">
          <div class="brand-logo">
            <img src="../../assets/images/logo/favicon.png" alt="Logo" onerror="this.style.display='none'">
          </div>
          <div class="brand-title">
            <strong>Titik Fiksi</strong>
            <span>Novelis • Penulis</span>
          </div>
        </a>

        <div class="nav-links">
          <a href="../../index.html">Beranda</a>
          <a href="../../works.html">Novel</a>
          <a href="../../writings.html">Tulisan</a>
          <a href="../../about.html">Tentang</a>
          <a href="../../contact.html">Kontak</a>
        </div>

        <div class="nav-actions">
          <button id="theme-toggle" class="theme-btn" type="button">
            <span class="theme-dot"></span>
            <span id="theme-label">Pearl Sky</span>
          </button>
        </div>
      </nav>
    </div>
  </div>

  <main class="section">
    <div class="container" id="detail-box">

      <div class="glass-card detail-wrap">
        <div class="detail-grid">

          <div class="detail-cover">
            <img id="work-cover-img" src="../../assets/images/defaults/cover-default.jpg" alt="Cover" />
          </div>

          <div>
            <h1 class="detail-title" id="work-title">Loading...</h1>

            <div class="detail-badges">
              <span class="badge" id="work-genre">📌 ...</span>
              <span class="badge" id="work-status">✅ ...</span>
            </div>

            <p class="detail-desc" id="work-synopsis">Loading...</p>

            <div class="detail-actions" style="margin-top:16px;">
              <a href="../../works.html" class="btn btn-soft">⬅️ Kembali</a>
            </div>
          </div>

        </div>
      </div>

    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-inner glass-panel">
        <div>© <span id="yearNow"></span> Titik Fiksi</div>
        <div><a href="../../admin/">Admin</a></div>
      </div>
    </div>
  </footer>

  <script src="../../assets/js/theme.js"></script>
  <script src="../../assets/js/detail.js"></script>
  <script>
    document.getElementById("yearNow").textContent = new Date().getFullYear();
  </script>
</body>
</html>`;
  }

  function templateWritingDetailHTML() {
    return `<!DOCTYPE html>
<html lang="id" data-theme="pearl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Detail Tulisan | Titik Fiksi</title>

  <link rel="stylesheet" href="../../assets/css/themes.css" />
  <link rel="stylesheet" href="../../assets/css/style.css" />
  <link rel="stylesheet" href="../../assets/css/detail.css" />
</head>

<body data-detail-type="writing">

  <div class="navbar-wrap">
    <div class="container">
      <nav class="navbar glass-panel">
        <a class="brand" href="../../index.html">
          <div class="brand-logo">
            <img src="../../assets/images/logo/favicon.png" alt="Logo" onerror="this.style.display='none'">
          </div>
          <div class="brand-title">
            <strong>Titik Fiksi</strong>
            <span>Novelis • Penulis</span>
          </div>
        </a>

        <div class="nav-links">
          <a href="../../index.html">Beranda</a>
          <a href="../../works.html">Novel</a>
          <a href="../../writings.html">Tulisan</a>
          <a href="../../about.html">Tentang</a>
          <a href="../../contact.html">Kontak</a>
        </div>

        <div class="nav-actions">
          <button id="theme-toggle" class="theme-btn" type="button">
            <span class="theme-dot"></span>
            <span id="theme-label">Pearl Sky</span>
          </button>
        </div>
      </nav>
    </div>
  </div>

  <main class="section">
    <div class="container" id="detail-box">

      <div class="glass-card detail-wrap">
        <h1 class="detail-title" id="writing-title">Loading...</h1>
        <div class="detail-article-meta" id="writing-meta">...</div>

        <div class="detail-article-content" id="writing-content">
          Loading...
        </div>

        <div class="detail-actions" style="margin-top:18px;">
          <a href="../../writings.html" class="btn btn-soft">⬅️ Kembali</a>
        </div>
      </div>

    </div>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-inner glass-panel">
        <div>© <span id="yearNow"></span> Titik Fiksi</div>
        <div><a href="../../admin/">Admin</a></div>
      </div>
    </div>
  </footer>

  <script src="../../assets/js/theme.js"></script>
  <script src="../../assets/js/detail.js"></script>
  <script>
    document.getElementById("yearNow").textContent = new Date().getFullYear();
  </script>
</body>
</html>`;
  }

  function checkDuplicateSlugs(list, label) {
    const seen = new Set();
    const dupes = new Set();

    list.forEach((item) => {
      const s = safeSlug(item.slug);
      if (!s) return;
      if (seen.has(s)) dupes.add(s);
      seen.add(s);
    });

    if (dupes.size > 0) {
      logError(`${label}: ada slug duplikat → ${Array.from(dupes).join(", ")}`);
      return false;
    }
    return true;
  }

  async function generate() {
    clearLog();
    log("Mulai generate halaman detail...");
    log("");

    const worksData = await fetchJSON(PATH_WORKS);
    const writingsData = await fetchJSON(PATH_WRITINGS);

    if (!worksData) {
      logError("works.json tidak bisa dibaca. Pastikan file ada di content/works/works.json");
      return;
    }

    if (!writingsData) {
      logError("writings.json tidak bisa dibaca. Pastikan file ada di content/writings/writings.json");
      return;
    }

    const works = worksData.works || [];
    const writings = writingsData.writings || [];

    if (works.length === 0 && writings.length === 0) {
      logError("Tidak ada data untuk dibuatkan halaman detail.");
      return;
    }

    // cek duplikat slug
    if (!checkDuplicateSlugs(works, "NOVEL")) return;
    if (!checkDuplicateSlugs(writings, "TULISAN")) return;

    // generate works
    log("📚 Generate NOVEL...");
    let countWorks = 0;

    works.forEach((w) => {
      const slug = safeSlug(w.slug);
      if (!slug) {
        logError("Ada novel yang slug-nya kosong. Isi slug dulu di Admin.");
        return;
      }
      const filename = `${slug}.html`;
      const html = templateWorkDetailHTML();
      downloadFile(filename, html);
      log(`✅ Dibuat: pages/works/${filename}`);
      countWorks++;
    });

    log("");

    // generate writings
    log("✍️ Generate TULISAN...");
    let countWritings = 0;

    writings.forEach((w) => {
      const slug = safeSlug(w.slug);
      if (!slug) {
        logError("Ada tulisan yang slug-nya kosong. Isi slug dulu di Admin.");
        return;
      }
      const filename = `${slug}.html`;
      const html = templateWritingDetailHTML();
      downloadFile(filename, html);
      log(`✅ Dibuat: pages/writings/${filename}`);
      countWritings++;
    });

    log("");
    log("Selesai ✅");
    log(`Total novel dibuat: ${countWorks}`);
    log(`Total tulisan dibuat: ${countWritings}`);
    log("");
    log("LANGKAH TERAKHIR:");
    log("Pindahkan file hasil download ke:");
    log("• Titik Fiksi/pages/works/");
    log("• Titik Fiksi/pages/writings/");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-generate");
    if (!btn) return;
    btn.addEventListener("click", generate);
  });
})();
