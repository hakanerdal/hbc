(function () {
  var cfg = window.TASK_HUB || { taskRoot: '.', page: 'home' };
  var t = (cfg.taskRoot || '.').replace(/\/$/, '');
  var CALISMALAR = window.HBC_CALISMALAR || [];
  var meta = window.HBC_CALISMA || {};
  var durumLabel = meta.durumLabel || function (k) { return k; };
  var ozetSatir = meta.ozetSatir || function (item) { return item.desc || ''; };
  var PAGE_SIZE = 12;

  var FILTERS = [
    { id: 'all', label: 'Tümü' },
    { id: 'mockup-taslak', label: 'Tasarım' },
    { id: 'onay-bekliyor', label: 'Onay' },
    { id: 'task-hazir', label: 'Hazır' },
    { id: 'iptal', label: 'İptal', muted: true }
  ];

  function isOrnek(item) {
    return !!(item.ornek || item.ornekRapor || item.ornekTumTurler);
  }

  function isIptal(item) {
    return item.durum === 'iptal';
  }

  var state = { filter: 'all', query: '', showAll: false };

  function searchKey(item) {
    return [item.id, item.label, item.desc].join(' ').toLowerCase();
  }

  function cardClass(item) {
    var cls = 'folder-card';
    if (item.ornekTumTurler) cls += ' folder-card-tum';
    if (item.ornek && !item.ornekRapor && !item.ornekTumTurler) cls += ' folder-card-ornek';
    if (item.ornekRapor) cls += ' folder-card-rapor';
    if (!isOrnek(item)) cls += ' folder-card-gercek';
    if (isIptal(item)) cls += ' folder-card--iptal';
    return cls;
  }

  function kindLabel(item) {
    if (item.ornekTumTurler) return { text: 'Örnek · Tüm türler', mod: 'ornek' };
    if (item.ornekRapor) return { text: 'Örnek · Rapor', mod: 'ornek' };
    if (item.ornek) return { text: 'Örnek · CRUD', mod: 'ornek' };
    return { text: 'Gerçek', mod: 'gercek' };
  }

  function sortedCalismalar() {
    return CALISMALAR.slice().sort(function (a, b) {
      var da = a.eklendi || '';
      var db = b.eklendi || '';
      if (da && db && da !== db) return db.localeCompare(da);
      if (da && !db) return -1;
      if (!da && db) return 1;
      return 0;
    });
  }

  function renderCard(item) {
    var href = item.href || (t + '/calismalarim/' + item.id + '/index.html');
    var kind = kindLabel(item);
    var html = '<a class="' + cardClass(item) + '" href="' + href + '" data-durum="' + (item.durum || '') + '" data-search="' + searchKey(item).replace(/"/g, '&quot;') + '">';
    html += '<div class="folder-card__icon">' + (item.icon || '📁') + '</div>';
    html += '<span class="folder-card__kind folder-card__kind--' + kind.mod + '">' + kind.text + '</span>';
    html += '<strong class="folder-card__title">' + item.label + '</strong>';
    html += '<div class="folder-card__badge">';
    if (item.durum) {
      html += '<span class="folder-durum folder-durum--' + item.durum + '">' + durumLabel(item.durum) + '</span>';
    }
    html += '</div>';
    html += '<span class="folder-card__meta">' + ozetSatir(item) + '</span></a>';
    return html;
  }

  function countByFilter(filterId) {
    var n = 0;
    for (var i = 0; i < CALISMALAR.length; i++) {
      var d = CALISMALAR[i].durum;
      if (filterId === 'all') {
        if (d !== 'iptal') n++;
      } else if (CALISMALAR[i].durum === filterId) {
        n++;
      }
    }
    return n;
  }

  function matches(item) {
    if (state.filter === 'all') {
      if (isIptal(item)) return false;
    } else if (item.durum !== state.filter) {
      return false;
    }
    if (state.query) {
      var q = state.query.toLowerCase();
      if (searchKey(item).indexOf(q) === -1) return false;
    }
    return true;
  }

  function renderFilters() {
    var wrap = document.getElementById('calismalar-filters');
    if (!wrap) return;
    var html = '';
    for (var i = 0; i < FILTERS.length; i++) {
      var f = FILTERS[i];
      var active = state.filter === f.id ? ' active' : '';
      var muted = f.muted ? ' calismalar-filter--muted' : '';
      var cnt = countByFilter(f.id);
      html += '<button type="button" class="calismalar-filter' + active + muted + '" data-filter="' + f.id + '">';
      html += f.label + ' <span class="calismalar-filter-count">' + cnt + '</span></button>';
    }
    wrap.innerHTML = html;
    wrap.querySelectorAll('.calismalar-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.filter = btn.getAttribute('data-filter');
        state.showAll = false;
        renderFilters();
        renderGrid();
      });
    });
  }

  function renderMoreButton(total, shown) {
    var wrap = document.getElementById('calismalar-more');
    if (!wrap) return;
    if (total <= PAGE_SIZE || state.showAll) {
      wrap.hidden = true;
      wrap.innerHTML = '';
      return;
    }
    wrap.hidden = false;
    wrap.innerHTML =
      '<button type="button" class="calismalar-more-btn" id="calismalar-more-btn">' +
      'Tümünü göster (' + total + ' çalışma, ' + (total - shown) + ' gizli)</button>';
    var btn = document.getElementById('calismalar-more-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        state.showAll = true;
        renderGrid();
      });
    }
  }

  function renderGrid() {
    var grid = document.getElementById('calismalar-grid');
    var empty = document.getElementById('calismalar-empty');
    if (!grid) return;

    var matched = sortedCalismalar().filter(matches);
    var limit = state.showAll ? matched.length : Math.min(PAGE_SIZE, matched.length);
    var g = '';
    for (var i = 0; i < limit; i++) {
      g += renderCard(matched[i]);
    }
    grid.innerHTML = g;

    if (empty) {
      empty.hidden = matched.length > 0;
      if (!empty.hidden) {
        empty.textContent = state.filter === 'iptal'
          ? 'İptal edilmiş çalışma yok. Bir çalışmayı listeden kaldırmak için çalışma özet sayfasındaki Cursor butonlarını kullanın.'
          : 'Eşleşen çalışma bulunamadı. Filtreyi değiştirin veya aramayı temizleyin.';
      }
    }

    renderMoreButton(matched.length, limit);
  }

  function bindSearch() {
    var input = document.getElementById('calismalar-search');
    if (!input) return;
    input.addEventListener('input', function () {
      state.query = input.value.trim();
      state.showAll = false;
      renderGrid();
    });
  }

  renderFilters();
  renderGrid();
  bindSearch();
})();
