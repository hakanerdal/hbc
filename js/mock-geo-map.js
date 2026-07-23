(function () {
  var DEFAULT_FILL = '#cccccc';

  function padPlaka(code) {
    var s = String(code || '').replace(/\D/g, '');
    return s.length === 1 ? '0' + s : s.slice(0, 2);
  }

  function getPlaka(el) {
    return padPlaka(el.getAttribute('data-plaka') || el.getAttribute('data-plate') || '');
  }

  function parsePlakaList(text) {
    if (!text) return [];
    return String(text).split(/[,;\s]+/).map(padPlaka).filter(Boolean);
  }

  function parseColorMap(text) {
    var colors = {};
    if (!text) return colors;
    String(text).split(/[,;]+/).forEach(function (part) {
      var m = part.trim().match(/^(\d{1,2})\s*[:=]\s*(#[0-9a-fA-F]{3,8}|[a-z]+)/);
      if (m) colors[padPlaka(m[1])] = m[2];
    });
    return colors;
  }

  /** İlçe haritası (ankara.svg): sıra no → renk */
  function parseDistrictColorMap(text) {
    var colors = {};
    if (!text) return colors;
    String(text).split(/[,;]+/).forEach(function (part) {
      var m = part.trim().match(/^(\d+)\s*[:=]\s*(#[0-9a-fA-F]{3,8}|[a-z]+)/);
      if (m) colors[m[1]] = m[2];
    });
    return colors;
  }

  function isAnkaraMap(url) {
    return /ankara\.svg/i.test(url || '');
  }

  /** paintmaps şablonundaki siyah alt katman değil, renklendirilebilir ilçe path'i */
  function isDistrictShapePath(p) {
    if (!p || (p.tagName !== 'path' && p.tagName !== 'PATH')) return false;
    if (p.closest('g[data-plaka], g[data-plate]')) return false;
    var fill = (p.getAttribute('fill') || '').toLowerCase().replace(/\s/g, '');
    return fill !== '#000000' && fill !== 'black' && fill !== 'rgb(0,0,0)';
  }

  /** ankara.svg — ilçe path'lerini renklendirir (şablon siyah katman atlanır). */
  function paintDistricts(root, colors, defaultFill) {
    if (!root) return;
    var base = defaultFill || '#e8eef5';
    var svg = root.tagName === 'svg' || root.tagName === 'SVG' ? root : (root.querySelector('svg') || root);
    var paths = svg.querySelectorAll('path');
    var idx = 0;
    for (var i = 0; i < paths.length; i++) {
      var p = paths[i];
      if (!isDistrictShapePath(p)) {
        p.style.display = 'none';
        continue;
      }
      var key = String(idx);
      var fill = (colors && (colors[key] || colors[idx])) || base;
      p.setAttribute('fill', fill);
      p.style.display = '';
      idx++;
    }
  }

  /** SVG ölçekleme: viewBox + oran koruma; etiket görünürlüğü opts.hideLabels ile */
  function prepareSvgDisplay(svg, opts) {
    if (!svg) return null;
    opts = opts || {};
    if (!svg.getAttribute('viewBox')) {
      var w = parseFloat(svg.getAttribute('width'));
      var h = parseFloat(svg.getAttribute('height'));
      if (w && h) svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    }
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.maxHeight = opts.maxHeight || '';
    var labels = svg.querySelectorAll('text, .maplabels1');
    for (var i = 0; i < labels.length; i++) {
      if (opts.hideLabels) {
        labels[i].style.display = 'none';
      } else {
        labels[i].style.display = '';
      }
    }
    return svg;
  }

  /** SVG içeriğini container'a yükler (fetch veya inline string). */
  function mount(container, svgMarkup, displayOpts) {
    if (!container) return null;
    container.innerHTML = svgMarkup;
    return prepareSvgDisplay(container.querySelector('svg'), displayOpts);
  }

  /** file:// uyumu: mockup HTML içindeki <template id="…"> klonlanır */
  function mountFromTemplate(container, templateId) {
    if (!container || !templateId) return Promise.resolve(null);
    var tpl = document.getElementById(templateId);
    if (!tpl) return Promise.reject(new Error('template bulunamadı: ' + templateId));
    container.innerHTML = '';
    if (tpl.content && tpl.content.cloneNode) {
      container.appendChild(tpl.content.cloneNode(true));
    } else {
      container.innerHTML = tpl.innerHTML;
    }
    return Promise.resolve(prepareSvgDisplay(container.querySelector('svg')));
  }

  /** Sayfa konumuna göre göreli SVG yolu (mockup zip / file:// uyumlu). */
  function resolveMapUrl(url) {
    if (!url) return url;
    if (/^(https?:|data:|blob:|file:)/i.test(url)) return url;
    try {
      return new URL(url, document.baseURI || window.location.href).href;
    } catch (e) {
      return url;
    }
  }

  /** file:// ve fetch hatasında gizli <object> ile SVG metni okur. */
  function loadSvgViaObject(url) {
    var abs = resolveMapUrl(url);
    return new Promise(function (resolve, reject) {
      var obj = document.createElement('object');
      obj.type = 'image/svg+xml';
      obj.data = abs;
      obj.setAttribute('aria-hidden', 'true');
      obj.tabIndex = -1;
      obj.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
      var settled = false;
      function finish(err, text) {
        if (settled) return;
        settled = true;
        if (obj.parentNode) obj.parentNode.removeChild(obj);
        if (err) reject(err);
        else resolve(text);
      }
      function readFromObject() {
        try {
          var doc = obj.contentDocument;
          if (!doc || !doc.documentElement) {
            finish(new Error('SVG içeriği okunamadı: ' + url));
            return;
          }
          finish(null, new XMLSerializer().serializeToString(doc.documentElement));
        } catch (e) {
          finish(e);
        }
      }
      obj.onload = readFromObject;
      obj.onerror = function () { finish(new Error('SVG yüklenemedi: ' + url)); };
      document.body.appendChild(obj);
      setTimeout(function () {
        if (!settled) readFromObject();
      }, 80);
    });
  }

  function fetchSvgText(url) {
    var abs = resolveMapUrl(url);
    return fetch(abs).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
  }

  function xhrSvgText(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', resolveMapUrl(url), true);
      xhr.overrideMimeType('image/svg+xml');
      xhr.onload = function () {
        if ((xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) && xhr.responseText) {
          resolve(xhr.responseText);
        } else {
          reject(new Error('xhr ' + xhr.status));
        }
      };
      xhr.onerror = function () { reject(new Error('xhr failed')); };
      xhr.send();
    });
  }

  function loadSvgTextAny(url) {
    var proto = window.location.protocol;
    if (proto === 'http:' || proto === 'https:') {
      return fetchSvgText(url).catch(function () { return loadSvgViaObject(url); });
    }
    return xhrSvgText(url).catch(function () { return loadSvgViaObject(url); });
  }

  function load(container, url) {
    if (!container || !url) return Promise.resolve(null);
    return loadSvgTextAny(url).then(function (text) {
      return mount(container, text);
    });
  }

  function resolvePlaka(el) {
    if (!el) return '';
    var g = el.closest ? el.closest('g[data-plaka], g[data-plate]') : null;
    if (g) return getPlaka(g);
    var plaka = getPlaka(el);
    if (!plaka && el.id && /^TR-\d{2}$/i.test(el.id)) plaka = el.id.slice(3);
    return plaka;
  }

  function paintPath(path, plaka, colors, base, opts) {
    if (!path || !plaka) return;
    opts = opts || {};
    var kapsam = opts.kapsam || 'turkiye';
    var secili = opts.seciliIller || [];
    var onlySelected = kapsam === 'secili-iller' && secili.length > 0;
    var group = path.closest ? path.closest('g[data-plaka], g[data-plate]') : null;

    if (onlySelected && secili.indexOf(plaka) < 0) {
      if (group) group.style.display = 'none';
      else path.style.display = 'none';
      return;
    }

    if (group) group.style.display = '';
    path.style.display = '';

    var fill = (colors && colors[plaka]) || base;
    path.setAttribute('fill', fill);
    if (onlySelected && !(colors && colors[plaka])) {
      path.setAttribute('fill', base);
    }
  }

  /**
   * İlleri renklendirir (map.svg: g[data-plate] grupları veya path[data-plaka]).
   * @param {Object} [opts] — kapsam: 'turkiye' | 'secili-iller', seciliIller: string[] veya "34, 06"
   */
  function paint(root, colors, defaultFill, opts) {
    if (!root) return;
    opts = opts || {};
    var base = defaultFill || DEFAULT_FILL;
    var svg = root.tagName === 'svg' || root.tagName === 'SVG' ? root : (root.querySelector('svg') || root);
    var paintOpts = {
      kapsam: opts.kapsam || 'turkiye',
      seciliIller: Array.isArray(opts.seciliIller) ? opts.seciliIller : parsePlakaList(opts.seciliIller)
    };

    var groups = svg.querySelectorAll('g[data-plaka], g[data-plate]');
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      var plaka = getPlaka(g);
      var fillPath = g.querySelector(':scope > path');
      if (fillPath) paintPath(fillPath, plaka, colors, base, paintOpts);
    }

    var paths = svg.querySelectorAll('path[data-plaka], path[data-plate], path[id^="TR-"]');
    for (var j = 0; j < paths.length; j++) {
      var p = paths[j];
      if (p.closest('g[data-plaka], g[data-plate]')) continue;
      paintPath(p, resolvePlaka(p), colors, base, paintOpts);
    }

    if (paintOpts.kapsam === 'secili-iller' && paintOpts.seciliIller.length) {
      fitViewToSelected(svg, paintOpts.seciliIller);
    }
  }

  /** İlçe path'lerinin sınırlarına viewBox (ankara.svg transform uyumu). */
  function fitViewToDistricts(svg) {
    if (!svg) return;
    var paths = svg.querySelectorAll('path');
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var found = false;
    for (var i = 0; i < paths.length; i++) {
      var p = paths[i];
      if (p.closest('g[data-plaka], g[data-plate]')) continue;
      try {
        var bb = p.getBBox();
        if (!bb.width && !bb.height) continue;
        minX = Math.min(minX, bb.x);
        minY = Math.min(minY, bb.y);
        maxX = Math.max(maxX, bb.x + bb.width);
        maxY = Math.max(maxY, bb.y + bb.height);
        found = true;
      } catch (e) { /* SVG henüz ölçülmemiş olabilir */ }
    }
    if (!found) return;
    var w = maxX - minX;
    var h = maxY - minY;
    var pad = Math.max(w, h) * 0.04;
    svg.setAttribute('viewBox', [
      minX - pad,
      minY - pad,
      w + pad * 2,
      h + pad * 2
    ].join(' '));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }

  /** Seçili illerin sınırlarına viewBox zoom (diğer iller gizlendikten sonra). */
  function fitViewToSelected(svg, seciliIller) {
    if (!svg || !seciliIller || !seciliIller.length) return;
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var found = false;
    var groups = svg.querySelectorAll('g[data-plaka], g[data-plate]');
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      if (seciliIller.indexOf(getPlaka(g)) < 0) continue;
      try {
        var bb = g.getBBox();
        if (!bb.width && !bb.height) continue;
        minX = Math.min(minX, bb.x);
        minY = Math.min(minY, bb.y);
        maxX = Math.max(maxX, bb.x + bb.width);
        maxY = Math.max(maxY, bb.y + bb.height);
        found = true;
      } catch (e) { /* SVG henüz ölçülmemiş olabilir */ }
    }
    if (!found) return;
    var w = maxX - minX;
    var h = maxY - minY;
    var pad = Math.max(w, h) * 0.1;
    svg.setAttribute('viewBox', [
      minX - pad,
      minY - pad,
      w + pad * 2,
      h + pad * 2
    ].join(' '));
  }

  function onProvinceClick(root, handler) {
    if (!root || typeof handler !== 'function') return;
    root.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || (t.tagName !== 'path' && t.tagName !== 'PATH')) return;
      var plaka = resolvePlaka(t);
      if (plaka) handler(plaka, t, e);
    });
  }

  var DEFAULT_LEGEND_COLORS = ['#fff9c4', '#f8bbd0', '#81c784', '#64b5f6', '#ef9a9a'];

  /** Metrik aralığından lejant satırları (üstte yüksek değer). */
  function buildLegendScale(scaleOpts) {
    scaleOpts = scaleOpts || {};
    var min = scaleOpts.min != null ? scaleOpts.min : 0;
    var max = scaleOpts.max != null ? scaleOpts.max : 100;
    var steps = scaleOpts.steps || 5;
    var colors = scaleOpts.colors;
    if (!colors || !colors.length) colors = DEFAULT_LEGEND_COLORS.slice(0, steps);
    while (colors.length < steps) colors.push(colors[colors.length - 1]);
    var items = [];
    var span = max - min;
    var stepSize = span / steps;
    for (var i = steps - 1; i >= 0; i--) {
      var lo = i === 0 ? min : Math.round(min + stepSize * i);
      var hi = i === steps - 1 ? max : Math.round(min + stepSize * (i + 1)) - 1;
      if (hi < lo) hi = lo;
      items.push({
        color: colors[i],
        label: lo + ' – ' + hi
      });
    }
    return items;
  }

  /** Harita konteynerinin sol altına renk lejantı. */
  function renderLegend(container, items, opts) {
    if (!container || !items || !items.length) return;
    opts = opts || {};
    var old = container.querySelector('.mock-geo-map-legend');
    if (old) old.remove();
    var ul = document.createElement('ul');
    ul.className = 'mock-geo-map-legend';
    ul.setAttribute('aria-label', opts.legendLabel || 'Lejant');
    for (var i = 0; i < items.length; i++) {
      var li = document.createElement('li');
      var sw = document.createElement('span');
      sw.className = 'mock-geo-map-legend-swatch';
      sw.style.background = items[i].color;
      var lbl = document.createElement('span');
      lbl.className = 'mock-geo-map-legend-label';
      lbl.textContent = items[i].label;
      li.appendChild(sw);
      li.appendChild(lbl);
      ul.appendChild(li);
    }
    container.appendChild(ul);
  }

  function resolveLegendItems(opts) {
    if (opts.legend === false) return null;
    if (Array.isArray(opts.legend) && opts.legend.length) return opts.legend;
    if (opts.legendScale) return buildLegendScale(opts.legendScale);
    return buildLegendScale({ min: 0, max: 100, steps: 5 });
  }

  /**
   * @param {string|Element} target — selector veya element
   * @param {Object} [opts]
   * @param {string} [opts.templateId] — mockup HTML içi <template> (file:// öncelikli)
   * @param {string} [opts.svgMarkup] — doğrudan SVG metni
   * @param {string} [opts.mapUrl] — http(s) veya yedek; file:// için templateId kullan
   * @param {string} [opts.kapsam] — 'turkiye' | 'secili-iller' | 'ankara'
   * @param {string|string[]} [opts.seciliIller] — plaka listesi (map.svg)
   * @param {Object} [opts.colors] — plaka veya ilçe sıra no → renk
   * @param {boolean} [opts.hideLabels] — true ile etiketleri gizle; varsayılan false (il / ilçe adları görünür)
   * @param {Array<{color:string,label:string}>} [opts.legend] — lejant satırları (üstte yüksek değer)
   * @param {Object} [opts.legendScale] — { min, max, steps, colors } ile otomatik lejant
   * @param {false} [opts.legend] — lejantı kapatmak için false
   * @param {string} [opts.legendLabel] — erişilebilirlik etiketi (varsayılan «Lejant»)
   * @param {Function} [opts.onClick]
   */
  function init(target, opts) {
    opts = opts || {};
    var container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!container) return Promise.resolve(null);

    var url = opts.mapUrl || 'assets/map.svg';
    var ankara = opts.kapsam === 'ankara' || isAnkaraMap(url) ||
      (opts.templateId && /ankara/i.test(opts.templateId));
    var colors = opts.colors || (ankara
      ? parseDistrictColorMap(opts.ornekRenkler)
      : parseColorMap(opts.ornekRenkler));
    var paintOpts = {
      kapsam: opts.kapsam || 'turkiye',
      seciliIller: opts.seciliIller
    };

    var loadPromise;
    if (opts.templateId) {
      loadPromise = mountFromTemplate(container, opts.templateId);
    } else if (opts.svgMarkup) {
      loadPromise = Promise.resolve(mount(container, opts.svgMarkup));
    } else {
      loadPromise = load(container, url);
    }

    return loadPromise.then(function (svg) {
      var root = svg || (container && container.querySelector('svg'));
      var hideLabels = opts.hideLabels;
      if (hideLabels === undefined) hideLabels = false;
      prepareSvgDisplay(root, { hideLabels: hideLabels });
      if (ankara) {
        paintDistricts(root || container, colors, opts.defaultFill);
      } else {
        paint(root || container, colors, opts.defaultFill, paintOpts);
      }
      if (opts.onClick) onProvinceClick(svg || container, opts.onClick);
      var legendItems = resolveLegendItems(opts);
      if (legendItems) renderLegend(container, legendItems, opts);
      return svg;
    }).catch(function () {
      if (container) {
        container.innerHTML = '<p class="mock-report-hint">Harita yüklenemedi («' +
          url + '»). Zip içinde klasör yapısını koruyun; mockup dosyasına göre göreli yol kullanın.</p>';
      }
      return null;
    });
  }

  window.MOCK_GEO_MAP = {
    padPlaka: padPlaka,
    parsePlakaList: parsePlakaList,
    parseColorMap: parseColorMap,
    parseDistrictColorMap: parseDistrictColorMap,
    isAnkaraMap: isAnkaraMap,
    resolveMapUrl: resolveMapUrl,
    mountFromTemplate: mountFromTemplate,
    prepareSvgDisplay: prepareSvgDisplay,
    isDistrictShapePath: isDistrictShapePath,
    load: load,
    paint: paint,
    paintDistricts: paintDistricts,
    fitViewToDistricts: fitViewToDistricts,
    fitViewToSelected: fitViewToSelected,
    onProvinceClick: onProvinceClick,
    buildLegendScale: buildLegendScale,
    renderLegend: renderLegend,
    init: init
  };
})();
