(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;

  /* ===== THEME ===== */
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  root.setAttribute('data-theme', savedTheme);
  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ===== PRELOADER ===== */
  const preloader = document.getElementById('preloader');
  const fill = document.getElementById('preloaderFill');
  const count = document.getElementById('preloaderCount');

  function finishPreload() {
    fill.style.width = '100%';
    count.textContent = '100%';
    setTimeout(() => {
      preloader.classList.add('hidden');
      animateHero();
    }, 250);
  }

  if (reduceMotion) {
    finishPreload();
  } else {
    let progress = 0;
    const timer = setInterval(() => {
      progress += Math.random() * 18;
      if (progress >= 100) {
        clearInterval(timer);
        finishPreload();
        return;
      }
      fill.style.width = progress + '%';
      count.textContent = Math.floor(progress) + '%';
    }, 90);
  }

  function animateHero() {
    document.querySelectorAll('.hero-name .word').forEach((w, i) => {
      setTimeout(() => w.classList.add('animate'), i * 180 + 80);
    });
  }

  /* ===== SCROLL PROGRESS + NAV SHRINK ===== */
  const progressBar = document.getElementById('scroll-progress');
  const nav = document.getElementById('nav');
  function onScroll() {
    const max = document.body.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ===== REVEAL ON SCROLL (incl. clip-reveal) ===== */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale, .clip-reveal');
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add('visible'));
  } else {
    const groups = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      const list = groups.get(parent) || [];
      list.push(el);
      groups.set(parent, list);
    });
    groups.forEach((list) => list.forEach((el, i) => (el.dataset.delay = i * 70)));

    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setTimeout(() => entry.target.classList.add('visible'), Number(entry.target.dataset.delay) || 0);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ===== CUSTOM CURSOR with contextual label ===== */
  if (fine && !reduceMotion) {
    document.body.classList.add('has-cursor');
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    const label = follower.querySelector('.cursor-label');
    let mx = 0, my = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    });

    document.addEventListener('mouseover', (e) => {
      const cursorTarget = e.target.closest('[data-cursor]');
      const active = e.target.closest('a, button, .gallery-item, .tab');
      document.body.classList.toggle('cursor-active', !!active);
      label.textContent = cursorTarget ? cursorTarget.dataset.cursor : '';
    });

    (function tick() {
      fx += (mx - fx) * 0.14;
      fy += (my - fy) * 0.14;
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';
      requestAnimationFrame(tick);
    })();
  }

  /* ===== HERO MESH PARALLAX ===== */
  if (fine && !reduceMotion) {
    const hero = document.getElementById('hero');
    const blobs = document.querySelectorAll('.mesh span');
    hero?.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      blobs.forEach((b, i) => {
        const strength = (i + 1) * 14;
        b.style.translate = `${(px * strength).toFixed(1)}px ${(py * strength).toFixed(1)}px`;
      });
    });
  }

  /* ===== MAGNETIC BUTTONS ===== */
  if (fine && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      let tx = 0, ty = 0, cx = 0, cy = 0;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * 0.35;
        ty = (e.clientY - r.top - r.height / 2) * 0.35;
      });
      el.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
      (function tick() {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
        requestAnimationFrame(tick);
      })();
    });
  }

  /* ===== TILT CARDS ===== */
  if (fine && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * 9;
        const ry = (px - 0.5) * 9;
        el.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ===== TABS ===== */
  const tabs = document.getElementById('catTabs');
  tabs?.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.gallery').forEach((g) => g.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('cat-' + btn.dataset.cat)?.classList.add('active');
  });

  /* ===== LIGHTBOX ===== */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCounter = document.getElementById('lightboxCounter');
  let currentItems = [];
  let currentIndex = 0;

  function openLightboxAt(items, index) {
    currentItems = items;
    currentIndex = index;
    renderLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.getElementById('lightboxClose').focus();
  }

  function renderLightbox() {
    const img = currentItems[currentIndex].querySelector('.gallery-img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCounter.textContent = `${currentIndex + 1} / ${currentItems.length}`;
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  function step(delta) {
    currentIndex = (currentIndex + delta + currentItems.length) % currentItems.length;
    renderLightbox();
  }

  document.querySelectorAll('.gallery').forEach((gallery) => {
    const items = [...gallery.querySelectorAll('.gallery-item')];
    items.forEach((item, i) => {
      item.addEventListener('click', () => openLightboxAt(items, i));
    });
  });

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => step(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ===== IMAGE REEL: duplicate for seamless CSS loop ===== */
  const reel = document.getElementById('reel');
  if (reel) {
    reel.innerHTML += reel.innerHTML;
    if (reduceMotion) reel.style.animation = 'none';
  }

/* ===== INERTIAL SCROLL MARQUEE ===== */
const scrollTicker = document.getElementById('ticker');

if (scrollTicker) {
  const SCROLL_SPEED = 0.55;
  const EASE = 0.10;
  const COPIES = 8;

  const originalItems = Array.from(scrollTicker.children)
    .map((item) => item.outerHTML)
    .join('');

  scrollTicker.innerHTML = originalItems.repeat(COPIES);

  let segmentWidth = 1;
  let current = window.scrollY * SCROLL_SPEED;

  function measureTicker() {
    segmentWidth = Math.max(1, scrollTicker.scrollWidth / COPIES);
  }

  function renderTicker() {
    const target = window.scrollY * SCROLL_SPEED;
    current += (target - current) * EASE;

    const x = -(((current % segmentWidth) + segmentWidth) % segmentWidth);
    scrollTicker.style.transform = `translate3d(${x}px, 0, 0)`;

    requestAnimationFrame(renderTicker);
  }

  measureTicker();
  window.addEventListener('resize', measureTicker);
  window.addEventListener('load', measureTicker);
  renderTicker();
}
})();
