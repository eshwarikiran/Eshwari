/* ==========================================================================
   Eshwari Charitable Foundation (R.) — main.js
   Shared site behaviour: configuration, sticky header, mobile menu,
   smooth anchor navigation, active link highlighting, reveal-on-scroll,
   accordions, gallery lightbox, contact form validation, footer year.
   Pure vanilla JavaScript — no frameworks.
   ========================================================================== */
'use strict';

/* --------------------------------------------------------------------------
   SITE CONFIGURATION  ★ EDIT THIS BLOCK ★
   Replace the placeholder values below with the foundation's official
   details. Anything left empty ("") renders as a tasteful "To be updated"
   chip instead of fake data. See README.md for details.
   -------------------------------------------------------------------------- */
window.ECF_CONFIG = {
  orgName: 'Eshwari Charitable Foundation (R.)',
  tagline: 'Compassion in Action, Service for All.',
  /* Official contact details — leave "" until verified */
  email: '',                 // e.g. 'office@yourdomain.org'
  phone: '',                 // e.g. '+91 XXXXX XXXXX'
  address: '',               // e.g. 'Registered office address, City, State PIN'
  /* Social media page URLs — leave "" to hide the icon */
  socials: { facebook: '', instagram: '', youtube: '', twitter: '' },
  /* Contact-form subject options */
  subjects: [
    'General enquiry',
    'Volunteering',
    'Partnership / Collaboration',
    'Donation related',
    'Ayurvedic products enquiry',
    'Other'
  ],
  /* Donation page — editable suggested amounts (INR) */
  suggestedAmounts: [500, 1000, 2500, 5000],
  /* Real payments flag — keep false until a backend + payment gateway
     (e.g. Razorpay) is configured. When false the page runs in clearly
     labelled demo mode and never fakes a real transaction. */
  paymentsEnabled: false,
  /* Tax-exemption note — enable ONLY after registrations are verified. */
  showTaxNote: false
};

