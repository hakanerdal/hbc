"""Mockup HTML'e harita SVG'lerini <template> olarak gömer (file:// uyumu)."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Çalışma klasöründe aranacak mockup dosya adları (öncelik sırası)
HTML_CANDIDATES = (
    "dashboard.html",
    "rapor.html",
    "cografi-dagilim.html",
)


def clean_svg(text: str) -> str:
    return re.sub(r"<\?xml[^>]*\>", "", text, flags=re.I).strip()


def find_html(mockup_dir: Path) -> Path:
    for name in HTML_CANDIDATES:
        p = mockup_dir / name
        if p.is_file():
            return p
    raise SystemExit(
        f"mockup HTML bulunamadı ({mockup_dir}): {', '.join(HTML_CANDIDATES)}"
    )


def embed(html_path, map_path, ankara_path) -> None:
    templates_parts = []
    if map_path and map_path.is_file():
        templates_parts.append(
            '<template id="geo-map-turkiye" data-geo-map="turkiye" hidden>\n'
            + clean_svg(map_path.read_text(encoding="utf-8"))
            + "\n</template>\n"
        )
    if ankara_path and ankara_path.is_file():
        templates_parts.append(
            '<template id="geo-map-ankara" data-geo-map="ankara" hidden>\n'
            + clean_svg(ankara_path.read_text(encoding="utf-8"))
            + "\n</template>\n"
        )
    if not templates_parts:
        raise SystemExit(f"SVG yok: map.svg / ankara.svg bekleniyor ({html_path.parent.parent / 'assets'})")

    templates = "".join(templates_parts)

    html = html_path.read_text(encoding="utf-8")
    html = re.sub(
        r'<template id="geo-map-turkiye"[\s\S]*?</template>\s*', "", html
    )
    html = re.sub(
        r'<template id="geo-map-ankara"[\s\S]*?</template>\s*', "", html
    )

    marker = '<script src="../../../js/mock-geo-map.js"></script>'
    if marker not in html:
        raise SystemExit(f"marker not found in {html_path}")
    html = html.replace(marker, templates + marker, 1)

    html = html.replace(
        "mapUrl: '../assets/map.svg',",
        "templateId: 'geo-map-turkiye',",
    )
    html = html.replace(
        "mapUrl: '../assets/ankara.svg',",
        "templateId: 'geo-map-ankara',",
    )

    html_path.write_text(html, encoding="utf-8")
    print(f"OK {html_path} ({html_path.stat().st_size} bytes)")


def main() -> None:
    modul = sys.argv[1] if len(sys.argv) > 1 else "taslak_demo"
    base = ROOT / "calismalarim" / modul
    mockup_dir = base / "mockup"
    assets = base / "assets"
    html_path = find_html(mockup_dir)
    embed(
        html_path,
        assets / "map.svg",
        assets / "ankara.svg",
    )


if __name__ == "__main__":
    main()
