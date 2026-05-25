/* ============================================================
   OilBras — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ---- Navbar: efeito scroll + glassmorphism ---- */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  }, { passive: true });

  /* ---- Menu mobile ---- */
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('mobile-open');
      hamburger.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('mobile-open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Active link ao scroll ---- */
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    let current = '';

    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = '#' + sec.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === current);
    });
  }

  /* ---- Smooth scroll nos âncoras ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.offsetTop - (navbar ? navbar.offsetHeight : 80);
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---- IntersectionObserver: fade-in ao entrar na viewport ---- */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    fadeEls.forEach(function (el) { obs.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- Contador animado (stats) ---- */
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const suffix   = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTs  = performance.now();

    function step(now) {
      const elapsed  = now - startTs;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cObs.observe(c); });
  }

  /* ---- Formulário: validação + feedback ---- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach(function (field) {
        const grp = field.closest('.form-group');
        const isEmpty = !field.value.trim();
        const isBadEmail = field.type === 'email' && !isValidEmail(field.value);

        if (isEmpty || isBadEmail) {
          grp.classList.add('has-error');
          field.classList.add('error');
          if (!grp.querySelector('.field-error').textContent) {
            grp.querySelector('.field-error').textContent =
              isEmpty ? 'Campo obrigatório.' : 'E-mail inválido.';
          }
          valid = false;
        } else {
          grp.classList.remove('has-error');
          field.classList.remove('error');
        }
      });

      if (valid) {
        const success = document.getElementById('form-success');
        if (success) {
          success.style.display = 'block';
          form.reset();
          setTimeout(function () { success.style.display = 'none'; }, 6000);
        }
      }
    });

    /* Limpa erro ao digitar */
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('error');
        field.closest('.form-group').classList.remove('has-error');
      });
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ---- Vídeo hero: fallback silencioso ---- */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    heroVideo.addEventListener('error', function () {
      heroVideo.style.display = 'none';
    });
  }

})();
