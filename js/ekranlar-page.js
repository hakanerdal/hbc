(function () {
  var cfg = window.TASK_HUB;
  if (!cfg || !cfg.calisma) return;

  var c = cfg.calisma;
  var listEl = document.getElementById('ekran-list');
  var emptyEl = document.getElementById('ekran-empty');
  var btn = document.getElementById('btn-yeni-ekran');

  function mockupHref(m) {
    var href = m.href;
    if (c.base && c.base !== '.') href = c.base.replace(/\/$/, '') + '/' + m.href.replace(/^\//, '');
    return href;
  }

  function renderList() {
    if (!listEl) return;
    var mockups = c.mockups || [];
    if (!mockups.length) {
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    var html = '<div class="ekran-list-grid">';
    for (var i = 0; i < mockups.length; i++) {
      var m = mockups[i];
      var href = mockupHref(m);
      html += '<a class="ekran-list-card" href="' + href + '">';
      html += '<span class="ekran-list-num">' + (i + 1) + '</span>';
      html += '<strong>' + m.label + '</strong>';
      html += '<span class="ekran-list-path">' + m.href + '</span></a>';
    }
    html += '</div>';
    listEl.innerHTML = html;
  }

  function openWizard() {
    if (window.EKRAN_WIZARD && window.EKRAN_WIZARD.open) {
      window.EKRAN_WIZARD.open(c);
    }
  }

  if (btn) btn.addEventListener('click', openWizard);
  renderList();

  if (location.hash === '#yeni-ekran') {
    openWizard();
    history.replaceState(null, '', location.pathname + location.search);
  }
})();
