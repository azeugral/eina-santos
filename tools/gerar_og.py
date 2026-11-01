"""Gera og.jpg (1200x630, a prévia do link no WhatsApp/Instagram), favicon-32.png e apple-touch-icon.png
renderizando HTML no Chromium com as fontes do site. Precisa do servidor local na porta 8881.
Mesmo molde do topo (o post rosa dela): nome, a palavra grande com ecos, florais. O WhatsApp recorta em quadrado no
centro, onde fica o rosto.

Uso: python -I tools/gerar_og.py
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
BASE = "http://localhost:8881/"

OG = """<!doctype html><html><head><base href="%s"><link rel="stylesheet" href="assets/css/fontes.css">
<style>
body{margin:0;width:1200px;height:630px;overflow:hidden;position:relative;color:#fbf3ee;font-family:'Albert Sans';
  background:linear-gradient(180deg,#cda7a0,#c9a29b 55%%,#c49b94)}
.arco{position:absolute;left:50%%;bottom:596px;width:900px;height:900px;transform:translateX(-50%%);border:1px solid rgba(251,243,238,.75);border-radius:50%%}
.nome{position:absolute;left:0;right:0;top:42px;text-align:center;font:300 34px/1 'Albert Sans'}.nome b{font-weight:700}
.palavra{position:absolute;left:0;right:0;top:86px;text-align:center;font:400 196px/.86 'Marcellus';text-transform:uppercase;letter-spacing:.015em}
.eco{top:254px;color:rgba(251,243,238,.26)}.eco2{top:422px;color:rgba(251,243,238,.16)}
.flor{position:absolute;bottom:0;height:300px;aspect-ratio:574/1410;background:rgba(251,243,238,.82);-webkit-mask:url(assets/img/floral-haste.webp) no-repeat center/contain}
img{position:absolute;bottom:0;left:50%%;transform:translateX(-50%%);height:470px}
p{position:absolute;bottom:40px;margin:0;font:italic 360 30px/1.2 'Fraunces';color:#2a2224}
</style></head><body><span class="arco"></span><div class="nome">Eina <b>Santos</b></div>
<div class="palavra">Grisalho</div><div class="palavra eco">Grisalho</div><div class="palavra eco2">Grisalho</div>
<span class="flor" style="left:340px;transform:scaleX(-1)"></span><span class="flor" style="right:340px"></span>
<img src="assets/img/hero-eina-680.webp"><p style="left:70px">Cabelo grisalho</p><p style="right:70px">Transição capilar</p></body></html>""" % BASE

ICONE = """<!doctype html><html><head><base href="%s"><link rel="stylesheet" href="assets/css/fontes.css">
<style>body{margin:0;width:180px;height:180px;display:grid;place-items:center;background:#c9a29b;color:#fbf3ee;
font:400 132px/1 'Marcellus'}</style></head><body><div>E</div></body></html>""" % BASE


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
