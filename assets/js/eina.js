/* Eina Santos: topo, menu, entradas, fios de prata, comparador, manifesto, vídeos com fala, galeria. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toque = matchMedia('(hover: none), (pointer: coarse)').matches;

  const ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();

  /* entrada do topo depois das fontes (ou 1,2 s, o que vier antes) */
  const hero = $('.hero');
  if (hero) {
    let foi = false;
    const entrar = () => { if (foi) return; foi = true; requestAnimationFrame(() => hero.classList.add('entrou')); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(entrar);
    setTimeout(entrar, 1200);
  }

  /* topo: sólido ao rolar, some ao descer e volta ao subir */
  const topo = $('#topo'), gaveta = $('#gaveta'), menuBtn = $('.menu-btn');
  let yAnt = 0;
  function rolar() {
    const y = scrollY, lim = hero ? hero.offsetHeight * .6 : 80;
    topo.classList.toggle('solido', y > 40);
    const aberta = gaveta && gaveta.classList.contains('aberta');
    topo.classList.toggle('some', !aberta && y > lim && y > yAnt + 2);
    if (y < yAnt - 2 || y < lim) topo.classList.remove('some');
    yAnt = y;
  }
  addEventListener('scroll', rolar, { passive: true }); rolar();

  /* link ativo no menu */
  const links = $$('.topo nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(ents => ents.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('ativo', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => { const s = $(a.getAttribute('href')); s && io.observe(s); });
  }

  /* menu do celular */
  function gavetaAbrir(abrir) {
    if (!gaveta) return;
    menuBtn.setAttribute('aria-expanded', abrir);
    menuBtn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    if (abrir) {
      gaveta.hidden = false; document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => gaveta.classList.add('aberta')));
      topo.classList.add('solido'); topo.classList.remove('some');
    } else {
      gaveta.classList.remove('aberta'); document.documentElement.style.overflow = '';
      setTimeout(() => { if (!gaveta.classList.contains('aberta')) gaveta.hidden = true; }, 380);
      rolar();
    }
  }
  menuBtn && menuBtn.addEventListener('click', () => gavetaAbrir(menuBtn.getAttribute('aria-expanded') !== 'true'));
  gaveta && $$('a', gaveta).forEach(a => a.addEventListener('click', () => gavetaAbrir(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && gaveta && !gaveta.hidden) gavetaAbrir(false); });
  addEventListener('resize', () => { if (innerWidth > 1100 && gaveta && !gaveta.hidden) gavetaAbrir(false); });

  /* entradas ao rolar */
  const io = 'IntersectionObserver' in window && !reduz
    ? new IntersectionObserver(ents => ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 })
    : null;
  const observar = el => io ? io.observe(el) : el.classList.add('visto');
  $$('.revela').forEach(observar);

  /* contadores */
  $$('[data-conta]').forEach(el => {
    const fim = +el.dataset.conta; if (reduz) return;
    el.textContent = '0';
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      const t0 = performance.now(), dur = 1400;
      const passo = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(fim * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(passo); };
      requestAnimationFrame(passo);
    }, { threshold: .6 }).observe(el);
  });

  /* fios de prata (assets/js/fios.js): ao vivo em WebGL no desktop; em telas de toque, o MP4 do mesmo
     shader. Só anima quando está na tela; com "reduzir movimento" fica um quadro parado. */
  $$('[data-fios]').forEach(box => {
    const cv = $('canvas', box), vid = $('video', box), tema = +box.dataset.tema;
    const ver = cb => 'IntersectionObserver' in window
      ? new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: '200px 0px' }).observe(box)
      : cb(true);
    if (toque) {
      box.classList.add('em-video');
      vid.poster = box.dataset.poster;
      ver(dentro => {
        if (dentro) {
          if (!vid.src) {
            vid.src = box.dataset.v;
            vid.addEventListener('loadeddata', () => box.classList.add('viva'), { once: true });
          }
          if (!reduz) { const p = vid.play(); if (p && p.catch) p.catch(() => {}); }
        } else vid.pause();
      });
      return;
    }
    if (!window.prataGL) return;
    let G = null;
    try { G = prataGL(cv); } catch (e) { G = null; }
    if (!G) return;
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); box.classList.remove('viva'); G = null; });
    const CICLO = 30000;
    let esc = Math.min(devicePixelRatio || 1, 2) * .75, fase = 1.2;
    const ajusta = () => {
      if (!G) return;
      cv.width = Math.max(2, Math.round(box.clientWidth * esc)); cv.height = Math.max(2, Math.round(box.clientHeight * esc));
      G.desenhar(fase, 0, tema);
    };
    ajusta(); addEventListener('resize', ajusta);
    if (reduz) { box.classList.add('viva'); return; }
    let ve = false, ult = 0, soma = 0, n = 0;
    const t0 = performance.now();
    const quadro = t => {
      if (!G) return;
      requestAnimationFrame(quadro);
      if (!ve || document.hidden) { ult = 0; return; }
      if (ult) { soma += t - ult; n++; }
      ult = t;
      if (n === 40) { if (soma / n > 22 && esc > .4) { esc *= .8; ajusta(); } soma = 0; n = 0; }
      fase = ((t - t0) % CICLO) / CICLO * 6.283185307179586;
      G.desenhar(fase, 0, tema);
      box.classList.add('viva');
    };
    ver(dentro => { ve = dentro; ult = 0; });
    requestAnimationFrame(quadro);
  });

  /* comparador 2018 x 2025 */
  const comp = $('#comparar');
  if (comp) {
    const r = $('input', comp);
    const pinta = v => comp.style.setProperty('--x', v + '%');
    r.addEventListener('input', () => pinta(r.value));
    /* no toque, arrastar na foto mexe o divisor sem travar a rolagem vertical */
    let x0 = null, y0 = null, arrastando = false;
    comp.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; arrastando = false; }, { passive: true });
    comp.addEventListener('touchmove', e => {
      if (x0 === null) return;
      const t = e.touches[0];
      if (!arrastando && Math.abs(t.clientX - x0) > Math.abs(t.clientY - y0) + 4) arrastando = true;
      if (arrastando) {
        const b = comp.getBoundingClientRect();
        const v = Math.min(100, Math.max(0, (t.clientX - b.left) / b.width * 100));
        r.value = v; pinta(v);
      }
    }, { passive: true });
    comp.addEventListener('touchend', () => { x0 = null; });
    /* uma dica de movimento na primeira vez que aparece */
    if (!reduz && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e], o) => {
        if (!e.isIntersecting) return; o.disconnect();
        const t0 = performance.now();
        const passo = t => {
          const k = Math.min(1, (t - t0) / 1600);
          const v = 50 + Math.sin(k * Math.PI * 2) * 14 * (1 - k);
          r.value = v; pinta(v);
          if (k < 1) requestAnimationFrame(passo);
        };
        setTimeout(() => requestAnimationFrame(passo), 500);
      }, { threshold: .6 }).observe(comp);
    }
  }

  /* trilho dos anos */
  const trilho = $('#trilho-anos');
  $$('[data-trilho]').forEach(b => b.addEventListener('click', () => {
    const f = $('figure', trilho); const passo = f ? f.getBoundingClientRect().width + 16 : 300;
    trilho.scrollBy({ left: passo * +b.dataset.trilho, behavior: reduz ? 'auto' : 'smooth' });
  }));

  /* manifesto: as palavras acendem conforme a frase sobe na tela */
  const man = $('[data-palavras]');
  if (man) {
    const destaque = ['olhar:', 'mulheres.'];
    man.innerHTML = man.textContent.trim().split(/\s+/).map(w => `<span class="p${destaque.includes(w) ? ' v' : ''}">${w}</span>`).join(' ');
    const ps = $$('.p', man);
    if (reduz) ps.forEach(p => p.classList.add('on'));
    else {
      const pinta = () => {
        const r = man.getBoundingClientRect(), vh = innerHeight;
        const k = Math.min(1, Math.max(0, (vh * .86 - r.top) / (r.height + vh * .38)));
        const n = Math.round(k * ps.length);
        ps.forEach((p, i) => p.classList.toggle('on', i < n));
      };
      addEventListener('scroll', pinta, { passive: true }); addEventListener('resize', pinta); pinta();
    }
  }

  /* vídeos com fala: tocam mudos quando estão na tela; o botão liga o som do início,
     e só um fica com som por vez */
  const comFala = [];
  $$('.tela-video').forEach(tela => {
    const v = $('video', tela), btn = $('.som', tela);
    const item = { v, comSom: false };
    const tocar = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    item.mudo = () => { item.comSom = false; v.muted = true; v.loop = true; btn.setAttribute('aria-pressed', 'false'); };
    comFala.push(item);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; if (!reduz || item.comSom) tocar(); }
        else { v.pause(); if (item.comSom) item.mudo(); }
      }, { threshold: .35 }).observe(v);
    }
    btn.addEventListener('click', () => {
      if (item.comSom) { item.mudo(); return; }
      comFala.forEach(o => { if (o !== item && o.comSom) o.mudo(); });
      item.comSom = true; v.muted = false; v.currentTime = 0; v.loop = false; tocar();
      btn.setAttribute('aria-pressed', 'true');
    });
    v.addEventListener('ended', () => { item.mudo(); tocar(); });
  });

  /* galeria: looks e retratos em grade 4:5 */
  const FOTOS = {
    looks: [
      ['l-1', 'Blusa preta de mangas transparentes'], ['l-2', 'Camisa branca e saia jeans longa'], ['l-3', 'Calça pantalona bege e regata'],
      ['l-4', 'Camisa branca e calça de alfaiataria'], ['l-5', 'Vestido vermelho no provador'], ['l-6', 'Vestido azul com bolsa de palha'],
      ['l-7', 'Vestido verde e jaqueta jeans'], ['l-8', 'Macacão amarelo no parque'], ['l-9', 'Regata preta e calça branca'],
      ['l-10', 'Camisa listrada e jeans'], ['l-11', 'Regata branca e saia jeans'], ['l-12', 'Conjunto branco em noite de celebração']
    ],
    retratos: [
      ['r-1', 'Retrato com os fios longos'], ['r-5', 'Retrato com colar dourado'], ['r-2', 'Retrato de perfil com blusa verde'],
      ['r-3', 'Retrato com camiseta verde'], ['r-4', 'Chanel e blusa preta'], ['r-6', 'Retrato sorrindo com batom']
    ]
  };
  const galeria = $('#galeria');
  let atual = [];
  function montar(aba) {
    atual = FOTOS[aba];
    galeria.innerHTML = atual.map(([id, alt], i) => `<figure class="foto revela" data-i="${i}">
      <button type="button" aria-label="Ampliar: ${alt}"><img src="assets/img/${id}-640.webp" srcset="assets/img/${id}-640.webp 640w, assets/img/${id}-1080.webp 1080w" sizes="(max-width: 560px) 50vw, (max-width: 1100px) 33vw, 300px" alt="${alt}" loading="lazy" width="640" height="800"></button></figure>`).join('');
    $$('.foto', galeria).forEach(observar);
    $$('.abas button').forEach(b => b.setAttribute('aria-selected', b.dataset.aba === aba));
  }
  if (galeria) {
    montar('looks');
    $$('.abas button').forEach(b => b.addEventListener('click', () => montar(b.dataset.aba)));
    galeria.addEventListener('click', e => { const f = e.target.closest('.foto'); if (f) abrirLuz(+f.dataset.i); });
  }

  /* foto ampliada */
  const luz = $('#luz'), luzImg = $('#luz-img');
  let li = 0, foco = null;
  function pintarLuz() {
    const [id, alt] = atual[li];
    luzImg.style.opacity = 0;
    const src = `assets/img/${id}-1080.webp`, tmp = new Image();
    tmp.onload = () => { luzImg.src = src; luzImg.alt = alt; luzImg.style.opacity = 1; };
    tmp.src = src;
  }
  function abrirLuz(i) {
    li = i; foco = document.activeElement; pintarLuz();
    luz.hidden = false; document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => luz.classList.add('aberta'));
    $('.luz-fechar', luz).focus();
  }
  function fecharLuz() {
    luz.classList.remove('aberta'); document.documentElement.style.overflow = '';
    setTimeout(() => { luz.hidden = true; }, 300);
    foco && foco.focus();
  }
  const passa = d => { li = (li + d + atual.length) % atual.length; pintarLuz(); };
  $('.luz-fechar', luz).addEventListener('click', fecharLuz);
  $('.luz-ant', luz).addEventListener('click', () => passa(-1));
  $('.luz-prox', luz).addEventListener('click', () => passa(1));
  luz.addEventListener('click', e => { if (e.target === luz) fecharLuz(); });
  addEventListener('keydown', e => {
    if (luz.hidden) return;
    if (e.key === 'Escape') fecharLuz(); else if (e.key === 'ArrowRight') passa(1); else if (e.key === 'ArrowLeft') passa(-1);
  });
  let x0 = null;
  luz.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  luz.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) passa(dx < 0 ? 1 : -1); x0 = null; });
})();
