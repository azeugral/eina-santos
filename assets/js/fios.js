/* Fios de prata do hero: uma mecha de cabelo grisalho que atravessa a tela devagar, feita só de shader
   (sem imagem). Cada fio tem tom próprio entre grafite, prata e branco; um brilho corre pela mecha como
   luz em cabelo liso. O fundo pérola já sai pintado, então a tela é opaca e o MP4 do celular
   (tools/gerar_fios.py) é o mesmo desenho, sem blend.
   `a` é a fase do loop (0 a 2π): tudo usa múltiplos inteiros de `a` ou cos/sin(a), então o loop fecha sem emenda.
   prataGL(canvas, opcoes) -> {desenhar(fase, celular, tema)}; tema 1 = faixa grafite da seção Beleza Platinada ou null sem WebGL. */
window.PRATA_FS = `precision highp float;
uniform vec2 r;uniform float a;uniform float cel;uniform float tema;
float h(float x){return fract(sin(x*127.1)*43758.5453);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,b=.5;for(int i=0;i<4;i++){v+=b*n(p);p=p*2.03+vec2(1.7,9.2);b*=.5;}return v;}

/* uma camada de fios: dens = fios por altura de tela, larg = espessura (fração do espaço entre fios) */
vec4 camada(vec2 p, float v, float dens, float larg, float semente, vec2 c){
  float s=v*dens+3.2*fbm(vec2(p.x*.55,v*1.4)+c*.3+semente)+.9*fbm(vec2(p.x*2.2,v*5.)+semente*2.);
  float id=floor(s), f=abs(fract(s)-.5);
  float fio=smoothstep(larg,larg*.25,f);
  float t=h(id*.731+semente);
  vec3 tom=mix(mix(vec3(.24,.24,.27),vec3(.36,.36,.40),tema),vec3(.70,.71,.74),smoothstep(.1,.75,t));
  tom=mix(tom,vec3(.97),smoothstep(.82,.97,t));
  /* fios começam e terminam: cabelo não é linha infinita */
  float vivo=smoothstep(.18,.48,n(vec2(id*.37+semente,p.x*1.3+.55*sin(a+id))));
  /* brilho que corre pela mecha (luz em cabelo liso) */
  float sh=pow(.5+.5*sin(p.x*2.4-a+v*6.),14.);
  tom+=vec3(.55)*sh*(.35+.65*t);
  return vec4(tom,fio*vivo);
}

void main(){
  vec2 fc=gl_FragCoord.xy;
  float esc=r.y;
  vec2 p=fc/esc;                    // 0..1 na altura
  vec2 u=fc/r;
  vec2 c=vec2(cos(a),sin(a));
  /* fundo pérola, um pouco mais frio embaixo */
  vec3 col=mix(mix(vec3(.905,.900,.892),vec3(.945,.940,.932),u.y),
               mix(vec3(.085,.082,.094),vec3(.115,.112,.125),u.y),tema);
  col*=1.-.06*length(u-vec2(.3,.55));
  /* eixo da mecha: no desktop corre pelo alto até o cabelo dela; no celular passa atrás dos ombros */
  float x=p.x;
  /* tema 1 (faixa escura): a mecha corre na horizontal pelo meio da faixa */
  float yc=mix(mix(.80+.06*sin(x*2.2+.9)-.04*x, .66-.06*u.x+.04*sin(u.x*4.+1.), cel), .84+.07*sin(x*1.6+.4), tema)
          +.035*sin(1.4*x+a)+.02*sin(2.3*x-2.*a+1.3);
  float v=p.y-yc;
  float largura=mix(mix(.12,.11,cel),.19,tema)*(.8+.3*sin(x*1.7+.6));
  float mecha=smoothstep(largura,largura*.35,abs(v));
  /* camada de trás: fios grossos e suaves (profundidade); da frente: finos */
  vec4 tras=camada(p,v,38.,.30,3.1,c);
  vec4 meio=camada(p,v,72.,.24,5.3,c);
  vec4 frente=camada(p,v+.01*sin(a+x),130.,.20,7.7,c);
  col=mix(col,tras.rgb,tras.a*mecha*.4);
  col=mix(col,meio.rgb,meio.a*mecha*.6);
  col=mix(col,frente.rgb,frente.a*mecha*mix(.9,.65,tema));
  /* fios soltos fora da mecha, bem raros */
  float solto=smoothstep(largura*1.9,largura,abs(v))*(1.-mecha);
  vec4 sol=camada(p,v,24.,.06,11.3,c);
  col=mix(col,sol.rgb,sol.a*solto*.3);
  gl_FragColor=vec4(col,1.);
}`;

window.prataGL = function (tela, opcoes) {
  const gl = tela.getContext('webgl', Object.assign({ antialias: false, alpha: false, powerPreference: 'low-power' }, opcoes || {}));
  if (!gl) return null;
  const sh = (tipo, src) => { const o = gl.createShader(tipo); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : (console.warn(gl.getShaderInfoLog(o)), null); };
  const v = sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  const f = sh(gl.FRAGMENT_SHADER, window.PRATA_FS);
  if (!v || !f) return null;
  const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'r'), uA = gl.getUniformLocation(pr, 'a'), uC = gl.getUniformLocation(pr, 'cel'), uT = gl.getUniformLocation(pr, 'tema');
  return {
    desenhar(fase, celular, tema) {
      gl.viewport(0, 0, tela.width, tela.height);
      gl.uniform2f(uR, tela.width, tela.height);
      gl.uniform1f(uA, fase); gl.uniform1f(uC, celular || 0); gl.uniform1f(uT, tema || 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };
};
