#!/usr/bin/env python3
"""Mockup HTML dosyalarına Bootstrap 5 (yerel) + Tom Select CDN ekler veya CDN bootstrap yolunu günceller."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_MOCK = '  <link rel="stylesheet" href="../../../css/mock-bootstrap.css" />'
BOOTSTRAP_JS_MOCK = '../../../assets/bootstrap-5.0.2-dist/js/bootstrap.bundle.min.js'
BOOTSTRAP_JS_EKR = '../../assets/bootstrap-5.0.2-dist/js/bootstrap.bundle.min.js'
SCRIPTS_MOCK = f"""<script src="{BOOTSTRAP_JS_MOCK}"></script>
<script src="https://cdn.jsdelivr.net/npm/tom-select@2.4.3/dist/js/tom-select.complete.min.js"></script>
<script src="../../../js/mock-tom-select.js"></script>
"""
CSS_EKR = '  <link rel="stylesheet" href="../../css/mock-bootstrap.css" />'
SCRIPTS_EKR = f"""<script src="{BOOTSTRAP_JS_EKR}"></script>
<script src="https://cdn.jsdelivr.net/npm/tom-select@2.4.3/dist/js/tom-select.complete.min.js"></script>
<script src="../../js/mock-tom-select.js"></script>
"""


def patch_file(path: Path, css_line: str, scripts: str, shell_css: str, meta_script: str) -> bool:
    text = path.read_text(encoding='utf-8')
    orig = text
    if 'mock-bootstrap.css' not in text:
        text = text.replace(shell_css, shell_css + '\n' + css_line)
    if 'mock-tom-select.js' not in text:
        text = text.replace(meta_script, scripts + meta_script)
    if text != orig:
        path.write_text(text, encoding='utf-8')
        return True
    return False


for html in ROOT.joinpath('calismalarim').rglob('mockup/*.html'):
    if patch_file(
        html,
        CSS_MOCK,
        SCRIPTS_MOCK,
        '<link rel="stylesheet" href="mock-shell.css" />',
        '<script src="../../../js/calismalar-meta.js"></script>',
    ):
        print('updated', html.relative_to(ROOT))

for html in ROOT.joinpath('calismalarim').rglob('ekranlar.html'):
    if patch_file(
        html,
        CSS_EKR,
        SCRIPTS_EKR,
        '<link rel="stylesheet" href="../../css/style.css" />',
        '<script src="../../js/calismalar-meta.js"></script>',
    ):
        print('updated', html.relative_to(ROOT))
