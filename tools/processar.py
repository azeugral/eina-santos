"""Recorta as fotos do Instagram (../_ref/ig/fotos/NNN_K.jpg) e salva em WebP (640 e 1080 px de largura)
em assets/img/. Também copia as capas do Guia do Grisalho (../_ref/yt) e recodifica os reels (../_ref/videos).

Cada foto: (saída, origem, proporção w/h, foco_y, metade). foco_y vai de 0 (topo) a 1 (base);
metade = 'e' ou 'd' usa só a metade esquerda/direita da origem (montagens de antes e depois).

Uso: python -I tools/processar.py [--videos]
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
REF = RAIZ.parent / "_ref"
IMG = RAIZ / "assets" / "img"
VID = RAIZ / "assets" / "video"

FOTOS = [
    # antes e depois: a montagem 2018 x 2025 que a própria Eina postou, inteira
    ("antes-depois", "037_0", 4 / 5, .5, None),
    # história
    ("filha", "001_0", 4 / 5, .5, None),
    ("filha-2", "091_0", 4 / 5, .4, None),
    ("sobre", "012_1", 4 / 5, .3, None),
    # comunidade e mentoria
    ("encontro", "013_0", 5 / 4, .5, None),
    ("mentora", "065_8", 1, .45, None),
    # retratos
    ("r-1", "040_1", 4 / 5, .3, None),
    ("r-2", "187_2", 4 / 5, .3, None),
    ("r-3", "135_2", 4 / 5, .3, None),
    ("r-4", "015_8", 4 / 5, .35, None),
    ("r-5", "040_2", 4 / 5, .3, None),
    ("r-6", "187_4", 4 / 5, .3, None),
    # looks
    ("l-1", "174_0", 4 / 5, .3, None),
    ("l-2", "194_0", 4 / 5, .3, None),
    ("l-3", "201_0", 4 / 5, .3, None),
    ("l-4", "214_0", 4 / 5, .3, None),
    ("l-5", "245_1", 4 / 5, .3, None),
    ("l-6", "252_1", 4 / 5, .3, None),
    ("l-7", "318_3", 4 / 5, .3, None),
    ("l-8", "030_0", 4 / 5, .45, None),
    ("l-9", "164_1", 4 / 5, .3, None),
    ("l-10", "012_0", 4 / 5, .3, None),
    ("l-11", "209_0", 4 / 5, .3, None),
    ("l-12", "019_0", 4 / 5, .5, None),
    # parcerias
    ("produto", "323_0", 4 / 5, .5, None),
    ("evento", "049_0", 4 / 5, .45, None),
]
LARGURAS = (640, 1080)

REELS = [("penteado", "183"), ("chanel", "612"), ("dicas", "153")]


def recorte(im, prop, foco):
    w, h = im.size
    if w / h > prop:
        nw = round(h * prop)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = round(w / prop)
    y = round((h - nh) * foco)
    return im.crop((0, y, w, y + nh))


def fotos():
    IMG.mkdir(parents=True, exist_ok=True)
    for nome, origem, prop, foco, metade in FOTOS:
        im = ImageOps.exif_transpose(Image.open(REF / "ig" / "fotos" / f"{origem}.jpg")).convert("RGB")
        if metade:
            w, h = im.size
            im = im.crop((0, 0, w // 2, h) if metade == "e" else (w // 2, 0, w, h))
        im = recorte(im, prop, foco)
        for L in LARGURAS:
            # a foto menor que 1080 sai com o nome -1080 na largura dela, para o srcset nunca quebrar
            out = im if im.width <= L else im.resize((L, round(L / im.width * im.height)), Image.LANCZOS)
            out.save(IMG / f"{nome}-{L}.webp", quality=82, method=6)
    # topo: Eina de blusa de oncinha, recortada (rembg, birefnet-portrait) do próprio post rosa dela (056, mar/2025).
    # O corte para logo abaixo das mãos, antes do selo "@einasantoc" do post; centrado no corpo dela
    rec = Image.open(REF / "recorte" / "056_0-birefnet-portrait.png").convert("RGBA").crop((165, 345, 845, 1215))
    # a borda do recorte vem 2 px para dentro e suavizada, senão sobra um contorno claro do fundo do post
    rec.putalpha(rec.getchannel("A").filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(.7)))
    for L in (480, 680):
        rec.resize((L, round(L / rec.width * rec.height)), Image.LANCZOS).save(IMG / f"hero-eina-{L}.webp", quality=90, method=6)
    for capa in sorted((REF / "yt").glob("*.jpg")):
        im = Image.open(capa).convert("RGB")
        im.resize((640, 360), Image.LANCZOS).save(IMG / f"yt-{capa.stem}.webp", quality=80, method=6)
    print(len(FOTOS), "fotos")


def videos():
    VID.mkdir(parents=True, exist_ok=True)
    for nome, n in REELS:
        src = REF / "videos" / f"{n}.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf", "scale=540:-2", "-c:v", "libx264",
                        "-preset", "slow", "-crf", "31", "-maxrate", "900k", "-bufsize", "1800k", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart",
                        str(VID / f"{nome}.mp4")], check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1.5", "-i", str(src), "-frames:v", "1",
                        "-vf", "scale=540:-2", str(IMG / f"poster-{nome}.webp")], check=True)
        print(nome, round((VID / f"{nome}.mp4").stat().st_size / 1e6, 2), "MB")


if __name__ == "__main__":
    fotos()
    if "--videos" in sys.argv:
        videos()
