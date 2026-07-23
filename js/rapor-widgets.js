(function () {
  var WIDGET_TURLERI = [
    { id: 'ozet', label: 'Sayısal özet (KPI)' },
    { id: 'harita-turkiye', label: 'Türkiye haritası' },
    { id: 'harita-il', label: 'İl haritası (ör. Ankara)' },
    { id: 'bar', label: 'Bar chart' },
    { id: 'pie', label: 'Pie chart' },
    { id: 'line', label: 'Line chart' },
    { id: 'tablo', label: 'Özet liste' }
  ];

  var RAPOR_FILTRE_TURLERI = [
    { id: 'metin', label: 'Metin' },
    { id: 'tarih', label: 'Tarih' },
    { id: 'dropdown', label: 'Dropdown (tekli seçim)' },
    { id: 'il-coklu', label: 'İl (çoklu seçim)' },
    { id: 'evet-hayir', label: 'Evet / Hayır' }
  ];

  var HARITA_KAPSAM_TURLERI = [
    { id: 'turkiye', label: 'Türkiye haritası' },
    { id: 'secili-iller', label: 'Seçili iller haritası' }
  ];

  function isHaritaWidgetTur(tur) {
    return tur === 'harita-turkiye' || tur === 'harita-il' || tur === 'harita';
  }

  /** Eski «harita» + kapsam → harita-turkiye / harita-il */
  function normalizeHaritaWidget(w) {
    if (!w) return w;
    if (w.tur === 'harita') {
      w.tur = w.haritaKapsam === 'secili-iller' ? 'harita-il' : 'harita-turkiye';
    }
    if (w.tur === 'harita-turkiye') {
      w.haritaKapsam = 'turkiye';
      w.haritaTemplateId = 'geo-map-turkiye';
      w.seciliIller = '';
    } else if (w.tur === 'harita-il') {
      w.haritaKapsam = 'ankara';
      w.haritaTemplateId = 'geo-map-ankara';
      w.seciliIller = '06';
    }
    return w;
  }

  function filterWizardWidgets(widgets) {
    var list = widgets || [];
    for (var i = 0; i < list.length; i++) {
      normalizeHaritaWidget(list[i]);
    }
    return list;
  }

  function hasHaritaWidget(widgets) {
    for (var i = 0; i < (widgets || []).length; i++) {
      if (isHaritaWidgetTur(widgets[i].tur)) return true;
    }
    return false;
  }

  /** Harita mockup init templateId (file:// uyumu). */
  function mockupTemplateId(tur) {
    if (tur === 'harita-il') return 'geo-map-ankara';
    return 'geo-map-turkiye';
  }

  /** @deprecated http sunucu yedek — mockup'ta templateId kullan */
  function mockupMapUrl(tur) {
    if (tur === 'harita-il') return '../assets/ankara.svg';
    return '../assets/map.svg';
  }

  /** Sihirbaz / Cursor: hangi SVG dosyalarının çalışma klasörüne kopyalanacağı */
  function haritaMockupAssetFiles(widgets) {
    var files = [];
    var list = widgets || [];
    for (var i = 0; i < list.length; i++) {
      var t = list[i].tur;
      if (t === 'harita-turkiye' && files.indexOf('map.svg') < 0) files.push('map.svg');
      if (t === 'harita-il' && files.indexOf('ankara.svg') < 0) files.push('ankara.svg');
    }
    return files;
  }

  function haritaAssetsSetupPrompt(calismaId, widgets) {
    var files = haritaMockupAssetFiles(widgets);
    if (!files.length) return '';
    var id = calismaId || 'modul';
    var lines = [
      'Harita SVG — çalışma klasörüne kopyala (zip / dosyayı çift tıklama uyumu):',
      'calismalarim/' + id + '/assets/ klasörü yoksa oluştur; repo kökü assets/ içinden kopyala:'
    ];
    for (var i = 0; i < files.length; i++) {
      lines.push('- assets/' + files[i] + ' → calismalarim/' + id + '/assets/' + files[i]);
    }
    lines.push('Mockup HTML: SVG gövdesini <template id="geo-map-turkiye" hidden> / <template id="geo-map-ankara" hidden> içine göm; init({ templateId, kapsam }) — file:// (çift tıklama) uyumu.');
    lines.push('Türkiye haritası: il adları görünür (varsayılan). İl haritası (Ankara): ilçe adları görünür.');
    lines.push('Her harita widget: .mock-report-widget kartı içinde; harita alanı .mock-report-chart--map (tam genişlik).');
    lines.push('Lejant zorunlu: init içinde legendScale { min, max, steps, colors } — colors harita tonlarıyla uyumlu; sol alt köşe (.mock-geo-map-legend).');
    lines.push('Gömme: python scripts/embed-geo-map-templates.py ' + id + ' (veya SVG gövdesini mockup HTML <template> içine elle yapıştır).');
    lines.push('Renk ve örnek veri: MOCK_GEO_MAP.init ile JS tarafında (plaka veya ilçe path sıra no); SVG şablonu renksiz kalır.');
    return lines.join('\n');
  }

  /** [plaka, ad] — 81 il */
  var TURKIYE_ILLER = [
    ['01', 'Adana'], ['02', 'Adıyaman'], ['03', 'Afyonkarahisar'], ['04', 'Ağrı'], ['05', 'Amasya'],
    ['06', 'Ankara'], ['07', 'Antalya'], ['08', 'Artvin'], ['09', 'Aydın'], ['10', 'Balıkesir'],
    ['11', 'Bilecik'], ['12', 'Bingöl'], ['13', 'Bitlis'], ['14', 'Bolu'], ['15', 'Burdur'],
    ['16', 'Bursa'], ['17', 'Çanakkale'], ['18', 'Çankırı'], ['19', 'Çorum'], ['20', 'Denizli'],
    ['21', 'Diyarbakır'], ['22', 'Edirne'], ['23', 'Elazığ'], ['24', 'Erzincan'], ['25', 'Erzurum'],
    ['26', 'Eskişehir'], ['27', 'Gaziantep'], ['28', 'Giresun'], ['29', 'Gümüşhane'], ['30', 'Hakkari'],
    ['31', 'Hatay'], ['32', 'Isparta'], ['33', 'Mersin'], ['34', 'İstanbul'], ['35', 'İzmir'],
    ['36', 'Kars'], ['37', 'Kastamonu'], ['38', 'Kayseri'], ['39', 'Kırklareli'], ['40', 'Kırşehir'],
    ['41', 'Kocaeli'], ['42', 'Konya'], ['43', 'Kütahya'], ['44', 'Malatya'], ['45', 'Manisa'],
    ['46', 'Kahramanmaraş'], ['47', 'Mardin'], ['48', 'Muğla'], ['49', 'Muş'], ['50', 'Nevşehir'],
    ['51', 'Niğde'], ['52', 'Ordu'], ['53', 'Rize'], ['54', 'Sakarya'], ['55', 'Samsun'],
    ['56', 'Siirt'], ['57', 'Sinop'], ['58', 'Sivas'], ['59', 'Tekirdağ'], ['60', 'Tokat'],
    ['61', 'Trabzon'], ['62', 'Tunceli'], ['63', 'Şanlıurfa'], ['64', 'Uşak'], ['65', 'Van'],
    ['66', 'Yozgat'], ['67', 'Zonguldak'], ['68', 'Aksaray'], ['69', 'Bayburt'], ['70', 'Karaman'],
    ['71', 'Kırıkkale'], ['72', 'Batman'], ['73', 'Şırnak'], ['74', 'Bartın'], ['75', 'Ardahan'],
    ['76', 'Iğdır'], ['77', 'Yalova'], ['78', 'Karabük'], ['79', 'Kilis'], ['80', 'Osmaniye'], ['81', 'Düzce']
  ];

  function padPlaka(code) {
    var s = String(code || '').replace(/\D/g, '');
    return s.length === 1 ? '0' + s : s.slice(0, 2);
  }

  function parseSeciliIllerCsv(csv) {
    if (!csv) return [];
    return String(csv).split(/[,;\s]+/).map(padPlaka).filter(Boolean);
  }

  function ilAdi(plaka) {
    var p = padPlaka(plaka);
    for (var i = 0; i < TURKIYE_ILLER.length; i++) {
      if (TURKIYE_ILLER[i][0] === p) return TURKIYE_ILLER[i][1];
    }
    return p;
  }

  function formatSeciliIllerLabel(csv) {
    return parseSeciliIllerCsv(csv).map(function (p) {
      return ilAdi(p) + ' (' + p + ')';
    }).join(', ');
  }

  function ilSingleSelectHtml(selectedCsv, extraAttrs) {
    var selected = parseSeciliIllerCsv(selectedCsv);
    var sel = selected.length ? selected[0] : '';
    var h = '<select class="wizard-secili-iller"' + (extraAttrs || '') + '>';
    h += '<option value="">— İl seçin —</option>';
    for (var i = 0; i < TURKIYE_ILLER.length; i++) {
      var il = TURKIYE_ILLER[i];
      h += '<option value="' + il[0] + '"' + (sel === il[0] ? ' selected' : '') + '>' +
        il[1] + ' (' + il[0] + ')</option>';
    }
    h += '</select>';
    return h;
  }

  /** Toolbar / sihirbaz il filtresi (çoklu) — Tom Select + Bootstrap 5 */
  function ilMultiSelectHtml(selectedCsv, extraAttrs) {
    var selected = parseSeciliIllerCsv(selectedCsv);
    var selSet = {};
    for (var s = 0; s < selected.length; s++) selSet[selected[s]] = true;
    var h = '<select class="form-select mock-tom-select wizard-secili-iller" multiple data-placeholder="İl seçin…"' + (extraAttrs || '') + '>';
    for (var i = 0; i < TURKIYE_ILLER.length; i++) {
      var il = TURKIYE_ILLER[i];
      h += '<option value="' + il[0] + '"' + (selSet[il[0]] ? ' selected' : '') + '>' +
        il[1] + ' (' + il[0] + ')</option>';
    }
    h += '</select>';
    return h;
  }

  function readSeciliIllerFromSelect(el) {
    if (!el) return '';
    if (el.tagName === 'SELECT' && !el.multiple) {
      return el.value || '';
    }
    var ms = window.MULTISELECT_DROPDOWN;
    if (el.classList.contains('mock-multiselect') && ms) {
      return ms.readCsv(el);
    }
    var plakas = [];
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].selected) plakas.push(el.options[i].value);
    }
    return plakas.join(', ');
  }

  function ilCokluToolbarHtml(selectedCsv) {
    var selected = parseSeciliIllerCsv(selectedCsv);
    if (!selected.length) selected = ['06'];
    var selSet = {};
    for (var s = 0; s < selected.length; s++) selSet[selected[s]] = true;
    var h = '<div class="mock-field-inline"><label for="f-il">İl</label>';
    h += '<select class="form-select mock-tom-select" id="f-il" multiple data-placeholder="İl seçin…">';
    for (var i = 0; i < TURKIYE_ILLER.length; i++) {
      var il = TURKIYE_ILLER[i];
      h += '<option value="' + il[0] + '"' + (selSet[il[0]] ? ' selected' : '') + '>' +
        il[1] + '</option>';
    }
    h += '</select></div>';
    return h;
  }

  /** @deprecated ilCokluToolbarHtml kullan */
  function ilCokluSelectOptionsHtml(selectedCsv) {
    return ilCokluToolbarHtml(selectedCsv);
  }

  function haritaKapsamLabel(id) {
    for (var i = 0; i < HARITA_KAPSAM_TURLERI.length; i++) {
      if (HARITA_KAPSAM_TURLERI[i].id === id) return HARITA_KAPSAM_TURLERI[i].label;
    }
    return id;
  }

  function widgetTurLabel(id) {
    for (var i = 0; i < WIDGET_TURLERI.length; i++) {
      if (WIDGET_TURLERI[i].id === id) return WIDGET_TURLERI[i].label;
    }
    if (id === 'harita') return 'Harita';
    return id;
  }

  function filtreTurLabel(id) {
    for (var i = 0; i < RAPOR_FILTRE_TURLERI.length; i++) {
      if (RAPOR_FILTRE_TURLERI[i].id === id) return RAPOR_FILTRE_TURLERI[i].label;
    }
    return id;
  }

  function filtreTurPromptLabel(tur) {
    if (tur === 'evet-hayir') return 'Evet / Hayır — radio buton';
    if (tur === 'il-coklu') return 'İl (çoklu seçim) — Tom Select (Bootstrap 5)';
    return filtreTurLabel(tur);
  }

  function isRaporMockup(mockup, item) {
    if (!mockup) return false;
    if (mockup.rapor === true) return true;
    var id = String(mockup.id || '');
    var href = String(mockup.href || '');
    var label = String(mockup.label || '');
    if (/rapor/i.test(id) || /rapor/i.test(href)) return true;
    if (item && item.ornekRapor && /rapor/i.test(href)) return true;
    return false;
  }

  function defaultWidget(tur) {
    var w = {
      tur: tur || 'ozet',
      baslik: '',
      kartSayisi: '3',
      kart1Etiket: '', kart1Deger: '',
      kart2Etiket: '', kart2Deger: '',
      kart3Etiket: '', kart3Deger: '',
      kart4Etiket: '', kart4Deger: '',
      xEkseni: '', yEkseni: '', ornekKategoriler: '',
      dagilim: '', gruplama: '', ornekDilimler: '',
      zamanEkseni: '', metrik: '', ornekDonemler: '',
      sutunlar: '', sayfalama: 'hayir',
      haritaKapsam: 'turkiye',
      haritaMetrik: '',
      seciliIller: '',
      ornekIller: '',
      detayNot: ''
    };
    return normalizeHaritaWidget(w);
  }

  function widgetSelectOptions(selected) {
    var h = '';
    var sel = selected;
    if (sel === 'harita') sel = 'harita-turkiye';
    for (var i = 0; i < WIDGET_TURLERI.length; i++) {
      var w = WIDGET_TURLERI[i];
      h += '<option value="' + w.id + '"' + (sel === w.id ? ' selected' : '') + '>' + w.label + '</option>';
    }
    return h;
  }

  function formatWidgetDetay(w) {
    var lines = [];
    if (w.baslik) lines.push('başlık: ' + w.baslik);
    if (w.tur === 'ozet') {
      var n = parseInt(w.kartSayisi, 10) || 3;
      for (var i = 1; i <= n && i <= 4; i++) {
        var et = w['kart' + i + 'Etiket'];
        var dg = w['kart' + i + 'Deger'];
        if (et || dg) lines.push('kart ' + i + ': ' + (et || '…') + ' = ' + (dg || '…'));
      }
    } else if (w.tur === 'bar') {
      if (w.xEkseni) lines.push('X: ' + w.xEkseni);
      if (w.yEkseni) lines.push('Y: ' + w.yEkseni);
      if (w.ornekKategoriler) lines.push('örnek kategoriler: ' + w.ornekKategoriler);
    } else if (w.tur === 'pie') {
      if (w.dagilim) lines.push('dağılım: ' + w.dagilim);
      if (w.gruplama) lines.push('gruplama: ' + w.gruplama);
      if (w.ornekDilimler) lines.push('örnek dilimler: ' + w.ornekDilimler);
    } else if (w.tur === 'line') {
      if (w.zamanEkseni) lines.push('zaman ekseni: ' + w.zamanEkseni);
      if (w.metrik) lines.push('metrik: ' + w.metrik);
      if (w.ornekDonemler) lines.push('örnek dönemler: ' + w.ornekDonemler);
    } else if (w.tur === 'tablo') {
      if (w.sutunlar) lines.push('sütunlar: ' + w.sutunlar);
      lines.push('sayfalama: ' + (w.sayfalama === 'evet' ? 'evet' : 'hayır'));
    } else if (isHaritaWidgetTur(w.tur)) {
      normalizeHaritaWidget(w);
      if (w.haritaMetrik) lines.push('metrik: ' + w.haritaMetrik);
      if (w.tur === 'harita-il') {
        lines.push('templateId: geo-map-ankara');
        lines.push('ilçe etiketleri: göster');
      } else if (w.tur === 'harita-turkiye') {
        lines.push('templateId: geo-map-turkiye');
        lines.push('il etiketleri: görünür');
      }
      lines.push('genişlik: tam (%100)');
      lines.push('lejant: legendScale (min/max/steps/colors — harita tonlarıyla uyumlu)');
      if (w.ornekIller) lines.push('örnek renkler: ' + w.ornekIller);
    }
    if (w.detayNot && w.detayNot.trim()) lines.push(w.detayNot.trim());
    return lines.join('; ');
  }

  function formatWidgetPromptLine(w, index) {
    var n = index != null ? (index + 1) + '. ' : '- ';
    var head = n + widgetTurLabel(w.tur);
    if (w.baslik) head += ' — «' + w.baslik + '»';
    var det = formatWidgetDetay(w);
    return det ? head + ' (' + det + ')' : head;
  }

  function widgetsToPromptBlock(widgets, baslik) {
    if (!widgets || !widgets.length) return '';
    var lines = [baslik || 'Widget\'lar (yukarıdan aşağı):'];
    for (var i = 0; i < widgets.length; i++) {
      if (widgets[i].baslik || widgets[i].tur) {
        lines.push(formatWidgetPromptLine(widgets[i], i));
      }
    }
    return lines.join('\n');
  }

  window.HBC_RAPOR_WIDGETS = {
    WIDGET_TURLERI: WIDGET_TURLERI,
    HARITA_KAPSAM_TURLERI: HARITA_KAPSAM_TURLERI,
    RAPOR_FILTRE_TURLERI: RAPOR_FILTRE_TURLERI,
    TURKIYE_ILLER: TURKIYE_ILLER,
    isHaritaWidgetTur: isHaritaWidgetTur,
    normalizeHaritaWidget: normalizeHaritaWidget,
    filterWizardWidgets: filterWizardWidgets,
    hasHaritaWidget: hasHaritaWidget,
    mockupTemplateId: mockupTemplateId,
    mockupMapUrl: mockupMapUrl,
    haritaMockupAssetFiles: haritaMockupAssetFiles,
    haritaAssetsSetupPrompt: haritaAssetsSetupPrompt,
    widgetTurLabel: widgetTurLabel,
    haritaKapsamLabel: haritaKapsamLabel,
    filtreTurLabel: filtreTurLabel,
    filtreTurPromptLabel: filtreTurPromptLabel,
    ilAdi: ilAdi,
    padPlaka: padPlaka,
    parseSeciliIllerCsv: parseSeciliIllerCsv,
    formatSeciliIllerLabel: formatSeciliIllerLabel,
    ilSingleSelectHtml: ilSingleSelectHtml,
    ilMultiSelectHtml: ilMultiSelectHtml,
    readSeciliIllerFromSelect: readSeciliIllerFromSelect,
    ilCokluToolbarHtml: ilCokluToolbarHtml,
    ilCokluSelectOptionsHtml: ilCokluSelectOptionsHtml,
    isRaporMockup: isRaporMockup,
    defaultWidget: defaultWidget,
    widgetSelectOptions: widgetSelectOptions,
    formatWidgetDetay: formatWidgetDetay,
    formatWidgetPromptLine: formatWidgetPromptLine,
    widgetsToPromptBlock: widgetsToPromptBlock
  };
})();
