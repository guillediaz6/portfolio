// ── CURSOR ──
const cur = document.getElementById('cursor'),
  tr = document.getElementById('cursor-trail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});

(function at() {
  tx += (mx - tx) * 0.12;
  ty += (my - ty) * 0.12;
  tr.style.left = tx + 'px';
  tr.style.top  = ty + 'px';
  requestAnimationFrame(at);
})();

// ── PROGRESS BAR ──
const pb = document.getElementById('pb');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  pb.style.width = (window.scrollY / h) * 100 + '%';
});

// ── LOADER ──
const lBar = document.getElementById('loader-bar'),
  lTxt = document.getElementById('loader-text'),
  lEl  = document.getElementById('loader');
const msgs = [
  'INICIALIZANDO SISTEMAS...',
  'CARGANDO PARTÍCULAS...',
  'COMPILANDO SHADERS...',
  'RENDERIZANDO UNIVERSO...',
  'LISTO.',
];
let prog = 0;
const lI = setInterval(() => {
  prog += Math.random() * 8 + 2;
  if (prog >= 100) { prog = 100; clearInterval(lI); }
  lBar.style.width = prog + '%';
  lTxt.textContent = msgs[Math.min(Math.floor(prog / 25), 4)];
  if (prog === 100) {
    setTimeout(() => {
      lEl.style.transition = 'opacity .8s';
      lEl.style.opacity = '0';
      setTimeout(() => (lEl.style.display = 'none'), 800);
    }, 400);
  }
}, 60);

