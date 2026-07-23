(function () {
  var DURUM = {
    'mockup-taslak': 'Mockup taslak',
    'onay-bekliyor': 'Onay bekliyor',
    'task-hazir': 'Task hazır',
    'iptal': 'İptal'
  };

  function isOrnek(item) {
    return !!(item && (item.ornek || item.ornekRapor || item.ornekTumTurler));
  }

  function ozetSatir(item) {
    var n = (item.taskBe || 0) + (item.taskFe || 0);
    if (!item.mockupSayisi && !n) return 'Henüz mockup yok';
    var s = (item.mockupSayisi || 0) + ' mockup';
    if (n) s += ' · ' + n + ' task';
    return s;
  }

  function renderAmac(item) {
    var panel = document.getElementById('calisma-amac-panel');
    var el = document.getElementById('calisma-amac');
    var subtitle = document.querySelector('main .subtitle');
    var text = (item.desc || '').trim();
    if (el) {
      el.textContent = text;
      if (panel) panel.hidden = !text;
    } else if (subtitle && text) {
      subtitle.textContent = text;
    }
  }

  function injectMockupDuzeltButtons(item) {
    if (isOrnek(item)) return;
    var grid = document.querySelector('.tile-grid--mock');
    if (!grid || !window.TASK_CURSOR) return;
    var mockups = (window.TASK_HUB && window.TASK_HUB.calisma && window.TASK_HUB.calisma.mockups) || [];
    if (!mockups.length) return;

    grid.querySelectorAll('.tile-card').forEach(function (card) {
      if (card.closest('.tile-card-wrap')) return;
      var href = card.getAttribute('href') || '';
      var mockup = null;
      for (var i = 0; i < mockups.length; i++) {
        if (href === mockups[i].href || href.endsWith('/' + mockups[i].href)) {
          mockup = mockups[i];
          break;
        }
      }
      if (!mockup) return;

      var wrap = document.createElement('div');
      wrap.className = 'tile-card-wrap';
      card.parentNode.insertBefore(wrap, card);
      wrap.appendChild(card);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tile-card-duzelt';
      btn.textContent = 'Mockup düzelt…';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.TASK_CURSOR.open({ item: item, mode: 'mockup-duzelt', mockup: mockup });
      });
      wrap.appendChild(btn);
    });
  }

  window.HBC_CALISMA = {
    durumLabel: function (k) { return DURUM[k] || k; },
    ozetSatir: ozetSatir
  };

  var cfg = window.TASK_HUB;
  if (!cfg || !cfg.calisma || !cfg.calisma.id) return;

  var list = window.HBC_CALISMALAR || [];
  var item = null;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === cfg.calisma.id) { item = list[i]; break; }
  }
  if (!item) return;

  renderAmac(item);

  var bar = document.getElementById('calisma-durum-bar');
  if (bar) {
    var html = '<span class="calisma-durum calisma-durum--' + item.durum + '">' + DURUM[item.durum] + '</span>';
    html += '<span class="calisma-durum-ozet">' + ozetSatir(item) + '</span>';
    html += '<span class="calisma-menu-yer">Menü: ' + (item.menuYer === 'ust' ? 'üst' : 'sol') + '</span>';
    if (item.onay && item.onay.tarih) {
      html += '<span class="calisma-onay">Mockup onayı: ' + item.onay.tarih;
      if (item.onay.kim) html += ' — ' + item.onay.kim;
      html += '</span>';
    }
    if (item.iptal && item.iptal.tarih) {
      html += '<span class="calisma-iptal">İptal: ' + item.iptal.tarih;
      if (item.iptal.kim) html += ' — ' + item.iptal.kim;
      html += '</span>';
    }
    bar.innerHTML = html;
  }

  injectMockupDuzeltButtons(item);
})();
