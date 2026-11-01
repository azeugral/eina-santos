"""Gera og.jpg (1200x630, a prévia do link no WhatsApp/Instagram), favicon-32.png e apple-touch-icon.png
renderizando HTML no Chromium com as fontes do site. Precisa do servidor local na porta 8881.
Mesma capa do topo: o nome atrás da cabeça dela. O WhatsApp recorta em quadrado no centro, onde fica o rosto.

Uso: python -I tools/gerar_og.py
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
BASE = "http://localhost:8881/"

OG = """<!doctype html><html><head><base href="%s"><link rel="stylesheet" href="assets/css/fontes.css">
<style>
body{margin:0;width:1200px;height:630px;overflow:hidden;position:relative;color:#18181a;font-family:'Albert Sans';
  background:radial-gradient(ellipse 70%% 85%% at 50%% 42%%,#e4e3e0 0%%,#d2d1ce 48%%,#bbbab7 100%%)}
h1{position:absolute;left:0;right:0;top:70px;margin:0;display:grid;grid-template-columns:1fr 120px 1fr;
  font:330 168px/.82 'Fraunces';font-variation-settings:'opsz' 144;letter-spacing:-.045em}
h1 span:first-child{justify-self:end}
img{position:absolute;bottom:0;left:50%%;transform:translateX(-50%%);height:560px;filter:drop-shadow(0 22px 36px rgba(24,24,26,.2))}
p{position:absolute;left:0;right:0;bottom:38px;margin:0;display:flex;justify-content:space-between;padding:0 70px;font:italic 340 28px/1.2 'Fraunces'}
</style></head><body><h1><span>Eina</span><span></span><span>Santos</span></h1>
<img src="assets/img/hero-recorte-1005.webp"><p><span>Cabelo grisalho</span><span>Transição capilar</span></p></body></html>""" % BASE

ICONE = """<!doctype html><html><head><base href="%s"><link rel="stylesheet" href="assets/css/fontes.css">
<style>body{margin:0;width:180px;height:180px;display:grid;place-items:center;background:#18181a;color:#fff;
font:340 128px/1 'Fraunces';font-variation-settings:'opsz' 144}b{color:#9c9da1;font-weight:400}</style></head>
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
