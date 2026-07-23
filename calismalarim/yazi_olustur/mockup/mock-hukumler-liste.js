(function () {
  var data = window.HUKUMLER_TABLOSU || [];
  var tbody = document.getElementById('hukumler-tbody');
  var countEl = document.getElementById('hukumler-count');
  var filter = document.getElementById('hukumler-filter-kaynak');
  if (!tbody) return;

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function truncate(s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n) + '…' : s;
  }

  function render() {
    var kaynak = filter ? filter.value : '';
    var rows = data.filter(function (r) {
      return !kaynak || r.kaynak === kaynak;
    });
    tbody.innerHTML = rows.map(function (r) {
      return '<tr>' +
        '<td>' + escapeHtml(r.kaynak) + '</td>' +
        '<td>' + escapeHtml(r.koruma_alani) + '</td>' +
        '<td>' + escapeHtml(r.sektor) + '</td>' +
        '<td class="mock-td-madde" title="' + escapeHtml(r.madde) + '">' + escapeHtml(truncate(r.madde, 120)) + '</td>' +
        '<td><a href="hukumler-form.html" class="mock-icon-btn" title="Düzenle" aria-label="Düzenle">' +
        '<svg class="mock-icon-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></a></td>' +
        '</tr>';
    }).join('');
    if (countEl) countEl.textContent = 'Toplam ' + rows.length + ' kayıt';
  }

  if (filter) filter.addEventListener('change', render);
  render();
})();
