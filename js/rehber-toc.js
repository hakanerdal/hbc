(function () {
  var MAIN_SEL = '#rehber-main';
  var TOC_SEL = '#rehber-toc';
  var MIN_HEADINGS = 4;
  var SKIP_SEL = '.hero-analist, .rehber-toc-wrap';

  function slugify(text) {
    var map = {
      ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
      Ç: 'c', Ğ: 'g', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u'
    };
    var s = String(text || '').trim();
    Object.keys(map).forEach(function (k) {
      s = s.split(k).join(map[k]);
    });
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bolum';
  }

  function collectHeadings(root) {
    var list = [];
    root.querySelectorAll('h2, h3').forEach(function (h) {
      if (h.closest(SKIP_SEL)) return;
      list.push(h);
    });
    return list;
  }

  function ensureIds(headings) {
    var used = {};
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var id = h.id || slugify(h.textContent);
      var base = id;
      var n = 2;
      while (used[id]) {
        id = base + '-' + n++;
      }
      used[id] = true;
      h.id = id;
      h.classList.add('rehber-anchor');
    }
    return headings;
  }

  function buildToc(headings, container) {
    if (headings.length < MIN_HEADINGS) return;

    var nav = document.createElement('nav');
    nav.className = 'rehber-toc-nav';
    nav.setAttribute('aria-label', 'Sayfa içi bağlantılar');

    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.trim();
      a.className = 'rehber-toc-link' + (h.tagName === 'H3' ? ' rehber-toc-link--sub' : '');
      a.dataset.target = h.id;
      nav.appendChild(a);
    }

    var title = document.createElement('p');
    title.className = 'rehber-toc-title';
    title.textContent = 'Bu sayfada';

    container.appendChild(title);
    container.appendChild(nav);
    container.removeAttribute('hidden');
    bindScrollspy(nav);
    bindClicks(nav);
  }

  function setActive(nav, id) {
    nav.querySelectorAll('.rehber-toc-link').forEach(function (a) {
      a.classList.toggle('rehber-toc-link--active', a.dataset.target === id);
    });
  }

  function bindScrollspy(nav) {
    var headings = [];
    nav.querySelectorAll('.rehber-toc-link').forEach(function (a) {
      var el = document.getElementById(a.dataset.target);
      if (el) headings.push(el);
    });
    if (!headings.length) return;

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) setActive(nav, e.target.id);
          });
        },
        { rootMargin: '-8% 0px -72% 0px', threshold: 0 }
      );
      headings.forEach(function (h) {
        obs.observe(h);
      });
    } else {
      setActive(nav, headings[0].id);
    }
  }

  function bindClicks(nav) {
    nav.addEventListener('click', function (e) {
      var a = e.target.closest('.rehber-toc-link');
      if (!a) return;
      e.preventDefault();
      var target = document.getElementById(a.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + a.dataset.target);
        setActive(nav, a.dataset.target);
      }
    });
  }

  function init() {
    var main = document.querySelector(MAIN_SEL);
    var toc = document.querySelector(TOC_SEL);
    if (!main || !toc) return;
    buildToc(ensureIds(collectHeadings(main)), toc);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
