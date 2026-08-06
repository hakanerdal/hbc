#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASK_ROOT = path.resolve(__dirname, '..');
const CALISMALAR_DIR = path.join(TASK_ROOT, 'calismalarim');
const META_JS = path.join(TASK_ROOT, 'js', 'calismalar-meta.js');
const BOOTSTRAP_JS = '../../assets/bootstrap-5.0.2-dist/js/bootstrap.bundle.min.js';
const MOCK_SHELL_TEMPLATE = path.join(TASK_ROOT, 'templates', 'mock-shell.css');

const SLUG_RE = /^[a-z][a-z0-9_]*$/;

function normalizeMenuYer(menuYer) {
  return menuYer === 'ust' ? 'ust' : 'sol';
}

function menuYerLabel(menuYer) {
  return normalizeMenuYer(menuYer) === 'ust' ? 'üst' : 'sol';
}

function copyMockShellTemplate(calismaDir) {
  if (!fs.existsSync(MOCK_SHELL_TEMPLATE)) {
    throw new Error('Mock shell şablonu bulunamadı: templates/mock-shell.css');
  }
  fs.copyFileSync(MOCK_SHELL_TEMPLATE, path.join(calismaDir, 'mockup', 'mock-shell.css'));
}

function writeCalismaJson(calismaDir, data) {
  fs.writeFileSync(
    path.join(calismaDir, 'calisma.json'),
    JSON.stringify(data, null, 2) + '\n',
    'utf8'
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function indexHtml(slug, label, desc, menuYer) {
  const L = escapeHtml(label);
  const D = escapeHtml(desc);
  const menuLabel = menuYerLabel(menuYer);
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${L} | Çalışmalarım</title>
  <link rel="stylesheet" href="../../css/style.css" />
  <style>
    .tile { display: block; background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 1rem; text-decoration: none; color: inherit; margin-bottom: 0.5rem; }
    .tile:hover { border-color: var(--accent); }
    .tile strong { color: var(--accent); }
    .tile span { display: block; font-size: 0.8rem; color: var(--muted); margin-top: 0.2rem; }
    .empty-note { font-size: 0.88rem; color: var(--muted); background: #f5f7fa; border: 1px dashed var(--border); border-radius: 8px; padding: 1rem; }
  </style>
</head>
<body>
<div class="layout">
  <nav id="sidebar"></nav>
  <main>
    <h1>${L}</h1>

    <div class="calisma-amac-panel" id="calisma-amac-panel">
      <h2 class="calisma-amac-heading">Amaç</h2>
      <p class="calisma-amac" id="calisma-amac">${D}</p>
    </div>

    <div class="calisma-durum-bar" id="calisma-durum-bar"></div>

    <div class="lead">
      Yeni çalışma. Mockup uygulama menüsü <strong>${menuLabel}</strong> konumda planlandı.
      Sol menüden <strong>Ekranlar</strong> sayfasında <strong>+ Yeni ekran</strong> sihirbazını kullanarak
      <strong>mockup</strong> oluşturun; onay sonrası <strong>task metinleri</strong> eklenecek.
    </div>
    <h2>Mockup'lar</h2>
    <p class="empty-note">Henüz mockup yok. Sol menüden <strong>Ekranlar</strong> sayfasında <strong>+ Yeni ekran</strong> sihirbazını kullanın.</p>
    <h2>Jira</h2>
    <a class="tile" href="isler.html"><strong>Task metinleri</strong><span>Mockup onayından sonra doldurulacak</span></a>
  </main>
</div>
<script>
window.TASK_HUB = {
  taskRoot: '../..',
  page: 'calisma-ozet',
  calisma: {
    id: ${JSON.stringify(slug)},
    label: ${JSON.stringify(label)},
    base: '.',
    menuYer: ${JSON.stringify(normalizeMenuYer(menuYer))},
    mockups: [],
    islerHref: 'isler.html'
  }
};
</script>
<script src="../../js/sunum-query.js"></script>
<script src="../../js/calismalar-meta.js"></script>
<script src="../../js/calisma-ozet.js"></script>
<script src="../../js/rapor-widgets.js"></script>
<script src="../../js/calisma-cursor.js"></script>
<script src="../../js/nav.js"></script>
</body>
</html>
`;
}

function ekranlarHtml(slug, label, menuYer) {
  const L = escapeHtml(label);
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ekranlar — ${L}</title>
  <link rel="stylesheet" href="../../css/style.css" />
  <link rel="stylesheet" href="../../css/mock-bootstrap.css" />
</head>
<body>
<div class="layout">
  <nav id="sidebar"></nav>
  <main>
    <h1>Ekranlar</h1>
    <p class="subtitle">${L} — mockup ekranları</p>
    <div class="lead">
      Mevcut mockup'lara tıklayarak önizleyin. <strong>+ Yeni ekran</strong> ile adım adım soruları yanıtlayın;
      Cursor metnini kopyalayıp sohbete yapıştırın.
    </div>
    <div class="ekran-toolbar">
      <button type="button" class="calisma-action-btn calisma-action-btn--primary" id="btn-yeni-ekran">+ Yeni ekran</button>
    </div>
    <p class="empty-note" id="ekran-empty">Henüz mockup yok. İlk ekranınızı eklemek için <strong>+ Yeni ekran</strong> kullanın.</p>
    <div id="ekran-list"></div>
  </main>
</div>
<script>
window.TASK_HUB = {
  taskRoot: '../..',
  page: 'calisma-ekranlar',
  calisma: {
    id: ${JSON.stringify(slug)},
    label: ${JSON.stringify(label)},
    base: '.',
    menuYer: ${JSON.stringify(normalizeMenuYer(menuYer))},
    mockups: [],
    islerHref: 'isler.html'
  }
};
</script>
<script src="../../js/sunum-query.js"></script>
<script src="${BOOTSTRAP_JS}"></script>
<script src="https://cdn.jsdelivr.net/npm/tom-select@2.4.3/dist/js/tom-select.complete.min.js"></script>
<script src="../../js/mock-tom-select.js"></script>
<script src="../../js/calismalar-meta.js"></script>
<script src="../../js/rapor-widgets.js"></script>
<script src="../../js/calisma-cursor.js"></script>
<script src="../../js/ekran-wizard.js"></script>
<script src="../../js/ekranlar-page.js"></script>
<script src="../../js/nav.js"></script>
</body>
</html>
`;
}

function islerHtml(label) {
  const L = escapeHtml(label);
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${L} — Jira Task Metinleri</title>
  <link rel="stylesheet" href="../../css/style.css" />
  <style>
    .task-tabs { display: flex; gap: 0.35rem; margin: 1rem 0 0; border-bottom: 2px solid var(--border); }
    .task-tab { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.55rem 1rem; font-size: 0.85rem; font-weight: 600; color: var(--muted); border: none; background: none; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; border-radius: 6px 6px 0 0; }
    .task-tab.active { color: var(--accent); border-bottom-color: var(--accent); background: #fff; }
    .tab-chip { display: inline-flex; align-items: center; justify-content: center; min-width: 1.35rem; height: 1.35rem; padding: 0 0.35rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; }
    .tab-chip-be { background: #e3f2fd; color: #1565c0; }
    .tab-chip-fe { background: #e8f5e9; color: #2e7d32; }
    .task-tab.active .tab-chip-be { background: #1565c0; color: #fff; }
    .task-tab.active .tab-chip-fe { background: #2e7d32; color: #fff; }
    .tab-panel { padding-top: 1rem; }
    .tab-panel[hidden] { display: none !important; }
    .empty-note { font-size: 0.88rem; color: var(--muted); background: #f5f7fa; border: 1px dashed var(--border); border-radius: 8px; padding: 1rem; }
  </style>
</head>
<body>
<div class="layout layout--isler">
  <nav id="sidebar"></nav>
  <main class="isler-main" id="isler-main">
    <h1>${L} — Jira task metinleri</h1>
    <p class="subtitle">Mockup onaylandıktan sonra task kutuları buraya eklenecek.</p>
    <div class="task-tabs" role="tablist">
      <button type="button" class="task-tab active" data-tab="be" id="tab-be">Backend <span class="tab-chip tab-chip-be" id="chip-be">0</span></button>
      <button type="button" class="task-tab" data-tab="fe" id="tab-fe">Frontend <span class="tab-chip tab-chip-fe" id="chip-fe">0</span></button>
    </div>
    <div class="tab-panel" id="panel-be" data-tab-panel="be">
      <p class="empty-note">Henüz task yok. Önce mockup'ları tarayıcıda kontrol edip onaylayın; ardından Cursor'a «mockup'ları onaylıyorum, Jira task metinlerini yaz» deyin. <a href="../../module-creator/is-analisti.html#prompt-onay">Başlangıç rehberi</a></p>
    </div>
    <div class="tab-panel" id="panel-fe" data-tab-panel="fe" hidden>
      <p class="empty-note">Henüz task yok. Mockup onayından sonra task metinleri buraya eklenecek.</p>
    </div>
  </main>
  <aside class="isler-toc-wrap" id="isler-toc" aria-label="Task listesi"></aside>
</div>
<script>
window.TASK_HUB = {
  taskRoot: '../..',
  page: 'calisma-isler',
  calisma: { label: ${JSON.stringify(label)}, base: '.', mockups: [], islerHref: 'isler.html' }
};
(function () {
  function switchTab(name) {
    document.querySelectorAll('.task-tab').forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === name;
      btn.classList.toggle('active', on);
    });
    document.querySelectorAll('[data-tab-panel]').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-tab-panel') !== name;
    });
  }
  document.querySelectorAll('.task-tab').forEach(function (btn) {
    btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-tab')); });
  });
})();
</script>
<script src="../../js/sunum-query.js"></script>
<script src="../../js/isler-mockups.js"></script>
<script src="../../js/isler-copy.js"></script>
<script src="../../js/isler-task-edit.js"></script>
<script src="../../js/isler-toc.js"></script>
<script src="../../js/nav.js"></script>
</body>
</html>
`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function appendToMeta(slug, label, desc, menuYer) {
  let metaSrc = fs.readFileSync(META_JS, 'utf8');
  if (metaSrc.includes("id: '" + slug + "'") || metaSrc.includes('id: "' + slug + '"')) {
    throw new Error('Bu klasör adı zaten listede: ' + slug);
  }
  const yer = normalizeMenuYer(menuYer);
  const entry =
    '  {\n' +
    "    id: '" + slug + "',\n" +
    "    label: '" + label.replace(/'/g, "\\'") + "',\n" +
    "    desc: '" + desc.replace(/'/g, "\\'") + "',\n" +
    "    eklendi: '" + todayISO() + "',\n" +
    "    menuYer: '" + yer + "',\n" +
    "    durum: 'mockup-taslak',\n" +
    '    mockupSayisi: 0,\n' +
    '    taskBe: 0,\n' +
    '    taskFe: 0,\n' +
    "    icon: '📁'\n" +
    '  }';
  if (!/window\.HBC_CALISMALAR = \[[\s\S]*?\n\];/.test(metaSrc)) {
    throw new Error('HBC_CALISMALAR bulunamadı (js/calismalar-meta.js)');
  }
  metaSrc = metaSrc.replace(/window\.HBC_CALISMALAR = \[\n/, 'window.HBC_CALISMALAR = [\n' + entry + ',\n');
  fs.writeFileSync(META_JS, metaSrc, 'utf8');
}

export function scaffoldCalisma({ slug, label, desc, menuYer = 'sol' }) {
  if (!SLUG_RE.test(slug)) {
    throw new Error('Geçersiz klasör adı. Küçük harf, rakam ve alt çizgi; harf ile başlamalı.');
  }
  const yer = normalizeMenuYer(menuYer);
  const dir = path.join(CALISMALAR_DIR, slug);
  if (fs.existsSync(dir)) {
    throw new Error('Klasör zaten var: calismalarim/' + slug);
  }
  fs.mkdirSync(path.join(dir, 'mockup'), { recursive: true });
  copyMockShellTemplate(dir);
  writeCalismaJson(dir, { id: slug, label, desc, menuYer: yer });
  fs.writeFileSync(path.join(dir, 'index.html'), indexHtml(slug, label, desc, yer), 'utf8');
  fs.writeFileSync(path.join(dir, 'ekranlar.html'), ekranlarHtml(slug, label, yer), 'utf8');
  fs.writeFileSync(path.join(dir, 'isler.html'), islerHtml(label), 'utf8');
  appendToMeta(slug, label, desc, yer);
  return { slug, label, desc, menuYer: yer, path: 'calismalarim/' + slug };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const slug = process.argv[2];
  const label = process.argv[3];
  const desc = process.argv[4] || label;
  const menuYer = process.argv[5] || 'sol';
  if (!slug || !label) {
    console.error('Kullanım: node scripts/scaffold-calisma.mjs <klasor_adi> "<Görünen ad>" "<Açıklama>" [sol|ust]');
    process.exit(1);
  }
  try {
    const r = scaffoldCalisma({ slug, label, desc, menuYer });
    console.log('Oluşturuldu:', r.path);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
