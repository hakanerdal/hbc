(function () {
  var cfg = window.TASK_HUB || { taskRoot: '.', page: 'home' };
  var t = (cfg.taskRoot || '.').replace(/\/$/, '');

  function calismaHref(base, path) {
    if (!path) return path;
    if (/^https?:\/\//.test(path)) return path;
    path = path.replace(/^\//, '');
    base = (base || '.').replace(/\/$/, '');
    if (base === '.') return path;
    return base + '/' + path;
  }

  function sunumHref(href) {
    var sunum = window.HBC_SUNUM;
    if (sunum && sunum.appendToHref) return sunum.appendToHref(href);
    return href;
  }

  var inSunum = window.HBC_SUNUM && window.HBC_SUNUM.isActive && window.HBC_SUNUM.isActive();

  var el = document.getElementById('sidebar');
  if (!el) return;

  var html = '<a class="nav-brand" href="' + t + '/index.html">HBC</a>';
  html += '<h2>Menü</h2>';
  html += '<a href="' + t + '/index.html"' + (cfg.page === 'home' ? ' class="active"' : '') + '>Çalışmalarım</a>';

  html += '<h2>Rehber</h2>';
  html += '<a href="' + t + '/module-creator/is-analisti.html"' + (cfg.page === 'rehber-baslangic' ? ' class="active"' : '') + '>Başlangıç</a>';
  html += '<a href="' + t + '/module-creator/jira-analist.html"' + (cfg.page === 'rehber-jira' ? ' class="active"' : '') + '>Jira İş Açma</a>';
  html += '<a href="' + t + '/module-creator/kurulum-analist.html"' + (cfg.page === 'rehber-kurulum' ? ' class="active"' : '') + '>Kurulum</a>';

  if (cfg.calisma) {
    var c = cfg.calisma;
    html += '<h2>' + c.label + '</h2>';
    html += '<a href="' + calismaHref(c.base, 'index.html') + '"' + (cfg.page === 'calisma-ozet' ? ' class="active"' : '') + '>Özet</a>';

    html += '<a href="' + calismaHref(c.base, 'ekranlar.html') + '"' + (cfg.page === 'calisma-ekranlar' ? ' class="active"' : '') + '>Ekranlar</a>';

    if (c.mockups && c.mockups.length) {
      for (var m = 0; m < c.mockups.length; m++) {
        var mk = c.mockups[m];
        var mockCls = 'nav-ekran' + (cfg.page === mk.id ? ' active' : '');
        var mockHref = calismaHref(c.base, mk.href);
        if (inSunum) mockHref = sunumHref(mockHref);
        html += '<a class="' + mockCls + '" href="' + mockHref + '">' + mk.label + '</a>';
      }

      var sunumTarget = c.mockups[0].href;
      for (var s = 0; s < c.mockups.length; s++) {
        if (cfg.page === c.mockups[s].id) {
          sunumTarget = c.mockups[s].href;
          break;
        }
      }
      var sunumLink = sunumHref(calismaHref(c.base, sunumTarget));
      var sunumCls = 'nav-sunum' + (inSunum ? ' active' : '');
      html += '<a class="' + sunumCls + '" href="' + sunumLink + '">Sunum</a>';
    }

    if (c.islerHref) {
      html += '<a href="' + calismaHref(c.base, c.islerHref) + '"' + (cfg.page === 'calisma-isler' ? ' class="active"' : '') + '>Task Metinleri</a>';
    }
  }

  el.innerHTML = html;
})();
