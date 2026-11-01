"""Gera og.jpg (1200x630, a prévia do link no WhatsApp/Instagram), favicon-32.png e apple-touch-icon.png
renderizando HTML no Chromium com as fontes do site. Precisa do servidor local na porta 8881.
O WhatsApp recorta a prévia em quadrado no centro, então nome e rosto ficam perto do meio.

Uso: python -I tools/gerar_og.py
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
BASE = "http://localhost:8881/"

OG = """<!doctype html><html><head><base href="%s"><link rel="stylesheet" href="assets/css/fontes.css">
<style>
body{margin:0;width:1200px;height:630px;overflow:hidden;background:#ebe8e3;font-family:'Albert Sans';position:relative}
canvas{position:absolute;inset:0}
img{position:absolute;right:110px;bottom:0;height:600px}
.t{position:absolute;left:150px;top:205px;z-index:2}
h1{font:360 112px/.9 'Fraunces';font-variation-settings:'opsz' 144;letter-spacing:-.035em;margin:0;color:#222125}
h1 span{display:block;padding-left:.55em}
p{margin:22px 0 0;font-size:24px;font-weight:500;color:#b3172c}
</style></head><body><canvas id="c" width="1200" height="630"></canvas>
<img src="assets/img/hero-recorte-1080.webp"><div class="t"><h1>Eina <span>Santos</span></h1><p>Cabelo grisalho e transição capilar</p></div>
<script src="assets/js/fios.js"></script><script>prataGL(document.getElementById('c')).desenhar(1.2,0,0)</script></body></html>""" % BASE

ICONE = """<!doctype html><html><head><base href="%s"><link rel="stylesheet" href="assets/css/fontes.css">
<style>body{margin:0;width:180px;height:180px;display:grid;place-items:center;background:#1a191d;color:#ebe8e3;
font:400 128px/1 'Fraunces';font-variation-settings:'opsz' 144}b{color:#b3172c;font-weight:400}</style></head>
<body><div>E<b>.</b></div></body></html>""" % BASE


def main():
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = b.new_page(viewport={"width": 1200, "height": 630})
        pg.goto(BASE + "404"); pg.set_content(OG, wait_until="networkidle"); pg.wait_for_timeout(600)
        pg.screenshot(path=str(RAIZ / "og.jpg"), type="jpeg", quality=86)
        for nome, lado in (("apple-touch-icon.png", 180), ("favicon-32.png", 32)):
            pg = b.new_page(viewport={"width": 180, "height": 180}, device_scale_factor=lado / 180)
            pg.goto(BASE + "404"); pg.set_content(ICONE, wait_until="networkidle"); pg.wait_for_timeout(300)
            pg.screenshot(path=str(RAIZ / nome))
        b.close()
    print("og.jpg, favicon-32.png, apple-touch-icon.png")


if __name__ == "__main__":
    main()
