
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


// SKILLS DATA
const skillsData = [
  { name: 'Java', icon: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" style="width: 50px; height: 50px;" alt="Java">' },
  { name: 'HTML', icon: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" style="width: 50px; height: 50px;" alt="HTML5">' },
  { name: 'CSS', icon: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" style="width: 50px; height: 50px;" alt="CSS3">' },
  { name: 'JavaScript', icon: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" style="width: 50px; height: 50px;" alt="JavaScript">' },
  { name: 'Git', icon: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" style="width: 50px; height: 50px;" alt="Git">' },
  { name: 'Python', icon: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" style="width: 50px; height: 50px;" alt="Python">' }
];

function initSkills() {
  const grid = document.getElementById('interactive-skills-grid');
  if (!grid) return;
  
  skillsData.forEach(skill => {
    const card = document.createElement('div');
    card.className = 'skill-card tilt-card';
    card.innerHTML = `
      <div class="skill-icon" style="filter: none;">${skill.icon}</div>
      <div class="skill-name">${skill.name}</div>
    `;
    grid.appendChild(card);
  });
}
document.addEventListener('DOMContentLoaded', initSkills);

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const navLinksItems = document.querySelectorAll('.nav-links li a');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navLinksItems.forEach(item => {
    item.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}


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

console.log('%c⚡ PORTFOLIO 2026', 'color:#00f5ff;font-family:monospace;font-size:1.5rem;font-weight:bold');