// ── WEBGL AURORA ──
(function () {
  const cv = document.getElementById('bg-canvas');
  const gl = cv.getContext('webgl');
  if (!gl) return;
  const rsz = () => { cv.width = innerWidth; cv.height = innerHeight; gl.viewport(0,0,cv.width,cv.height); };
  rsz(); window.addEventListener('resize', rsz);
  const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
  const fs = `precision mediump float;
    uniform vec2 R;uniform float T;uniform vec2 M;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
      return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
    void main(){
      vec2 uv=gl_FragCoord.xy/R,m=M/R;float t=T*.3;
      float a=n(uv*2.+vec2(t*.2,t*.1))*n(uv*3.-vec2(t*.15,t*.2));
      a+=.08*smoothstep(.5,0.,length(uv-m));
      vec3 c=mix(vec3(0.,.96,1.)*.07,vec3(.47,0.,1.)*.05,n(uv*2.+t*.1));c*=a+.3;
      vec2 g=fract(uv*30.);float l=step(.97,max(g.x,g.y));
      gl_FragColor=vec4(vec3(.012,.012,.03)+c+vec3(.025,.025,.06)*l,1.);}`;
  function sh(s, t) { const x = gl.createShader(t); gl.shaderSource(x,s); gl.compileShader(x); return x; }
  const prg = gl.createProgram();
  gl.attachShader(prg, sh(vs, gl.VERTEX_SHADER));
  gl.attachShader(prg, sh(fs, gl.FRAGMENT_SHADER));
  gl.linkProgram(prg); gl.useProgram(prg);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const pp = gl.getAttribLocation(prg, 'p');
  gl.enableVertexAttribArray(pp);
  gl.vertexAttribPointer(pp, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(prg,'R'), uT = gl.getUniformLocation(prg,'T'), uM = gl.getUniformLocation(prg,'M');
  let bx = 0, by = 0;
  document.addEventListener('mousemove', (e) => { bx = e.clientX; by = e.clientY; });
  function render(t) {
    gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, t*.001); gl.uniform2f(uM, bx, cv.height-by);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();

// ── INTRO PARTICLES ──
(function () {
  const cv = document.getElementById('intro-canvas'), ctx = cv.getContext('2d');
  const rsz = () => { cv.width = innerWidth; cv.height = innerHeight; };
  rsz(); window.addEventListener('resize', rsz);
  let imx = innerWidth/2, imy = innerHeight/2;
  document.addEventListener('mousemove', (e) => { imx = e.clientX; imy = e.clientY; });
  const C = ['#00f5ff','#bf00ff','#ff006e','#00ff88'];
  class P {
    reset() {
      const a = Math.random()*Math.PI*2, r = 110+Math.random()*100;
      this.x = innerWidth/2+Math.cos(a)*r; this.y = innerHeight/2+Math.sin(a)*r;
      this.vx = (Math.random()-.5)*.6; this.vy = (Math.random()-.5)*.6;
      this.life = 1; this.size = Math.random()*3+1; this.col = C[Math.floor(Math.random()*4)];
    }
    constructor() { this.reset(); }
    update() {
      this.x += this.vx+(imx-innerWidth/2)*.0003; this.y += this.vy+(imy-innerHeight/2)*.0003;
      this.life -= .007; if (this.life <= 0) this.reset();
    }
    draw() {
      ctx.save(); ctx.globalAlpha = this.life*.8; ctx.shadowBlur = 10; ctx.shadowColor = this.col;
      ctx.fillStyle = this.col; ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }
  const ps = []; for (let i=0;i<140;i++) ps.push(new P());
  function anim() { ctx.clearRect(0,0,cv.width,cv.height); ps.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(anim); }
  anim();
})();

// ── INTRO → REVEAL ──
function triggerExplode() {
  const intro = document.getElementById('intro-screen');
  const prof  = document.getElementById('profile-container');
  const port  = document.getElementById('main-portfolio');
  const nav   = document.getElementById('main-nav');
  prof.style.cssText = 'transform:scale(0);opacity:0;transition:transform .5s cubic-bezier(.55,0,1,.45),opacity .3s';
  const f = Object.assign(document.createElement('div'), { style:'position:absolute;inset:0;background:#fff;z-index:20' });
  intro.appendChild(f);
  setTimeout(() => { f.style.cssText = 'opacity:0;transition:opacity .6s;position:absolute;inset:0;background:#fff;z-index:20'; }, 100);
  setTimeout(() => {
    intro.style.cssText = 'transition:opacity .8s,transform .8s cubic-bezier(.16,1,.3,1);opacity:0;transform:scale(1.1);position:fixed;inset:0;background:#000;z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column';
    port.classList.add('visible');
    nav.classList.add('nav-visible');
    gsap.registerPlugin(ScrollTrigger);
    gsap.timeline({ delay:.3 })
      .fromTo('#hero-eyebrow', {y:20,opacity:0}, {y:0,opacity:1,duration:.8,ease:'power3.out'})
      .fromTo('#hero-title',   {y:60,opacity:0}, {y:0,opacity:1,duration:1,  ease:'power3.out'}, '-=.4')
      .fromTo('#hero-sub',     {y:30,opacity:0}, {y:0,opacity:1,duration:.8, ease:'power3.out'}, '-=.5')
      .fromTo('#hero-cta',     {y:20,opacity:0}, {y:0,opacity:1,duration:.8, ease:'power3.out'}, '-=.4')
      .fromTo('#scroll-indicator', {opacity:0},  {opacity:1,duration:.8}, '-=.2');
    setTimeout(() => (intro.style.display = 'none'), 900);
  }, 600);
}
document.getElementById('intro-screen').addEventListener('click', triggerExplode);
setTimeout(() => { if (document.getElementById('intro-screen').style.display !== 'none') triggerExplode(); }, 5000);


// ═══════════════════════════════════════════════════
// CARRUSEL INFINITO — siempre lleno, sin saltos
// ═══════════════════════════════════════════════════
const skillsData = [
  {
    name: 'HTML5', color: '#E34F26',
    svg: `<svg viewBox="0 0 24 24"><path fill="#E34F26" d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/></svg>`,
  },
  {
    name: 'CSS3', color: '#1572B6',
    svg: `<svg viewBox="0 0 24 24"><path fill="#1572B6" d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.413z"/></svg>`,
  },
  {
    name: 'JavaScript', color: '#F7DF1E',
    svg: `<svg viewBox="0 0 24 24"><path fill="#F7DF1E" d="M0 0h24v24H0z"/><path d="M11.85 18.23c-.22.1-.55.19-.8.19-1.22 0-1.6-.74-1.88-1.87l-1.34.61c.42 1.63 1.35 2.5 3.12 2.5 1 0 1.94-.36 2.45-1.08.38-.54.6-1.25.6-2.2v-7.23H12.6v7c0 1.05-.18 1.48-.75 1.55l.03.53zm9.64-1.67c0 1.9-.99 3.15-3.32 3.15-1.57 0-2.6-.68-3.13-2.11l1.32-.76c.32.89.92 1.48 1.83 1.48 1.25 0 1.77-.6 1.77-1.46 0-1.03-.68-1.45-2.22-2.14l-.45-.2c-2.02-.91-3.17-2.1-3.17-3.9 0-1.66 1.13-3.13 3.1-3.13 2.05 0 2.9.96 3.4 2.2l-1.32.74c-.26-.74-.78-1.48-1.92-1.48-1.2 0-1.52.84-1.52 1.4 0 .99.8 1.25 2.15 1.82l.33.15c2.14.96 3.17 2.06 3.17 3.94l-.02.3z" fill="#000"/></svg>`,
  },
  {
    name: 'Java', color: '#007396',
    svg: `<svg viewBox="0 0 24 24"><path fill="#007396" d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.323.646-4.709 2.019-10.657-.118-6.945-1.149zm-.6-2.696s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.694 1.661-12.044.133-7.942-1.218zM14.61 12.94c1.162 1.337-.305 2.54-.305 2.54s2.95-1.523 1.595-3.43c-1.265-1.78-2.235-2.664 3.017-5.713 0 0-8.24 2.058-4.307 6.603zm6.462 7.462s.679.56-.748.992c-2.712.822-11.288 1.07-13.672.033-.856-.373.75-.89 1.255-.998.527-.114.828-.093.828-.093-.953-.672-6.158 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.98-1.821zM9.292 13.21s-4.362 1.037-1.544 1.414c1.19.16 3.56.123 5.77-.062 1.805-.152 3.618-.478 3.618-.478s-.637.272-1.098.586c-4.43 1.165-12.986.622-10.522-.568 2.082-1.002 3.776-.892 3.776-.892zM16.28 17.56c4.505-2.34 2.421-4.589.968-4.287-.357.074-.516.138-.516.138s.133-.208.386-.298c2.883-1.014 5.101 2.99-.93 4.575 0 0 .07-.062.092-.128z"/><path fill="#007396" d="M13.71 0s2.5 2.502-2.37 6.352c-3.898 3.081-.888 4.838 0 6.846-2.273-2.051-3.94-3.858-2.821-5.54 1.643-2.468 6.2-3.664 5.19-7.658zM8.456 22.964c4.32.276 10.956-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.695-8.239.614-10.937.169 0 0 .553.457 3.393.638z"/></svg>`,
  },
  {
    name: 'Git', color: '#F05032',
    svg: `<svg viewBox="0 0 24 24"><path fill="#F05032" d="M23.546 10.93L13.067.452a1.55 1.55 0 00-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 012.327 2.341l2.658 2.66a1.838 1.838 0 01-.49 3.512 1.84 1.84 0 01-1.795-3.016L11.622 8.44v6.335a1.84 1.84 0 01.487 3.505 1.838 1.838 0 01-2.202-2.201 1.84 1.84 0 011.023-1.283V8.37a1.833 1.833 0 01-.998-2.413L7.198 3.198.454 9.942a1.549 1.549 0 000 2.188l10.48 10.477a1.55 1.55 0 002.188 0l10.424-10.424a1.55 1.55 0 000-2.253"/></svg>`,
  },
  {
    name: 'C++', color: '#00599C',
    svg: `<svg viewBox="0 0 24 24"><path fill="#00599C" d="M22.394 6c-.168-.29-.398-.543-.652-.69L12.926.255c-.567-.335-1.324-.335-1.89 0L2.258 5.31c-.569.336-.92.96-.92 1.64v9.82c0 .68.351 1.304.92 1.64l8.778 5.176c.567.335 1.323.335 1.89 0l8.778-5.176c.569-.336.92-.96.92-1.64V7.65c0-.34-.094-.66-.254-.94zM12 17.62c-3.104 0-5.62-2.517-5.62-5.62 0-3.104 2.516-5.62 5.62-5.62 2.587 0 4.774 1.75 5.433 4.14h-2.688c-.561-1.127-1.702-1.89-2.97-1.89-1.86 0-3.37 1.51-3.37 3.37 0 1.86 1.51 3.37 3.37 3.37 1.267 0 2.408-.762 2.97-1.89h2.688c-.66 2.39-2.846 4.14-5.433 4.14zM16.75 10.5v1.25H15.5v1.25h1.25v1.25h1.25v-1.25h1.25v-1.25h-1.25V10.5z"/></svg>`,
  },
  {
    name: 'Docker', color: '#2496ED',
    svg: `<svg viewBox="0 0 24 24"><path fill="#2496ED" d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"/></svg>`,
  },
];

(function initCarousel() {
  const track   = document.getElementById('carousel-skills');
  const wrapper = track && track.closest('.carousel-wrapper');
  if (!track || !wrapper) return;

  // Tamaño de cada chip — DEBE coincidir con el CSS
  const CHIP_W = 112;
  const GAP    = 20;
  const STEP   = CHIP_W + GAP; // 132px por chip

  // ── Crear un chip DOM con sus listeners ──
  function makeChip(s) {
    const el = document.createElement('div');
    el.className = 'skill-chip';
    el.innerHTML = `<div class="skill-chip-logo">${s.svg}</div>
                    <div class="skill-chip-name">${s.name}</div>`;
    el.addEventListener('mouseenter', () => {
      el.style.borderColor = s.color + 'cc';
      el.style.boxShadow   = `0 14px 40px rgba(0,0,0,.6), 0 0 24px ${s.color}55, inset 0 0 16px ${s.color}11`;
      el.querySelector('.skill-chip-name').style.color = s.color;
      const svg = el.querySelector('svg');
      if (svg) svg.style.filter = `drop-shadow(0 0 7px ${s.color}99)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.borderColor = '';
      el.style.boxShadow   = '';
      el.querySelector('.skill-chip-name').style.color = '';
      const svg = el.querySelector('svg');
      if (svg) svg.style.filter = '';
    });
    return el;
  }

  // ── Llenar el track con suficientes chips ──
  // Regla: el track debe tener al menos (ancho_pantalla × 4) de contenido.
  // Así, aunque offset sea grande, siempre hay chips visibles.
  // El loop resetea cada vez que avanzamos 1 "set" (= N tecnologías × STEP).
  function buildTrack() {
    track.innerHTML = '';

    const screenW  = window.innerWidth;
    const setW     = skillsData.length * STEP;          // ancho de 1 set completo
    // Cuántas copias del set necesitamos para cubrir 4× la pantalla como mínimo
    const copies   = Math.max(6, Math.ceil((screenW * 4) / setW) + 1);

    for (let i = 0; i < copies; i++) {
      skillsData.forEach(s => track.appendChild(makeChip(s)));
    }

    return setW; // devuelve el tamaño de 1 set para el loop
  }

  let setW = buildTrack();

  // ── Motor rAF ──
  const SPEED_BASE  = 0.6;   // px/frame → ~36px/s a 60fps
  const SPEED_HOVER = 0.07;  // casi parado al hover
  const LERP        = 0.05;  // suavidad del arranque/frenado

  let offset   = 0;
  let speed    = 0;          // velocidad actual (interpolada)
  let target   = SPEED_BASE;
  let hovered  = false;
  let dragging = false;
  let dragX    = 0;
  let dragOff  = 0;

  function tick() {
    if (!dragging) {
      speed  += (target - speed) * LERP;
      offset += speed;

      // LOOP: cuando avanzamos 1 set completo, retrocedemos exactamente 1 set.
      // Como el track tiene muchas copias idénticas detrás, el salto es invisible.
      if (offset >= setW) offset -= setW;
      if (offset < 0)     offset += setW;
    }

    track.style.transform = `translateX(${-offset}px)`;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  // ── Hover: ralentizar suavemente ──
  wrapper.addEventListener('mouseenter', () => { hovered = true;  target = SPEED_HOVER; });
  wrapper.addEventListener('mouseleave', () => { hovered = false; if (!dragging) target = SPEED_BASE; });

  // ── Drag ratón ──
  wrapper.style.cursor = 'grab';

  wrapper.addEventListener('mousedown', e => {
    dragging = true;
    dragX    = e.clientX;
    dragOff  = offset;
    speed    = 0;
    target   = 0;
    wrapper.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const delta = dragX - e.clientX;
    offset = ((dragOff + delta) % setW + setW) % setW;
    track.style.transform = `translateX(${-offset}px)`;
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    wrapper.style.cursor = 'grab';
    target = hovered ? SPEED_HOVER : SPEED_BASE;
  });

  // ── Touch ──
  wrapper.addEventListener('touchstart', e => {
    dragging = true;
    dragX    = e.touches[0].clientX;
    dragOff  = offset;
    speed    = 0;
    target   = 0;
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (!dragging) return;
    const delta = dragX - e.touches[0].clientX;
    offset = ((dragOff + delta) % setW + setW) % setW;
    track.style.transform = `translateX(${-offset}px)`;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    target   = SPEED_BASE;
  });

  // ── Reconstruir si cambia el tamaño de ventana ──
  window.addEventListener('resize', () => {
    setW   = buildTrack();
    offset = 0;
  });
})();


// ── REVEAL ──
const rObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const d = parseFloat(e.target.style.transitionDelay || 0) * 1000;
      setTimeout(() => e.target.classList.add('revealed'), d);
      rObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('[data-reveal]').forEach(el => rObs.observe(el));

// ── COUNTERS ──
const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const t = +e.target.getAttribute('data-count');
    let c = 0;
    const id = setInterval(() => {
      c += t / 60;
      if (c >= t) { c = t; clearInterval(id); }
      e.target.textContent = Math.floor(c) + '+';
    }, 16);
    cObs.unobserve(e.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(c => cObs.observe(c));

// ── TILT ──
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform  = `perspective(600px) rotateY(${x*14}deg) rotateX(${-y*14}deg) scale(1.02)`;
    card.style.transition = 'transform .08s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform .5s ease';
  });
});

// ── ACTIVE NAV ──
const sObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => (a.style.color = ''));
      const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (a) a.style.color = 'var(--neon-cyan)';
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('section[id]').forEach(s => sObs.observe(s));

console.log('%c⚡ PORTFOLIO 2026', 'color:#00f5ff;font-family:monospace;font-size:1.5rem;font-weight:bold');l e t   l b I m a g e s   =   [ ] ;   l e t   l b I n d e x   =   0 ;   f u n c t i o n   o p e n L i g h t b o x ( i m a g e s ,   i n d e x = 0 )   {   l b I m a g e s   =   i m a g e s ;   l b I n d e x   =   i n d e x ;   d o c u m e n t . g e t E l e m e n t B y I d ( ' l i g h t b o x - i m g ' ) . s r c   =   l b I m a g e s [ l b I n d e x ] ;   d o c u m e n t . g e t E l e m e n t B y I d ( ' l i g h t b o x ' ) . c l a s s L i s t . a d d ( ' s h o w ' ) ;   }   f u n c t i o n   c l o s e L i g h t b o x ( )   {   d o c u m e n t . g e t E l e m e n t B y I d ( ' l i g h t b o x ' ) . c l a s s L i s t . r e m o v e ( ' s h o w ' ) ;   }   f u n c t i o n   c h a n g e L i g h t b o x I m a g e ( d i r )   {   l b I n d e x   + =   d i r ;   i f ( l b I n d e x   <   0 )   l b I n d e x   =   l b I m a g e s . l e n g t h   -   1 ;   e l s e   i f ( l b I n d e x   > =   l b I m a g e s . l e n g t h )   l b I n d e x   =   0 ;   d o c u m e n t . g e t E l e m e n t B y I d ( ' l i g h t b o x - i m g ' ) . s r c   =   l b I m a g e s [ l b I n d e x ] ;   }   f u n c t i o n   n e x t S l i d e ( e ,   b t n )   {   e . s t o p P r o p a g a t i o n ( ) ;   c o n s t   c o n t a i n e r   =   b t n . p a r e n t E l e m e n t ;   c o n s t   s l i d e s   =   c o n t a i n e r . q u e r y S e l e c t o r A l l ( ' . s l i d e ' ) ;   l e t   c u r r e n t   =   0 ;   s l i d e s . f o r E a c h ( ( s ,   i )   = >   {   i f ( s . c l a s s L i s t . c o n t a i n s ( ' a c t i v e ' ) )   c u r r e n t   =   i ;   s . c l a s s L i s t . r e m o v e ( ' a c t i v e ' ) ;   } ) ;   c u r r e n t   =   ( c u r r e n t   +   1 )   %   s l i d e s . l e n g t h ;   s l i d e s [ c u r r e n t ] . c l a s s L i s t . a d d ( ' a c t i v e ' ) ;   }   f u n c t i o n   p r e v S l i d e ( e ,   b t n )   {   e . s t o p P r o p a g a t i o n ( ) ;   c o n s t   c o n t a i n e r   =   b t n . p a r e n t E l e m e n t ;   c o n s t   s l i d e s   =   c o n t a i n e r . q u e r y S e l e c t o r A l l ( ' . s l i d e ' ) ;   l e t   c u r r e n t   =   0 ;   s l i d e s . f o r E a c h ( ( s ,   i )   = >   {   i f ( s . c l a s s L i s t . c o n t a i n s ( ' a c t i v e ' ) )   c u r r e n t   =   i ;   s . c l a s s L i s t . r e m o v e ( ' a c t i v e ' ) ;   } ) ;   c u r r e n t   =   ( c u r r e n t   -   1   +   s l i d e s . l e n g t h )   %   s l i d e s . l e n g t h ;   s l i d e s [ c u r r e n t ] . c l a s s L i s t . a d d ( ' a c t i v e ' ) ;   }  
 