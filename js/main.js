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

  /* ---- Vídeo hero: força reprodução + fallback ---- */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    heroVideo.addEventListener('error', function () {
      heroVideo.style.display = 'none';
    });

    /* Força play (alguns browsers bloqueiam autoplay mesmo com muted) */
    function tryPlay() {
      var p = heroVideo.play();
      if (p && p.catch) {
        p.catch(function () {
          /* Na 1ª interação do usuário, tenta de novo */
          document.addEventListener('click',      function () { heroVideo.play(); }, { once: true });
          document.addEventListener('touchstart', function () { heroVideo.play(); }, { once: true });
        });
      }
    }

    if (heroVideo.readyState >= 2) {
      tryPlay();
    } else {
      heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
    }
  }

  /* ---- Blog preview: rotação de artigos por página ---- */
  var bpg = document.getElementById('bpg');
  if (bpg) {
    var articles = [
      {img:'usinagem',         cat:'Usinagem',        title:'Como escolher o fluido de corte ideal para sua operação'},
      {img:'manutencao',       cat:'Manutenção',      title:'Vida útil dos fluidos industriais: quando trocar e por quê'},
      {img:'estampagem',       cat:'Produtividade',   title:'Fluidos vegetais na estampagem: eficiência com responsabilidade'},
      {img:'sustentabilidade', cat:'Sustentabilidade',title:'Fluidos biodegradáveis: mito ou realidade?'},
      {img:'gestao',           cat:'Gestão',          title:'Como calcular o custo real do fluido de corte'},
      {img:'qualidade',        cat:'Qualidade',       title:'Controle de concentração: por que monitorar o fluido?'}
    ];
    var pageMap = {
      'index':0,'quem-somos':1,'produtos':2,'usinagem':3,
      'estampagem':4,'protecao':5,'desengraxantes':6,
      'higienizacao':7,'socioambiental':8,'contato':9,'outras-solucoes':10
    };
    var inPages = location.pathname.indexOf('/pages/') !== -1;
    var slug    = location.pathname.replace(/.*\//, '').replace('.html','') || 'index';
    var idx     = pageMap[slug] !== undefined ? pageMap[slug] : 0;
    var picks   = [idx % 6, (idx + 2) % 6, (idx + 4) % 6];
    var imgPfx  = inPages ? '../images/blog/' : 'images/blog/';
    var blogHref= inPages ? 'blog.html' : 'pages/blog.html';

    bpg.innerHTML = picks.map(function(i) {
      var a = articles[i];
      return '<a href="' + blogHref + '" style="text-decoration:none;display:block;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">' +
        '<div style="height:160px;overflow:hidden;"><img src="' + imgPfx + a.img + '.png" alt="' + a.cat + '" style="width:100%;height:100%;object-fit:cover;display:block;"></div>' +
        '<div style="padding:20px;">' +
        '<span style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#FF6B00;">' + a.cat + '</span>' +
        '<p style="font-size:15px;font-weight:600;color:#0D1B2A;margin:8px 0 0;line-height:1.5;">' + a.title + '</p>' +
        '</div></a>';
    }).join('');
  }

  /* ---- Imagens de produtos: carrega de images/produtos/[slug].png ---- */
  document.querySelectorAll('.produto-item').forEach(function(item) {
    var nomeEl = item.querySelector('.produto-nome');
    var imgDiv  = item.querySelector('.produto-img');
    if (!nomeEl || !imgDiv) return;
    var slug = nomeEl.textContent.trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    var prefix = location.pathname.indexOf('/pages/') !== -1 ? '../' : '';
    var img = document.createElement('img');
    img.alt = nomeEl.textContent.trim();
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
    img.onerror = function() {
      imgDiv.innerHTML = '';
      imgDiv.textContent = 'Imagem em breve';
    };
    img.src = prefix + 'images/produtos/' + slug + '.png';
    imgDiv.innerHTML = '';
    imgDiv.appendChild(img);
  });

})();