(function () {
  const CFG = window.ECF_CONFIG;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------
     Small helpers
     -------------------------------------------------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /** Accessible modal open/close with focus trap. Returns a close() fn. */
  function openOverlay(overlay, { initialFocus } = {}) {
    const previouslyFocused = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const focusables = () => $$(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      overlay
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    const focusTarget = (initialFocus && overlay.querySelector(initialFocus)) || focusables()[0] || overlay;
    focusTarget.focus({ preventScroll: true });

    function onKeydown(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    function onScrim(e) { if (e.target === overlay || e.target.closest('[data-overlay-close]')) close(); }
    overlay.addEventListener('keydown', onKeydown);
    overlay.addEventListener('mousedown', onScrim);

    function close() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      overlay.removeEventListener('keydown', onKeydown);
      overlay.removeEventListener('mousedown', onScrim);
      document.removeEventListener('keydown', onKeydown);
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus({ preventScroll: true });
    }
    document.addEventListener('keydown', onKeydown);
    return close;
  }

  /* Toast notification (used by products page; harmless elsewhere) */
  let toastTimer = null;
  function toast(message) {
    let el = $('#ecf-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ecf-toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg><span></span>';
      document.body.appendChild(el);
    }
    el.querySelector('span').textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }
  window.ecfToast = toast;
  /* Expose accessible overlay manager for page-specific scripts */
  window.ecfOpenOverlay = openOverlay;

  /* --------------------------------------------------------------------
     Render configured contact details (or elegant "to be updated" chips)
     -------------------------------------------------------------------- */
  function renderContactConfig() {
    const TBD = '<em class="to-be">To be updated — see README</em>';
    $$('[data-config="email"]').forEach((el) => {
      if (CFG.email) {
        el.innerHTML = '<a href="mailto:' + escapeHtml(CFG.email) + '">' + escapeHtml(CFG.email) + '</a>';
      } else { el.innerHTML = TBD; }
    });
    $$('[data-config="phone"]').forEach((el) => {
      el.innerHTML = CFG.phone
        ? '<a href="tel:' + escapeHtml(CFG.phone.replace(/[^+\d]/g, '')) + '">' + escapeHtml(CFG.phone) + '</a>'
        : TBD;
    });
    $$('[data-config="address"]').forEach((el) => {
      el.innerHTML = CFG.address ? escapeHtml(CFG.address) : TBD;
    });
    /* Social icons: hide those without URLs */
    $$('.socials a[data-social]').forEach((a) => {
      const key = a.getAttribute('data-social');
      const url = CFG.socials && CFG.socials[key];
      if (!url) { a.style.display = 'none'; }
      else { a.href = url; a.style.display = ''; }
    });
    /* Optional tax note on the donation page */
    if (!CFG.showTaxNote) {
      $$('.tax-note-block').forEach((el) => { el.hidden = true; });
    }
  }

  /* --------------------------------------------------------------------
     Dynamic year in footer(s)
     -------------------------------------------------------------------- */
  function renderYear() {
    const year = String(new Date().getFullYear());
    $$('[data-year]').forEach((el) => { el.textContent = year; });
  }

  /* --------------------------------------------------------------------
     Sticky header state
     -------------------------------------------------------------------- */
  function initHeader() {
    const header = $('.site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --------------------------------------------------------------------
     Mobile menu (slide-in drawer, focus trapped)
     -------------------------------------------------------------------- */
  function initMobileNav() {
    const toggle = $('.menu-toggle');
    const drawer = $('#mobile-nav');
    if (!toggle || !drawer) return;
    let closeFn = null;

    toggle.addEventListener('click', () => {
      if (drawer.classList.contains('open')) closeFn && closeFn();
      else {
        closeFn = openOverlay(drawer, { initialFocus: '.mobile-nav__panel a' });
        toggle.setAttribute('aria-expanded', 'true');
        const observer = new MutationObserver(() => {
          if (!drawer.classList.contains('open')) {
            toggle.setAttribute('aria-expanded', 'false');
            closeFn = null;
            observer.disconnect();
          }
        });
        observer.observe(drawer, { attributes: true, attributeFilter: ['class'] });
      }
    });
    /* close on link tap */
    $$('#mobile-nav a').forEach((a) => a.addEventListener('click', () => {
      closeFn && closeFn();
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* --------------------------------------------------------------------
     Active navigation highlighting (single-page sections)
     -------------------------------------------------------------------- */
  function initActiveNav() {
    const sections = $$('main section[id]');
    const navLinks = $$('.nav a[href^="#"], .mobile-nav a[href^="#"]');
    if (!sections.length || !navLinks.length) return;
    if (!('IntersectionObserver' in window)) return;

    const map = new Map();
    navLinks.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(link);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('active'));
          (map.get(id) || []).forEach((l) => l.classList.add('active'));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach((s) => observer.observe(s));
  }

  /* --------------------------------------------------------------------
     Smooth scrolling with drawer close (CSS scroll-behavior handles motion;
     we only close the drawer). Anchor links to other pages just work.
     -------------------------------------------------------------------- */
  function initAnchorNav() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        setTimeout(() => target.removeAttribute('tabindex'), 1200);
      });
    });
    /* "Volunteer"/"Partner" CTAs may pre-select the contact subject */
    $$('[data-preset-subject]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const select = $('#contact-subject');
        if (select) {
          const want = btn.getAttribute('data-preset-subject');
          Array.from(select.options).forEach((o) => { if (o.value === want) select.value = want; });
        }
      });
    });
  }

  /* --------------------------------------------------------------------
     Reveal on scroll
     -------------------------------------------------------------------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in-view'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => observer.observe(el));
  }

  /* --------------------------------------------------------------------
     Accordions (initiative details, FAQs) — accessible disclosure pattern
     -------------------------------------------------------------------- */
  function initAccordions() {
    $$('.acc-trigger').forEach((btn) => {
      const panel = btn.nextElementSibling;
      if (!panel) return;
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true;

      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
    });

    /* "Learn more" buttons that open a specific accordion item */
    $$('[data-acc-target]').forEach((triggerBtn) => {
      triggerBtn.addEventListener('click', () => {
        const id = triggerBtn.getAttribute('data-acc-target');
        const acc = document.getElementById(id);
        if (!acc) return;
        const btn = $('.acc-trigger', acc) || acc;
        if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
        acc.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      });
    });
  }

  /* --------------------------------------------------------------------
     Gallery lightbox — keyboard accessible, prev/next, captions
     -------------------------------------------------------------------- */
  function initLightbox() {
    const lb = $('#lightbox');
    const triggers = $$('.g-btn');
    if (!lb || !triggers.length) return;

    const imgEl = $('.lb-figure img', lb);
    const capEl = $('.lb-figure figcaption .cap-text', lb);
    const countEl = $('.lb-figure .lb-count', lb);
    let index = 0;
    let closeFn = null;

    function show(i) {
      index = (i + triggers.length) % triggers.length;
      const btn = triggers[index];
      const img = $('img', btn);
      const caption = btn.getAttribute('data-caption') || (img ? img.alt : '');
      imgEl.src = img.currentSrc || img.src;
      imgEl.alt = img.alt || '';
      if (capEl) capEl.textContent = caption;
      if (countEl) countEl.textContent = 'Image ' + (index + 1) + ' of ' + triggers.length + ' · Illustrative visual';
    }

    triggers.forEach((btn, i) => btn.addEventListener('click', () => {
      show(i);
      closeFn = openOverlay(lb, { initialFocus: '.lb-close' });
    }));
    $('.lb-close', lb).addEventListener('click', () => closeFn && closeFn());
    $('.lb-btn--prev', lb).addEventListener('click', () => show(index - 1));
    $('.lb-btn--next', lb).addEventListener('click', () => show(index + 1));
    lb.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  /* --------------------------------------------------------------------
     Contact form validation — honest success state (no fake delivery)
     -------------------------------------------------------------------- */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    const success = $('#contact-success');
    const okName = $('#contact-success-name');

    const validators = {
      name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your full name.'),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'),
      phone: (v) => {
        if (!v.trim()) return ''; // optional
        return /^[\d\s+\-()]{7,18}$/.test(v.trim()) ? '' : 'Please enter a valid phone number (or leave it blank).';
      },
      subject: (v) => (v ? '' : 'Please choose a subject.'),
      message: (v) => (v.trim().length >= 10 ? '' : 'Please write a short message (at least 10 characters).')
    };

    function setError(input, message) {
      const field = input.closest('.field');
      const errEl = field && $('.error-msg', field);
      if (!field) return;
      if (message) {
        field.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
        if (errEl) {
          errEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>' + escapeHtml(message);
          input.setAttribute('aria-describedby', errEl.id || '');
        }
      } else {
        field.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
      }
    }

    $$('input, select, textarea', form).forEach((input) => {
      input.addEventListener('blur', () => {
        const fn = validators[input.name];
        if (fn) setError(input, fn(input.value));
      });
      input.addEventListener('input', () => setError(input, ''));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstInvalid = null;
      Object.keys(validators).forEach((name) => {
        const input = form.elements[name];
        if (!input) return;
        const msg = validators[name](input.value || '');
        setError(input, msg);
        if (msg && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      /* Validation passed. NOTE: no backend is configured, so we do NOT
         claim the message was delivered. We clearly state what happened. */
      if (okName) okName.textContent = (form.elements.name.value || '').trim().split(/\s+/)[0] || 'friend';
      if (success) {
        form.hidden = true;
        success.hidden = false;
        success.classList.add('show');
        success.setAttribute('tabindex', '-1');
        success.focus({ preventScroll: true });
      } else {
        form.reset();
      }
    });

    const resetBtn = $('#contact-form-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.hidden = false;
        if (success) { success.hidden = true; success.classList.remove('show'); }
        const nameInput = form.elements.name;
        if (nameInput) nameInput.focus();
      });
    }
  }

  /* --------------------------------------------------------------------
     Boot
     -------------------------------------------------------------------- */
  function init() {
    document.documentElement.classList.remove('no-js');
    renderContactConfig();
    renderYear();
    initHeader();
    initMobileNav();
    initActiveNav();
    initAnchorNav();
    initReveal();
    initAccordions();
    initLightbox();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
