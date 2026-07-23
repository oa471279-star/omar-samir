/**
 * Omar Samir — Portfolio
 * script.js — Clean, lightweight, no external dependencies required.
 * All features degrade gracefully if optional CDN libs (GSAP/AOS) fail to load.
 */

(function () {
  'use strict';

  /* ============================================================
     STATE
  ============================================================ */
  var currentMode = 'selection'; // 'selection' | 'dev' | 'chef'

  /* ============================================================
     SAFE ELEMENT HELPERS
  ============================================================ */
  function $(id) { return document.getElementById(id); }
  function $q(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function on(el, evt, fn) {
    if (el) el.addEventListener(evt, fn);
  }

  /* ============================================================
     LOADER — hide after 2.2 s (matches CSS animation)
  ============================================================ */
  function initLoader() {
    var loader = $('loader');
    if (!loader) return;

    setTimeout(function () {
      loader.classList.add('hidden');
      // Remove from DOM after transition so it never blocks clicks
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 700);
    }, 2200);
  }

  /* ============================================================
     CUSTOM CURSOR (desktop only — skipped on touch devices)
  ============================================================ */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) {
      // Touch device — restore default cursor
      document.body.style.cursor = '';
      var dot = $('cursor-dot');
      var ring = $('cursor-ring');
      if (dot) dot.style.display = 'none';
      if (ring) ring.style.display = 'none';
      return;
    }

    var dot = $('cursor-dot');
    var ring = $('cursor-ring');
    if (!dot || !ring) return;

    var mx = 0, my = 0;   // mouse position
    var rx = 0, ry = 0;   // ring position (lagged)
    var raf;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    function animateRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      raf = requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover expand
    document.addEventListener('mouseover', function (e) {
      if (e.target.matches('a, button, .mode-card, input, textarea, .gallery-item')) {
        document.body.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.matches('a, button, .mode-card, input, textarea, .gallery-item')) {
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  /* ============================================================
     PARTICLES — lightweight canvas, no external lib
  ============================================================ */
  function initParticles() {
    var canvas = $('particles-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var RAF;
    var W, H;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Build particle pool once
    var COUNT = 55;
    for (var i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.4,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Choose colour by active mode
      var isChef = currentMode === 'chef';
      var r = isChef ? 192 : 0;
      var g = isChef ? 98  : 180;
      var b = isChef ? 43  : 255;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + p.alpha + ')';
        ctx.fill();
      }
      RAF = requestAnimationFrame(draw);
    }
    draw();
  }

  /* ============================================================
     TYPEWRITER
  ============================================================ */
  function initTypewriter() {
    var el = $('dev-typewriter');
    if (!el) return;

    var lines = [
      'Learning to build the web.',
      'Exploring code every day.',
      'Student. Developer. Creator.',
      'Turning ideas into projects.'
    ];
    var li = 0, ci = 0, deleting = false;
    var delay = 100;

    function tick() {
      var line = lines[li];
      if (deleting) {
        ci--;
        el.textContent = line.slice(0, ci);
        delay = 50;
        if (ci === 0) {
          deleting = false;
          li = (li + 1) % lines.length;
          delay = 500;
        }
      } else {
        ci++;
        el.textContent = line.slice(0, ci);
        delay = 100;
        if (ci === line.length) {
          deleting = true;
          delay = 1800;
        }
      }
      setTimeout(tick, delay);
    }
    setTimeout(tick, 600);
  }

  /* ============================================================
     CINEMATIC MODE TRANSITION
  ============================================================ */
  function switchMode(targetMode) {
    if (targetMode === currentMode) return;

    var overlay = $('transition-overlay');
    if (!overlay) { applyMode(targetMode); return; }

    var textEl = $q('.trans-text', overlay);

    // Pick label & colour
    var label = targetMode === 'dev' ? 'Developer Mode' : 'Chef Mode';
    var isChef = targetMode === 'chef';
    if (textEl) textEl.textContent = label;

    overlay.classList.remove('chef-trans');
    if (isChef) overlay.classList.add('chef-trans');

    // Phase 1 — fade overlay in
    overlay.style.transition = 'opacity 0.4s ease';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';

    // Phase 2 — show label
    if (textEl) {
      textEl.style.transition = 'opacity 0.3s ease';
      setTimeout(function () { textEl.style.opacity = '1'; }, 200);
    }

    // Phase 3 — swap content & fade out
    setTimeout(function () {
      applyMode(targetMode);
    }, 450);

    setTimeout(function () {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      if (textEl) textEl.style.opacity = '0';
    }, 950);
  }

  function applyMode(mode) {
    var selScreen = $('selection-screen');
    var devMode   = $('dev-mode');
    var chefMode  = $('chef-mode');

    // Hide all
    if (selScreen) selScreen.style.display = 'none';
    if (devMode)   devMode.style.display   = 'none';
    if (chefMode)  chefMode.style.display  = 'none';

    // Show target
    if (mode === 'selection') {
      if (selScreen) selScreen.style.display = 'flex';
      document.body.classList.remove('chef-active', 'dev-active');
    } else if (mode === 'dev') {
      if (devMode) devMode.style.display = 'block';
      document.body.classList.remove('chef-active');
      document.body.classList.add('dev-active');
      // Scroll to top of dev world
      window.scrollTo(0, 0);
      // Re-init scroll-based features for the new view
      initActiveNav('dev');
      animateSkillBars();
    } else if (mode === 'chef') {
      if (chefMode) chefMode.style.display = 'block';
      document.body.classList.remove('dev-active');
      document.body.classList.add('chef-active');
      window.scrollTo(0, 0);
      initActiveNav('chef');
    }

    currentMode = mode;

    // Kick AOS if available
    if (typeof AOS !== 'undefined') {
      try { AOS.refresh(); } catch (e) {}
    }
  }

  /* ============================================================
     NAV — active link highlighting on scroll
  ============================================================ */
  function initActiveNav(mode) {
    var prefix    = mode === 'dev' ? 'dev' : 'chef';
    var navLinks  = $all('.' + (mode === 'dev' ? 'dev-nav' : 'chef-nav') + ' .nav-link');
    var sections  = $all('[id^="' + prefix + '-"]');

    if (!navLinks.length || !sections.length) return;

    function onScroll() {
      var scrollY = window.pageYOffset + 100;
      var active  = null;

      sections.forEach(function (sec) {
        if (sec.offsetTop <= scrollY) active = sec.id;
      });

      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + active);
      });

      // Back-to-top visibility
      var backs = $all('.back-top');
      backs.forEach(function (b) {
        b.classList.toggle('visible', window.pageYOffset > 400);
      });
    }

    // Remove old listener by cloning scroll handler storage
    window.removeEventListener('scroll', window._navScroll);
    window._navScroll = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once immediately
  }

  /* ============================================================
     SKILL BAR ANIMATION (CSS-driven, triggered by IntersectionObserver)
  ============================================================ */
  function animateSkillBars() {
    var bars = $all('.skill-fill');
    if (!bars.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback — just set width immediately
      bars.forEach(function (b) { b.style.width = b.style.getPropertyValue('--fill') || '50%'; });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var fill = entry.target.style.getPropertyValue('--fill') || '50%';
          entry.target.style.width = fill;
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(function (b) {
      b.style.width = '0%'; // reset
      io.observe(b);
    });
  }

  /* ============================================================
     3D TILT CARDS (dev-only, mouse-driven, no GSAP needed)
  ============================================================ */
  function initTiltCards() {
    var cards = $all('[data-tilt]');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect  = card.getBoundingClientRect();
        var cx    = rect.left + rect.width  / 2;
        var cy    = rect.top  + rect.height / 2;
        var dx    = (e.clientX - cx) / (rect.width  / 2);
        var dy    = (e.clientY - cy) / (rect.height / 2);
        var rotX  = -dy * 8;
        var rotY  =  dx * 8;
        card.style.transform = 'perspective(700px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.03)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease';
        setTimeout(function () { card.style.transition = ''; }, 500);
      });
    });
  }

  /* ============================================================
     SCROLL REVEAL — lightweight alternative to AOS
     (only used if AOS fails to load)
  ============================================================ */
  function initScrollReveal() {
    if (typeof AOS !== 'undefined') {
      try {
        AOS.init({ duration: 700, once: true, offset: 60, easing: 'ease-out-cubic' });
        return; // AOS is handling it
      } catch (e) {}
    }

    // Fallback manual reveal
    var els = $all('[data-aos]');
    if (!els.length) return;

    els.forEach(function (el) {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute('data-aos-delay') || 0;
          setTimeout(function () {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'none';
          }, Number(delay));
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ============================================================
     PARALLAX HERO — subtle, only on desktop
  ============================================================ */
  function initParallax() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var heroGrid = $q('.dev-hero-grid');
    var warmGrad = $q('.hero-warm-gradient');

    document.addEventListener('mousemove', function (e) {
      var px = (e.clientX / window.innerWidth  - 0.5) * 20;
      var py = (e.clientY / window.innerHeight - 0.5) * 20;
      if (heroGrid && currentMode === 'dev') {
        heroGrid.style.transform = 'translate(' + px * 0.4 + 'px, ' + py * 0.4 + 'px)';
      }
      if (warmGrad && currentMode === 'chef') {
        warmGrad.style.transform = 'translate(' + px * 0.3 + 'px, ' + py * 0.3 + 'px)';
      }
    });
  }

  /* ============================================================
     MOBILE MENU
  ============================================================ */
  function initMobileMenu() {
    var menu      = $('mobile-menu');
    var linksList = $('mobile-links');
    var closeBtn  = $('mobile-close');

    if (!menu || !linksList || !closeBtn) return;

    function openMenu(navSel, isChef) {
      var links = $all(navSel + ' .nav-link');
      linksList.innerHTML = '';
      links.forEach(function (link) {
        var li = document.createElement('li');
        var a  = document.createElement('a');
        a.href        = link.getAttribute('href');
        a.textContent = link.textContent;
        on(a, 'click', function () { closeMenu(); });
        li.appendChild(a);
        linksList.appendChild(li);
      });
      menu.classList.toggle('chef-menu-bg', isChef);
      menu.classList.remove('hidden');
    }

    function closeMenu() {
      menu.classList.add('hidden');
    }

    on(closeBtn, 'click', closeMenu);

    on($('dev-hamburger'), 'click', function () { openMenu('.dev-nav', false); });
    on($('chef-hamburger'), 'click', function () { openMenu('.chef-nav', true); });
  }

  /* ============================================================
     CONTACT FORM — prevent default, show toast
  ============================================================ */
  function initForms() {
    var form = $('dev-contact-form');
    if (!form) return;
    on(form, 'submit', function (e) {
      e.preventDefault();
      showToast('Message sent! (placeholder — connect your backend)', 'dev');
      form.reset();
    });
  }

  function showToast(msg, theme) {
    var toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = [
      'position:fixed', 'bottom:40px', 'left:50%',
      'transform:translateX(-50%)', 'z-index:9000',
      'padding:14px 28px', 'border-radius:99px',
      'font-family:monospace', 'font-size:13px', 'color:#fff',
      'background:' + (theme === 'chef' ? '#c0622b' : 'linear-gradient(135deg,#00d4ff,#a855f7)'),
      'box-shadow:0 8px 32px rgba(0,0,0,0.35)',
      'opacity:0', 'transition:opacity 0.3s ease',
      'pointer-events:none', 'max-width:90vw', 'text-align:center'
    ].join(';');
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      setTimeout(function () {
        toast.style.opacity = '0';
        setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
      }, 3000);
    });
  }

  /* ============================================================
     GALLERY LIGHTBOX (simple, no lib)
  ============================================================ */
  function initGallery() {
    on(document, 'click', function (e) {
      var item = e.target.closest('.gallery-item');
      if (!item) return;
      var img = item.querySelector('img');
      if (!img || !img.src || img.style.display === 'none') return;

      var lb = document.createElement('div');
      lb.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:7000',
        'background:rgba(0,0,0,0.92)', 'display:flex',
        'align-items:center', 'justify-content:center', 'cursor:zoom-out'
      ].join(';');
      var i = document.createElement('img');
      i.src = img.src;
      i.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:12px;object-fit:contain;';
      lb.appendChild(i);
      on(lb, 'click', function () { document.body.removeChild(lb); });
      document.body.appendChild(lb);
    });
  }

  /* ============================================================
     WIRE UP MODE BUTTONS
  ============================================================ */
  function initModeButtons() {
    // Selection screen cards
    on($('enter-dev'), 'click', function () { switchMode('dev'); });
    on($('enter-chef'), 'click', function () { switchMode('chef'); });

    // Nav switch buttons
    on($('switch-to-chef'), 'click', function () { switchMode('chef'); });
    on($('switch-to-dev'),  'click', function () { switchMode('dev');  });
  }

  /* ============================================================
     SMOOTH SCROLL for anchor links
  ============================================================ */
  function initSmoothScroll() {
    on(document, 'click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id  = a.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var offset = 70; // nav height
      var top    = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* ============================================================
     BACK-TO-TOP scroll listener (always on)
  ============================================================ */
  function initBackToTop() {
    window.addEventListener('scroll', function () {
      var backs = $all('.back-top');
      backs.forEach(function (b) {
        b.classList.toggle('visible', window.pageYOffset > 400);
      });
    }, { passive: true });
  }

  /* ============================================================
     STICKY NAV — add shadow on scroll
  ============================================================ */
  function initStickyNav() {
    window.addEventListener('scroll', function () {
      var navs = $all('.site-nav');
      navs.forEach(function (nav) {
        nav.style.boxShadow = window.pageYOffset > 20
          ? '0 4px 30px rgba(0,0,0,0.2)'
          : 'none';
      });
    }, { passive: true });
  }

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    // Start with selection screen visible, others hidden
    var selScreen = $('selection-screen');
    var devMode   = $('dev-mode');
    var chefMode  = $('chef-mode');

    if (selScreen) selScreen.style.display = 'flex';
    if (devMode)   devMode.style.display   = 'none';
    if (chefMode)  chefMode.style.display  = 'none';

    // Reset overlay
    var overlay = $('transition-overlay');
    if (overlay) {
      overlay.style.opacity      = '0';
      overlay.style.pointerEvents = 'none';
      var textEl = $q('.trans-text', overlay);
      if (textEl) textEl.style.opacity = '0';
    }

    initLoader();
    initCursor();
    initParticles();
    initTypewriter();
    initTiltCards();
    initModeButtons();
    initMobileMenu();
    initSmoothScroll();
    initBackToTop();
    initStickyNav();
    initForms();
    initGallery();
    initParallax();
    initScrollReveal(); // handles AOS or fallback
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();