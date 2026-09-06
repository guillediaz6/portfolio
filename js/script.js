// ── PROGRESS BAR ──
const pb = document.getElementById('pb');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  pb.style.width = (window.scrollY / h) * 100 + '%';
});
// ── MASCOTA WIDGET ──
const mascotaWidget = document.getElementById('mascota-widget');
const mascotaAudio = document.getElementById('mascota-audio');
const mascotaPlayBtn = document.getElementById('mascota-play-btn');
let mascotaHasAppeared = false;
let autoplayFailed = false;

window.addEventListener('scroll', () => {
  if (mascotaWidget && window.scrollY > window.innerHeight * 0.5) {
    if (!mascotaWidget.classList.contains('visible')) {
      mascotaWidget.classList.add('visible');
      if (!mascotaHasAppeared && mascotaAudio) {
        mascotaHasAppeared = true;
        const playPromise = mascotaAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            mascotaPlayBtn.textContent = '⏸';
            autoplayFailed = false;
          }).catch(e => {
            console.log('Autoplay prevented by browser', e);
            mascotaPlayBtn.textContent = '▶'; 
            autoplayFailed = true; // Flag that it was blocked
          });
        }
      }
    }
  } else if (mascotaWidget) {
    mascotaWidget.classList.remove('visible');
  }
});

// FALLBACK: Si el navegador bloqueó el autoplay al hacer scroll, 
// lo reproducimos al primer clic que haga el usuario en cualquier parte.
document.addEventListener('click', (e) => {
  if (autoplayFailed && mascotaWidget && mascotaWidget.classList.contains('visible') && mascotaAudio.paused) {
    // Evitamos doble disparo si clicó exactamente en el botón de play
    if (e.target !== mascotaPlayBtn) {
      mascotaAudio.play();
      mascotaPlayBtn.textContent = '⏸';
      autoplayFailed = false;
    }
  }
});

if (mascotaPlayBtn && mascotaAudio) {
  mascotaPlayBtn.addEventListener('click', () => {
    if (mascotaAudio.paused) {
      mascotaAudio.play();
      mascotaPlayBtn.textContent = '⏸';
    } else {
      mascotaAudio.pause();
      mascotaPlayBtn.textContent = '▶';
    }
  });

  mascotaAudio.addEventListener('ended', () => {
    mascotaPlayBtn.textContent = '▶';
  });
}

// ── LUXURY MENU ──
const menuBtn = document.getElementById('luxury-menu-btn');
const menuOverlay = document.getElementById('luxury-menu-overlay');
const menuLinks = document.querySelectorAll('.luxury-menu-link');

if (menuBtn && menuOverlay) {
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    menuOverlay.classList.toggle('active');
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      menuOverlay.classList.remove('active');
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
