"""Mockup HTML'e harita SVG'lerini <template> olarak gömer (file:// uyumu)."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def clean_svg(text: str) -> str:
    return re.sub(r"<\?xml[^>]*\>", "", text, flags=re.I).strip()


def embed(html_path: Path, map_path: Path, ankara_path: Path) -> None:
    map_svg = clean_svg(map_path.read_text(encoding="utf-8"))
    ankara_svg = clean_svg(ankara_path.read_text(encoding="utf-8"))

    templates = (
        '<template id="geo-map-turkiye" data-geo-map="turkiye" hidden>\n'
        + map_svg
        + "\n</template>\n"
        + '<template id="geo-map-ankara" data-geo-map="ankara" hidden>\n'
        + ankara_svg
        + "\n</template>\n"
    )

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
    embed(
        base / "mockup" / "cografi-dagilim.html",
        base / "assets" / "map.svg",
        base / "assets" / "ankara.svg",
    )


if __name__ == "__main__":
    main()
