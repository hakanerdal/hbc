(function () {
  function isActive() {
    return new URLSearchParams(window.location.search).get('sunum') === '1';
  }

  function appendToHref(href) {
    if (!href || href.charAt(0) === '#' || /^https?:\/\//i.test(href)) return href;
    if (/[?&]sunum=1(?:&|$)/.test(href)) return href;
    return href + (href.indexOf('?') >= 0 ? '&' : '?') + 'sunum=1';
  }

  function patchLinks(root) {
    if (!root || !isActive()) return;
    root.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      var next = appendToHref(href);
      if (next !== href) a.setAttribute('href', next);
    });
  }

  window.HBC_SUNUM = {
    isActive: isActive,
    appendToHref: appendToHref,
    patchLinks: patchLinks
  };
})();
