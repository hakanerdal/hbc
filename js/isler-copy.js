(function () {
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function initIssueLayout() {
    document.querySelectorAll('.issue').forEach(function (issue) {
      if (issue.querySelector('.issue-copy-block')) return;

      var mockup = issue.querySelector('.issue-mockup');
      var btn = issue.querySelector('.copy-btn');
      if (!btn) return;

      var block = document.createElement('div');
      block.className = 'issue-copy-block';

      var toolbar = document.createElement('div');
      toolbar.className = 'issue-copy-toolbar';
      btn.classList.add('issue-copy-btn');
      toolbar.appendChild(btn);
      block.appendChild(toolbar);

      var toMove = [];
      var el = mockup ? mockup.nextElementSibling : issue.firstElementChild;
      while (el && el !== btn) {
        var next = el.nextElementSibling;
        toMove.push(el);
        el = next;
      }

      if (mockup) {
        mockup.insertAdjacentElement('afterend', block);
      } else {
        issue.insertBefore(block, issue.firstChild);
      }
      toMove.forEach(function (node) {
        block.appendChild(node);
      });
    });
  }

  function buildIssueCopy(issue) {
    var block = issue.querySelector('.issue-copy-block');
    var clone = (block || issue).cloneNode(true);
    clone.querySelectorAll('.copy-btn, .issue-copy-toolbar').forEach(function (el) {
      el.remove();
    });
    clone.querySelectorAll('strong').forEach(function (s) {
      s.replaceWith(document.createTextNode('*' + s.textContent + '*'));
    });
    return clone.innerText.replace(/\n{3,}/g, '\n\n').trim();
  }

  function initCopyButtons() {
    document.querySelectorAll('.issue .issue-copy-btn').forEach(function (btn) {
      if (btn.dataset.copyBound) return;
      btn.dataset.copyBound = '1';
      btn.addEventListener('click', function () {
        var issue = btn.closest('.issue');
        if (!issue) return;
        copyText(buildIssueCopy(issue)).then(function () {
          var prev = btn.textContent;
          btn.textContent = 'Kopyalandı';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = prev;
            btn.classList.remove('copied');
          }, 1600);
        });
      });
    });
  }

  initIssueLayout();
  initCopyButtons();
})();
