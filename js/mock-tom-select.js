/**
 * Mockup çoklu seçim — Bootstrap 5 + Tom Select (CDN).
 * select.mock-tom-select[multiple] öğelerini etiketli çoklu seçime dönüştürür.
 */
(function () {
  function initSelect(el) {
    if (!el || el.tomselect || !window.TomSelect) return null;
    var search = el.getAttribute('data-search');
    var opts = {
      plugins: ['remove_button'],
      maxItems: null,
      placeholder: el.getAttribute('data-placeholder') || 'Seçin…',
      hideSelected: true,
      closeAfterSelect: false
    };
    if (search === 'false') {
      opts.searchField = [];
    }
    return new TomSelect(el, opts);
  }

  function initAll(root) {
    var scope = root || document;
    var list = scope.querySelectorAll('select.mock-tom-select[multiple]');
    for (var i = 0; i < list.length; i++) {
      initSelect(list[i]);
    }
  }

  window.MOCK_TOM_SELECT = {
    init: initSelect,
    initAll: initAll
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }
})();
