/**
 * Taşkın Dashboard — harita init, sekmeler, combobox, harita↔liste, grafikler
 */
(function () {
  var charts = {};

  function showCard(feature, opts) {
    opts = opts || {};
    var cards = document.querySelectorAll('#td-info-cards .td-info-card');
    cards.forEach(function (c) {
      c.hidden = c.getAttribute('data-feature') !== feature;
    });
    document.querySelectorAll('.td-map-pin').forEach(function (p) {
      p.classList.toggle('is-active', p.getAttribute('data-feature') === feature);
    });
    document.querySelectorAll('.mock-table tbody tr[data-feature]').forEach(function (tr) {
      var on = tr.getAttribute('data-feature') === feature;
      tr.classList.toggle('is-selected', on);
      tr.classList.toggle('is-map-linked', on);
      if (on && !opts.skipScroll) {
        tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  function initMap() {
    var MAP = window.MOCK_GEO_MAP;
    if (!MAP) return;
    var renkler = {
      '06': '#ef6c00',
      '34': '#bbdefb',
      '35': '#90caf9',
      '16': '#64b5f6',
      '42': '#42a5f5',
      '07': '#1e88e5',
      '01': '#1565c0'
    };
    MAP.init('#harita-taskin', {
      templateId: 'geo-map-turkiye',
      kapsam: 'turkiye',
      defaultFill: '#eef2f7',
      colors: renkler,
      legendScale: {
        min: 0,
        max: 100,
        steps: 5,
        colors: ['#fff3e0', '#ffcc80', '#ff9800', '#f57c00', '#e65100']
      },
      legendLabel: 'Taşkın risk (Q ısı)'
    });
  }

  function initCharts(filtered) {
    if (typeof Chart === 'undefined') return;
    var pieData = filtered ? [5, 3, 2] : [8, 12, 5];
    var qData = filtered ? [10, 22, 40, 55, 90, 120] : [12, 28, 55, 78, 140, 210];
    var trendData = filtered ? [2, 3, 4, 3, 5, 6] : [4, 5, 7, 6, 9, 12];

    function upsert(id, type, cfg) {
      if (charts[id]) {
        charts[id].data.datasets[0].data = cfg.data;
        if (cfg.labels) charts[id].data.labels = cfg.labels;
        charts[id].update();
        return;
      }
      var el = document.getElementById(id);
      if (!el) return;
      charts[id] = new Chart(el, {
        type: type,
        data: {
          labels: cfg.labels,
          datasets: [{
            label: cfg.label || '',
            data: cfg.data,
            backgroundColor: cfg.colors || '#42a5f5',
            borderColor: cfg.border || '#1a5fb4',
            borderWidth: type === 'line' ? 2 : 1,
            fill: type === 'line',
            tension: 0.35,
            borderRadius: type === 'bar' ? 4 : 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: type === 'pie'
              ? { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } }
              : { display: false }
          },
          scales: type === 'pie' ? {} : {
            y: { beginAtZero: true, grid: { color: '#eef2f7' } },
            x: { grid: { display: false }, ticks: { font: { size: 10 } } }
          }
        }
      });
    }

    upsert('chart-sinif', 'pie', {
      labels: ['Risk', 'Tehlike', 'Ekonomik Zarar'],
      data: pieData,
      colors: ['#1565c0', '#c62828', '#ef6c00']
    });
    upsert('chart-q', 'bar', {
      labels: ['Q5', 'Q10', 'Q50', 'Q100', 'Q500', 'Q1000'],
      data: qData,
      label: 'm³/sn',
      colors: '#42a5f5'
    });
    upsert('chart-trend', 'line', {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
      data: trendData,
      label: 'Alan sayısı',
      border: '#1a5fb4',
      colors: 'rgba(26,95,180,0.12)'
    });
  }

  function wireTabs() {
    document.querySelectorAll('.td-list-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');
        document.querySelectorAll('.td-list-tab').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        document.querySelectorAll('.td-list-panel').forEach(function (p) {
          p.hidden = p.getAttribute('data-panel') !== tab;
        });
      });
    });
  }

  function wireCombos() {
    var swTahliye = document.getElementById('sw-tahliye');
    if (swTahliye) {
      swTahliye.addEventListener('change', function () {
        var alan = swTahliye.value === 'alan';
        document.getElementById('tbl-tahliye-nokta').hidden = alan;
        document.getElementById('tbl-tahliye-alan').hidden = !alan;
        document.getElementById('tahliye-title').textContent = alan
          ? 'Taşkın Tahliye Alanları'
          : 'Taşkın Tahliye Noktaları';
      });
    }

    var swPoi = document.getElementById('sw-poi');
    if (swPoi) {
      swPoi.addEventListener('change', function () {
        var v = swPoi.value;
        document.getElementById('tbl-poi').hidden = v !== 'poi';
        document.getElementById('tbl-bina').hidden = v !== 'bina';
        document.getElementById('tbl-nufus').hidden = v !== 'nufus';
        document.getElementById('poi-checks').hidden = v !== 'poi';
        document.getElementById('poi-title').textContent =
          v === 'bina' ? 'Bina Seviyesi' : v === 'nufus' ? 'Nüfus' : 'POI';
      });
    }

    var swSorgu = document.getElementById('sw-sorgu');
    if (swSorgu) {
      swSorgu.addEventListener('change', function () {
        var v = swSorgu.value;
        document.getElementById('tbl-sorgu-tehlike').hidden = v !== 'tehlike';
        document.getElementById('tbl-sorgu-risk').hidden = v !== 'risk';
        document.getElementById('tbl-sorgu-zarar').hidden = v !== 'zarar';
        var titles = {
          tehlike: 'Taşkın Tehlike Sorgulama',
          risk: 'Taşkın Risk Sorgulama',
          zarar: 'Ekonomik Zarar Sorgulama'
        };
        document.getElementById('sorgu-title').textContent = titles[v] || titles.tehlike;
      });
    }
  }

  function wireMapList() {
    document.querySelectorAll('.td-map-pin').forEach(function (pin) {
      pin.addEventListener('click', function () {
        showCard(pin.getAttribute('data-feature'));
      });
    });
    document.querySelectorAll('.td-card-close').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.closest('.td-info-card').hidden = true;
      });
    });
    document.querySelectorAll('.mock-table[data-link="map"] tbody').forEach(function (tbody) {
      tbody.addEventListener('click', function (e) {
        var tr = e.target.closest('tr[data-feature]');
        if (!tr) return;
        showCard(tr.getAttribute('data-feature'));
      });
    });
  }

  function wireChartsUi() {
    document.querySelectorAll('.td-chart-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.td-chart-card');
        if (card) card.remove();
      });
    });
    var addBtn = document.getElementById('btn-add-chart');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var grid = document.getElementById('td-charts-grid');
        var note = document.createElement('div');
        note.className = 'td-chart-card';
        note.innerHTML =
          '<div class="td-chart-card-head"><strong>Yeni grafik (yer tutucu)</strong>' +
          '<button type="button" class="mock-btn mock-btn-sm td-chart-remove">Kaldır</button></div>' +
          '<p class="mock-report-hint">Tablo/Grafik Oluştur ile eklenecek · sürükle-bırak yer değiştirme (mock)</p>';
        grid.appendChild(note);
        note.querySelector('.td-chart-remove').addEventListener('click', function () {
          note.remove();
        });
      });
    }
  }

  function wireFilter() {
    var btn = document.getElementById('btn-yenile');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var il = document.getElementById('f-il');
      var filtered = true;
      if (il && window.TomSelect && il.tomselect) {
        var vals = il.tomselect.getValue();
        filtered = vals && vals.length && vals.indexOf('06') >= 0;
      }
      document.getElementById('kpi-risk').textContent = filtered ? '12' : '48';
      document.getElementById('kpi-tehlike').textContent = filtered ? '8' : '31';
      document.getElementById('kpi-zarar').textContent = filtered ? '5' : '19';
      document.getElementById('kpi-tahliye').textContent = filtered ? '14' : '62';
      document.getElementById('kpi-gecis').textContent = filtered ? '9' : '37';
      initCharts(filtered);
      var tip = document.getElementById('td-timeout-tip');
      if (tip) {
        tip.hidden = false;
        tip.textContent = 'Bilgi: uzun süren sorgularda «zaman aşımı sorgu» bildirimi gösterilir (mock).';
      }
    });
  }

  function wireLayers() {
    document.querySelectorAll('.td-legend input[data-layer]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var layer = cb.getAttribute('data-layer');
        var on = cb.checked;
        if (layer === 'risk-isi' || layer === 'tehlike' || layer === 'zarar' || layer === 'dere') {
          var map = { 'risk-isi': 'risk', tehlike: 'tehlike', zarar: 'zarar', dere: 'dere' };
          var pinType = map[layer];
          document.querySelectorAll('.td-map-pin').forEach(function (p) {
            var f = p.getAttribute('data-feature') || '';
            if (f.indexOf(pinType) === 0 || (layer === 'risk-isi' && f.indexOf('risk') === 0)) {
              p.style.display = on ? '' : 'none';
            }
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMap();
    initCharts(true);
    wireTabs();
    wireCombos();
    wireMapList();
    wireChartsUi();
    wireFilter();
    wireLayers();
    /* İlk seçim — scroll yapma; aksi halde tablo satırına kayıp harita alta kaçar */
    showCard('risk-1', { skipScroll: true });
    var appBody = document.querySelector('.mock-app-body');
    if (appBody) appBody.scrollTop = 0;
    window.scrollTo(0, 0);
  });
})();
