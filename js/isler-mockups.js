(function () {
  function calismaHref(base, path) {
    if (!path) return path;
    if (/^https?:\/\//.test(path)) return path;
    path = path.replace(/^\//, '');
    base = (base || '.').replace(/\/$/, '');
    if (base === '.') return path;
    return base + '/' + path;
  }

  var cfg = window.TASK_HUB;
  if (!cfg || cfg.page !== 'calisma-isler') return;
  var c = cfg.calisma;
  if (!c || !c.mockups || !c.mockups.length) return;

  var main = document.querySelector('main');
  if (!main || main.querySelector('.isler-mockup-bar')) return;

  var bar = document.createElement('div');
  bar.className = 'isler-mockup-bar';
  bar.innerHTML = '<span class="isler-mockup-label">Ekranlar</span>';

  for (var i = 0; i < c.mockups.length; i++) {
    var mk = c.mockups[i];
    var a = document.createElement('a');
    a.href = calismaHref(c.base, mk.href);
    a.textContent = mk.label;
    bar.appendChild(a);
  }

  var anchor = main.querySelector('.subtitle') || main.querySelector('h1');
  if (anchor) anchor.insertAdjacentElement('afterend', bar);
})();
