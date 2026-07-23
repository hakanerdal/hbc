(function () {
  function getTitle(issue) {
    var h4 = issue.querySelector('h4');
    var t = h4 ? h4.textContent.trim() : issue.id;
    return t.replace(/^\[(BE|FE)\]\s*/i, '');
  }

  function switchTab(name) {
    document.querySelectorAll('.task-tab').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === name);
    });
    document.querySelectorAll('[data-tab-panel]').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-tab-panel') !== name;
    });
  }

  function setActive(nav, id) {
    nav.querySelectorAll('.rehber-toc-link').forEach(function (a) {
      a.classList.toggle('rehber-toc-link--active', a.dataset.target === id);
    });
  }

  function build() {
    var toc = document.getElementById('isler-toc');
    if (!toc) return;

    var sections = [
      { key: 'be', label: 'Backend', panel: 'panel-be' },
      { key: 'fe', label: 'Frontend', panel: 'panel-fe' }
    ];

    var nav = document.createElement('nav');
    nav.className = 'rehber-toc-nav';
    nav.setAttribute('aria-label', 'Task listesi');

    var hasLinks = false;
    sections.forEach(function (sec) {
      var panel = document.getElementById(sec.panel);
      if (!panel) return;
      var issues = panel.querySelectorAll('.issue');
      if (!issues.length) return;
      hasLinks = true;

      var heading = document.createElement('p');
      heading.className = 'isler-toc-section';
      heading.textContent = sec.label;
      nav.appendChild(heading);

      issues.forEach(function (issue) {
        if (!issue.id) {
          issue.id = 'issue-' + Math.random().toString(36).slice(2, 9);
        }
        var a = document.createElement('a');
        a.href = '#' + issue.id;
        a.className = 'rehber-toc-link rehber-toc-link--sub';
        a.textContent = getTitle(issue);
        a.dataset.target = issue.id;
        a.dataset.tab = sec.key;
        nav.appendChild(a);
      });
    });

    if (!hasLinks) return;
    toc.appendChild(nav);

    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-target]');
      if (!a) return;
      e.preventDefault();
      if (a.dataset.tab) switchTab(a.dataset.tab);
      var target = document.getElementById(a.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + a.dataset.target);
        setActive(nav, a.dataset.target);
      }
    });

    var hash = (location.hash || '').replace('#', '');
    if (hash) {
      var issue = document.getElementById(hash);
      if (issue) {
        var panel = issue.closest('[data-tab-panel]');
        if (panel) switchTab(panel.getAttribute('data-tab-panel'));
        setActive(nav, hash);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
