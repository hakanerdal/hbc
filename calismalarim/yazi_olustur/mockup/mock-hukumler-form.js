(function () {
  var data = window.HUKUMLER_TABLOSU || [];
  var korumaSel = document.getElementById('f-hukum-koruma');
  var sektorSel = document.getElementById('f-hukum-sektor');
  if (!korumaSel || !sektorSel || !data.length) return;

  function uniqSorted(list) {
    var seen = {};
    var out = [];
    list.forEach(function (v) {
      if (!v || seen[v]) return;
      seen[v] = true;
      out.push(v);
    });
    return out.sort(function (a, b) { return a.localeCompare(b, 'tr'); });
  }

  function korumaOptions() {
    return uniqSorted(data.map(function (r) { return r.koruma_alani; }));
  }

  function sektorOptions(korumaAlani) {
    var rows = korumaAlani
      ? data.filter(function (r) { return r.koruma_alani === korumaAlani; })
      : data;
    return uniqSorted(rows.map(function (r) { return r.sektor; }));
  }

  function fillSelect(sel, items, selected) {
    sel.innerHTML = '';
    items.forEach(function (val) {
      var opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      if (val === selected) opt.selected = true;
      sel.appendChild(opt);
    });
    if (selected && sel.value !== selected && items.indexOf(selected) === -1) {
      var extra = document.createElement('option');
      extra.value = selected;
      extra.textContent = selected;
      extra.selected = true;
      sel.insertBefore(extra, sel.firstChild);
    }
  }

  function onKorumaChange() {
    var koruma = korumaSel.value;
    var prev = sektorSel.value;
    var sektorlar = sektorOptions(koruma);
    var next = sektorlar.indexOf(prev) >= 0 ? prev : sektorlar[0];
    fillSelect(sektorSel, sektorlar, next);
  }

  function init() {
    var initKoruma = korumaSel.getAttribute('data-value') || korumaOptions()[0];
    var initSektor = sektorSel.getAttribute('data-value') || sektorOptions(initKoruma)[0];
    fillSelect(korumaSel, korumaOptions(), initKoruma);
    fillSelect(sektorSel, sektorOptions(initKoruma), initSektor);
    korumaSel.addEventListener('change', onKorumaChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
