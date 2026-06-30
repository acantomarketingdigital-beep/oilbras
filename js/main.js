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
        // Skip dropdown triggers — they expand the submenu, not navigate
        if (link.parentElement && link.parentElement.classList.contains('nav-dropdown')) return;
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

  /* ---- Vídeo hero ---- */
  var heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    heroVideo.play().catch(function () { /* autoplay bloqueado — gradiente CSS aparece */ });
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

  /* ---- Dropdown mobile de Produtos ---- */
  document.querySelectorAll('.nav-dropdown > .nav-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        e.stopPropagation();
        this.closest('.nav-dropdown').classList.toggle('dd-open');
      }
    });
  });
  // Fecha dropdown ao abrir menu mobile
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      document.querySelectorAll('.nav-dropdown').forEach(function(dd) {
        dd.classList.remove('dd-open');
      });
    });
  }
  // Marca o link ativo no dropdown conforme a página atual
  (function() {
    var p = location.pathname.replace(/.*\//, '');
    document.querySelectorAll('.nav-dropdown-menu a').forEach(function(a) {
      var h = a.getAttribute('href').replace(/^\.\.\/pages\/|^pages\//, '');
      if (h === p) {
        a.classList.add('active');
        a.closest('.nav-dropdown').querySelector('.nav-link').classList.add('active');
      }
    });
  })();

  /* ---- Busca no catálogo ---- */
  var catSearchInput = document.getElementById('cat-search');
  if (catSearchInput) {
    // Cria mensagem de "sem resultados" dinamicamente
    var catTec = document.querySelector('.catalogo-tecnico');
    if (catTec && !document.getElementById('cat-no-results')) {
      var noResEl = document.createElement('p');
      noResEl.id = 'cat-no-results';
      noResEl.style.cssText = 'display:none;text-align:center;color:#9CA3AF;font-size:15px;padding:48px 0 32px;';
      noResEl.textContent = 'Nenhum produto encontrado.';
      catTec.appendChild(noResEl);
    }

    catSearchInput.addEventListener('input', function() {
      var q = this.value.trim().toLowerCase();
      var items = document.querySelectorAll('.catalogo-produto-item');
      var visible = 0;

      items.forEach(function(item) {
        var name = (item.querySelector('.catalogo-produto-nome') || {}).textContent || '';
        var desc = (item.querySelector('.catalogo-produto-texto') || {}).textContent || '';
        var match = !q
          || name.toLowerCase().indexOf(q) !== -1
          || desc.toLowerCase().indexOf(q) !== -1;
        item.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      // Oculta seções de departamento quando todos os produtos estão escondidos
      document.querySelectorAll('.departamento-catalogo').forEach(function(section) {
        if (!q) { section.style.display = ''; return; }
        var anyVisible = false;
        section.querySelectorAll('.catalogo-produto-item').forEach(function(it) {
          if (it.style.display !== 'none') anyVisible = true;
        });
        section.style.display = anyVisible ? '' : 'none';
      });

      var noRes = document.getElementById('cat-no-results');
      if (noRes) noRes.style.display = (visible === 0 && q.length > 0) ? 'block' : 'none';
    });
  }

  /* ---- WhatsApp dinâmico nos cards de catálogo ---- */
  document.querySelectorAll('.cat-card-btn').forEach(function(btn) {
    var card = btn.closest('.cat-card');
    var nameEl = card ? card.querySelector('.produto-nome') : null;
    if (nameEl) {
      var name = nameEl.textContent.trim();
      btn.href = 'https://wa.me/555533758333?text=' +
        encodeURIComponent('Olá! Gostaria de solicitar um orçamento do produto ' + name + '.');
    }
  });

  /* ---- Modal de produto ---- */
  (function() {
    var WA_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.123 1.527 5.855L0 24l6.336-1.509C8.05 23.447 9.986 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm.029 21.888c-1.784 0-3.494-.487-4.99-1.403l-.358-.214-3.717.974.994-3.64-.234-.374C2.618 15.509 2.058 13.79 2.058 12.029 2.058 6.67 6.67 2.058 12.029 2.058c2.598 0 5.04 1.012 6.876 2.849a9.683 9.683 0 0 1 2.844 6.876c-.003 5.358-4.614 9.105-9.72 9.105z"/></svg>';
    var CLOSE_SVG = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="1" y1="1" x2="12" y2="12"/><line x1="12" y1="1" x2="1" y2="12"/></svg>';

    var overlay = document.createElement('div');
    overlay.className = 'prod-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<div class="prod-modal">' +
        '<button class="prod-modal-close" aria-label="Fechar">' + CLOSE_SVG + '</button>' +
        '<div class="prod-modal-img-wrap" id="pm-img"></div>' +
        '<div class="prod-modal-body">' +
          '<p class="prod-modal-tag" id="pm-tag"></p>' +
          '<h2 class="prod-modal-name" id="pm-name"></h2>' +
          '<p class="prod-modal-desc" id="pm-desc"></p>' +
          '<a href="#" class="prod-modal-wa" id="pm-wa" target="_blank" rel="noopener">' +
            WA_SVG + ' Solicitar Orçamento via WhatsApp' +
          '</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    function openModal(card) {
      var nameEl = card.querySelector('.produto-nome');
      if (!nameEl) return;
      var descEl = card.querySelector('.produto-desc');
      var tagEl  = card.querySelector('.cat-card-tag');
      var imgDiv = card.querySelector('.cat-card-img.produto-img');
      var btnEl  = card.querySelector('.cat-card-btn');

      var name    = nameEl.textContent.trim();
      var desc    = descEl ? descEl.textContent.trim() : '';
      var tag     = tagEl  ? tagEl.textContent.trim()  : '';
      var waHref  = (btnEl && btnEl.href && btnEl.href !== location.href + '#')
        ? btnEl.href
        : 'https://wa.me/555533758333?text=' + encodeURIComponent('Olá! Gostaria de solicitar um orçamento do produto ' + name + '.');

      var imgWrap = document.getElementById('pm-img');
      imgWrap.innerHTML = '';
      var srcImg = imgDiv ? imgDiv.querySelector('img') : null;
      if (srcImg) {
        var mi = document.createElement('img');
        mi.src = srcImg.src;
        mi.alt = name;
        imgWrap.appendChild(mi);
      } else {
        var ph = document.createElement('span');
        ph.className = 'prod-modal-placeholder';
        ph.textContent = 'Imagem em breve';
        imgWrap.appendChild(ph);
      }

      document.getElementById('pm-tag').textContent  = tag;
      document.getElementById('pm-name').textContent = name;
      document.getElementById('pm-desc').textContent = desc;
      document.getElementById('pm-wa').href = waHref;

      overlay.classList.add('open');
      overlay.querySelector('.prod-modal').scrollTop = 0;
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    overlay.querySelector('.prod-modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    document.querySelectorAll('.cat-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.closest('.cat-card-btn')) return;
        openModal(card);
      });
    });
  })();

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
