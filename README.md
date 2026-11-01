# Eina Santos · site

Prévia do site da Eina Santos (@einasantosc), criadora de conteúdo sobre cabelo grisalho e transição capilar
em Uberlândia, MG. Página única, estática, sem dependências externas (fontes self-hosted, nenhuma requisição
a terceiros). Publicado no GitHub Pages com `noindex` enquanto é prévia.

## Estrutura

- `index.html`: topo, Minha transição (comparador 2018 × 2025, linha do tempo, montagens), manifesto,
  Beleza Platinada, Guia do Grisalho, Em vídeo, Estilo (looks e retratos), Parcerias, Contato.
- `assets/js/fios.js`: shader dos fios de prata (mecha de cabelo grisalho). Ao vivo em WebGL no desktop;
  nas telas de toque vira MP4 (`assets/video/fios-celular.mp4` e `fios-faixa.mp4`).
- `assets/js/eina.js`: topo, menu, entradas, comparador, manifesto, vídeos com som, galeria e foto ampliada.
- `tools/processar.py`: recorta as fotos do Instagram (`../_ref/ig/fotos`) em WebP 640/1080, as capas do
  YouTube e recodifica os reels (`--videos`). O recorte do topo vem de `../_ref/recorte` (rembg, birefnet-portrait).
- `tools/gerar_fios.py`: renderiza os MP4 dos fios a partir do mesmo shader (`--teste` só salva quadros).
- `tools/gerar_og.py`: og.jpg e ícones (precisa do servidor local na porta 8881).

## CONFIRMAR com a Eina

1. **Link de venda do Beleza Platinada.** Os botões levam ao direct do Instagram (`ig.me/m/einasantosc`).
   O curso ainda está aberto? É curso, mentoria ou comunidade (as legendas usam os três nomes)? Qual o link
   da plataforma e o valor, se ela quiser mostrar?
2. **Conteúdo do curso.** Os seis blocos saíram das legendas (cuidados, curadoria de produtos, corte, estilo,
   emocional, bônus com nutricionista e cardápio em PDF). Conferir se ainda é assim.
3. **Linha do tempo.** "Aos 26 anos", "16 anos pintando", 2018 na gestação, março de 2020, chanel em 2022,
   Beleza Platinada em 2024: tudo tirado das legendas. Confirmar datas.
4. **Marcas em Parcerias.** C&A, Renner, Riachuelo, Bambbu, Triskle, Surya Brasil, Vizcaya, Dailus e Magretta
   aparecem marcadas nas legendas. Ela autoriza listar? Há outras mais recentes?
5. **Números.** 46,5 mil no Instagram, 20,5 mil inscritas e 2,7 mi de visualizações no YouTube (31/10/2026);
   reels de 1,8 mi, 1 mi e 336 mil.
6. **Citação do Beleza Platinada** ("Você não precisa passar por isso sozinha…") é uma síntese das legendas, não
   frase literal. Trocar por uma frase dela, se preferir.
7. **Fotos.** Topo recortado da foto de jul/2025 (post "Grisalho não é tendência"). Fotos com a filha na seção
   do manifesto: ela autoriza?
8. **Domínio.** Ainda sem domínio próprio; ao ligar, trocar og:url/og:image, tirar o `noindex` e criar robots/sitemap.

---

Site por [L R G Z](https://lrgz.com.br)
