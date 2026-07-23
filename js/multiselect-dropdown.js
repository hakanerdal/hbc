(function () {
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function closeAll(except) {
    document.querySelectorAll('.mock-multiselect--open').forEach(function (root) {
      if (except && root === except) return;
      var drop = root.querySelector('.mock-multiselect-drop');
      var trigger = root.querySelector('.mock-multiselect-trigger');
      root.classList.remove('mock-multiselect--open');
      if (drop) drop.hidden = true;
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function readValues(root) {
    if (!root) return [];
    var vals = [];
    root.querySelectorAll('.mock-multiselect-drop input[type="checkbox"]:checked').forEach(function (cb) {
      vals.push(cb.value);
    });
    return vals;
  }

  function readCsv(root) {
    return readValues(root).join(', ');
  }

  function updateLabel(root) {
    var textEl = root.querySelector('.mock-multiselect-values');
    if (!textEl) return;
    var placeholder = root.getAttribute('data-placeholder') || 'Seçin…';
    var labels = [];
    root.querySelectorAll('.mock-multiselect-drop input[type="checkbox"]:checked').forEach(function (cb) {
      var lab = cb.closest('label');
      var span = lab ? lab.querySelector('span') : null;
      labels.push(span ? span.textContent.trim() : cb.value);
    });
    if (!labels.length) {
      textEl.textContent = placeholder;
      textEl.classList.add('is-placeholder');
    } else if (labels.length <= 2) {
      textEl.textContent = labels.join(', ');
      textEl.classList.remove('is-placeholder');
    } else {
      textEl.textContent = labels.length + ' seçili';
      textEl.classList.remove('is-placeholder');
    }
  }

  /**
   * @param {Object} opts
   * @param {Array<{value:string,label:string}>} opts.items
   * @param {string[]} [opts.selected]
   * @param {string} [opts.className]
   * @param {string} [opts.extraAttrs]
   * @param {string} [opts.placeholder]
   * @param {boolean} [opts.search]
   */
  function buildHtml(opts) {
    opts = opts || {};
    var items = opts.items || [];
    var selected = opts.selected || [];
    var cls = opts.className || 'mock-multiselect';
    var placeholder = opts.placeholder || 'Seçin…';
    var search = opts.search !== false && items.length > 12;

    var h = '<div class="' + esc(cls) + '" data-placeholder="' + esc(placeholder) + '"' + (opts.extraAttrs || '') + '>';
    h += '<button type="button" class="mock-multiselect-trigger" aria-haspopup="listbox" aria-expanded="false">';
    h += '<span class="mock-multiselect-values is-placeholder">' + esc(placeholder) + '</span>';
    h += '<span class="mock-multiselect-caret" aria-hidden="true">▾</span></button>';
    h += '<div class="mock-multiselect-drop" hidden role="listbox">';
    if (search) {
      h += '<input type="search" class="mock-multiselect-search" placeholder="Ara…" autocomplete="off" />';
    }
    h += '<div class="mock-multiselect-list">';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var chk = selected.indexOf(it.value) >= 0 ? ' checked' : '';
      h += '<label><input type="checkbox" value="' + esc(it.value) + '"' + chk + ' />';
      h += '<span>' + esc(it.label) + '</span></label>';
    }
    h += '</div></div></div>';
    return h;
  }

  function init(root) {
    if (!root || root.classList.contains('mock-multiselect--static') || root._msInit) return;
    root._msInit = true;

    var trigger = root.querySelector('.mock-multiselect-trigger');
    var drop = root.querySelector('.mock-multiselect-drop');
    if (!trigger || !drop) return;

    if (trigger.tagName === 'DIV') {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = trigger.className;
      btn.innerHTML = trigger.innerHTML;
      if (trigger.hasAttribute('aria-hidden')) trigger.removeAttribute('aria-hidden');
      trigger.parentNode.replaceChild(btn, trigger);
      trigger = btn;
    }

    trigger.setAttribute('aria-haspopup', 'listbox');

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = root.classList.contains('mock-multiselect--open');
      closeAll();
      if (!isOpen) {
        root.classList.add('mock-multiselect--open');
        drop.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        var search = root.querySelector('.mock-multiselect-search');
        if (search) search.focus();
      }
    });

    drop.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    root.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        updateLabel(root);
      });
    });

    var search = root.querySelector('.mock-multiselect-search');
    if (search) {
      search.addEventListener('input', function () {
        var q = search.value.toLowerCase();
        root.querySelectorAll('.mock-multiselect-list label').forEach(function (lab) {
          var t = lab.textContent.toLowerCase();
          lab.hidden = !!(q && t.indexOf(q) < 0);
        });
      });
      search.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    updateLabel(root);
  }

  function initAll(container) {
    var scope = container || document;
    scope.querySelectorAll('.mock-multiselect:not(.mock-multiselect--static)').forEach(init);
  }

  document.addEventListener('click', function () {
    closeAll();
  });

  window.MULTISELECT_DROPDOWN = {
    buildHtml: buildHtml,
    readValues: readValues,
    readCsv: readCsv,
    init: init,
    initAll: initAll,
    updateLabel: updateLabel
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initAll();
    });
  } else {
    initAll();
  }
})();
