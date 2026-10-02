/* ==========================================================================
   Eshwari Charitable Foundation (R.) — donation.js
   Donation page logic: amount selection, purpose selection, donor details
   validation, live donation summary, and a CLEARLY LABELLED demo checkout
   with simulated success / failure / pending states.

   IMPORTANT — REAL PAYMENTS ARCHITECTURE
   No card data, UPI ID, bank account or credentials exist in this file and
   none may ever be added here. Real payments require a secure backend:

     1. Backend creates a Razorpay "order"  →  POST /api/create-order
        (amount in paise, receipt id, notes) using YOUR_SERVER_SIDE keys.
     2. Frontend opens Razorpay Checkout with that order_id.
     3. Backend verifies razorpay_signature (HMAC-SHA256) server-side.
     4. Server records the payment and issues a receipt.
     5. (Optional) Webhooks reconcile async payment states.

   Until window.ECF_CONFIG.paymentsEnabled === true, this page remains in
   demo mode: the "Proceed" button opens a simulation modal that never
   represents — or claims to represent — a real transaction.
   ========================================================================== */
'use strict';

(function () {
  const CFG = window.ECF_CONFIG || {};
  const SUGGESTED = Array.isArray(CFG.suggestedAmounts) && CFG.suggestedAmounts.length
    ? CFG.suggestedAmounts
    : [500, 1000, 2500, 5000];
  const PAYMENTS_ENABLED = CFG.paymentsEnabled === true; // keep false until backend is ready

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const PURPOSES = [
    { id: 'general',   label: 'General Support' },
    { id: 'elderly',   label: 'Elderly Care' },
    { id: 'child',     label: 'Child Welfare' },
    { id: 'education', label: 'Education' },
    { id: 'medical',   label: 'Medical Camps' },
    { id: 'temple',    label: 'Temple Rejuvenation' },
    { id: 'village',   label: 'Village Welfare' },
    { id: 'cow',       label: 'Cow Welfare' }
  ];

  const state = { amount: null, purpose: 'general', name: '', email: '' };

  const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

  /* ------------------------------------------------------------------
     Build amount cards from the editable config
     ------------------------------------------------------------------ */
  function buildAmountCards() {
    const grid = $('#amount-grid');
    if (!grid) return;
    grid.innerHTML = '';
    SUGGESTED.forEach((amt, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'amount-card';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('data-amount', String(amt));
      btn.innerHTML =
        '<span class="amt">' + inr(amt) + '</span>' +
        '<span class="lbl">' + ['A meaningful start', 'Extends our reach', 'Deepens the impact', 'Transforms many lives'][i % 4] + '</span>';
      btn.addEventListener('click', () => selectAmount(amt, btn));
      grid.appendChild(btn);
    });
    /* restore from ?amount= deep link */
    const params = new URLSearchParams(location.search);
    const q = parseInt(params.get('amount'), 10);
    if (q && q > 0) {
      $('#custom-amount').value = String(q);
      selectAmount(q, null);
    } else {
      /* preselect first card for a friendlier start */
      const first = grid.querySelector('.amount-card');
      if (first) selectAmount(SUGGESTED[0], first);
    }
  }

  function selectAmount(amount, cardBtn) {
    state.amount = amount;
    $$('.amount-card').forEach((b) => b.setAttribute('aria-pressed', b === cardBtn ? 'true' : 'false'));
    const custom = $('#custom-amount');
    if (cardBtn && custom) custom.value = '';
    updateSummary();
  }

  /* ------------------------------------------------------------------
     Purpose pills
     ------------------------------------------------------------------ */
  function buildPurposePills() {
    const grid = $('#purpose-grid');
    if (!grid) return;
    grid.innerHTML = '';
    PURPOSES.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'purpose-pill';
      btn.setAttribute('aria-pressed', p.id === state.purpose ? 'true' : 'false');
      btn.setAttribute('data-purpose', p.id);
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-4.6-9.3-8.9C.9 8.6 2.6 5 6 5c2 0 3.2 1 4 2.1C10.8 6 12 5 14 5c3.4 0 5.1 3.6 3.3 7.1C19 16.4 12 21 12 21Z"/></svg>' +
        '<span>' + p.label + '</span>';
      btn.addEventListener('click', () => {
        state.purpose = p.id;
        $$('.purpose-pill').forEach((b) => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
        updateSummary();
      });
      grid.appendChild(btn);
    });
  }

  /* ------------------------------------------------------------------
     Live summary
     ------------------------------------------------------------------ */
  function purposeLabel(id) {
    const p = PURPOSES.find((x) => x.id === id);
    return p ? p.label : 'General Support';
  }

  function updateSummary() {
    state.name = ($('#donor-name') || {}).value || '';
    state.email = ($('#donor-email') || {}).value || '';
    const amtEl = $('#sum-amount');
    if (amtEl) amtEl.textContent = state.amount ? inr(state.amount) : '—';
    const amtTotal = $('#sum-amount-total');
    if (amtTotal) amtTotal.textContent = state.amount ? inr(state.amount) : '—';
    const purEl = $('#sum-purpose');
    if (purEl) purEl.textContent = purposeLabel(state.purpose);
    const nameEl = $('#sum-name');
    if (nameEl) nameEl.textContent = state.name.trim() ? state.name.trim().split(/\s+/)[0] : '—';
    const typeEl = $('#sum-type');
    if (typeEl) typeEl.textContent = 'One-time contribution';
  }

  function initSummaryBindings() {
    ['donor-name', 'donor-email'].forEach((id) => {
      const el = $('#' + id);
      if (el) el.addEventListener('input', updateSummary);
    });
    const custom = $('#custom-amount');
    if (custom) {
      custom.addEventListener('input', () => {
        const v = parseInt(custom.value, 10);
        $$('.amount-card').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        state.amount = v && v > 0 ? v : null;
        updateSummary();
      });
    }
  }

  /* ------------------------------------------------------------------
     Donor form validation (collect only what is needed)
     ------------------------------------------------------------------ */
  function setError(input, message) {
    const field = input.closest('.field');
    if (!field) return;
    const errEl = $('.error-msg', field);
    if (message) {
      field.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      if (errEl) {
        errEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>' + message;
        input.setAttribute('aria-describedby', errEl.id || '');
      }
    } else {
      field.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
    }
  }

  function validateDonor() {
    let firstInvalid = null;
    const name = $('#donor-name');
    const email = $('#donor-email');
    const phone = $('#donor-phone');

    const nameMsg = (name.value || '').trim().length >= 2 ? '' : 'Please enter your full name.';
    setError(name, nameMsg);
    if (nameMsg) firstInvalid = firstInvalid || name;

    const emailMsg = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email.value || '').trim()) ? '' : 'Please enter a valid email address.';
    setError(email, emailMsg);
    if (emailMsg) firstInvalid = firstInvalid || email;

    const pv = (phone.value || '').trim();
    const phoneMsg = !pv ? '' : (/^[\d\s+\-()]{7,18}$/.test(pv) ? '' : 'Please enter a valid phone number (or leave it blank).');
    setError(phone, phoneMsg);
    if (phoneMsg) firstInvalid = firstInvalid || phone;

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  /* ------------------------------------------------------------------
     Demo checkout modal — simulated states, clearly distinguished
     ------------------------------------------------------------------ */
  let closePayModal = null;

  function showPayModal(mode, payload) {
    const modal = $('#pay-modal');
    if (!modal) return;
    ['pay-box--demo', 'pay-box--success', 'pay-box--fail', 'pay-box--pending'].forEach((c) => $('.pay-box', modal).classList.remove(c));
    const box = $('.pay-box', modal);
    box.classList.add('pay-box--' + mode);

    const views = {
      demo: {
        title: 'Demo checkout — no real payment',
        body: 'This is a design preview. No payment gateway is connected yet, so nothing will be charged. When the foundation activates a secure backend with Razorpay (or a similar licensed gateway), this button will open the real checkout.',
        ref: null,
        actions: 'simulate'
      },
      success: {
        title: 'Simulated: Payment successful',
        body: 'This success screen demonstrates what a donor would see after a REAL verified payment. This simulation did not move any money and must never be treated as a receipt.',
        ref: 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        actions: 'done'
      },
      fail: {
        title: 'Simulated: Payment failed',
        body: 'This screen demonstrates how a failed or cancelled gateway transaction would be presented, with an option to try again.',
        ref: null,
        actions: 'retry'
      },
      pending: {
        title: 'Simulated: Payment pending',
        body: 'Some payment methods confirm asynchronously. This screen demonstrates how a genuinely pending transaction would be shown until the gateway confirms it (typically via webhook verification).',
        ref: null,
        actions: 'done'
      }
    };
    const v = views[mode];
    $('#pay-title').textContent = v.title;
    $('#pay-desc').textContent = v.body;

    /* state icon */
    const icoEl = $('#pay-state-ico');
    const ICONS = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
      fail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      pending: '<span class="spinner" role="img" aria-label="Waiting"></span>',
      demo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5m0-3h.01"/></svg>'
    };
    if (icoEl) icoEl.innerHTML = ICONS[mode] || ICONS.demo;

    const refEl = $('#pay-ref');
    if (v.ref) { refEl.hidden = false; refEl.textContent = 'Simulated reference: ' + v.ref; }
    else { refEl.hidden = true; }

    const actions = $('#pay-actions');
    actions.innerHTML = '';
    if (mode === 'demo') {
      actions.innerHTML =
        '<button type="button" class="btn btn--ghost btn--sm" data-sim="pending">Preview “pending” state</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-sim="fail">Preview “failure” state</button>' +
        '<button type="button" class="btn btn--primary btn--sm" data-sim="success">Preview “success” state</button>';
      $$('[data-sim]', actions).forEach((b) => b.addEventListener('click', () => showPayModal(b.getAttribute('data-sim'))));
    } else if (mode === 'fail') {
      actions.innerHTML =
        '<button type="button" class="btn btn--primary btn--sm" data-sim="demo">Retry simulation</button>';
      $$('[data-sim]', actions).forEach((b) => b.addEventListener('click', () => showPayModal(b.getAttribute('data-sim'))));
    } else {
      actions.innerHTML = '<button type="button" class="btn btn--primary btn--sm" data-overlay-close>Close</button>';
    }

    if (window.ecfOpenOverlay && !modal.classList.contains('open')) {
      closePayModal = window.ecfOpenOverlay(modal);
      const obs = new MutationObserver(() => {
        if (!modal.classList.contains('open')) { closePayModal = null; obs.disconnect(); }
      });
      obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function closePay() {
    if (closePayModal) { closePayModal(); closePayModal = null; }
  }

  /* ------------------------------------------------------------------
     Proceed button
     ------------------------------------------------------------------ */
  function initProceed() {
    const btn = $('#donate-proceed');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!state.amount || state.amount <= 0) {
        window.ecfToast && window.ecfToast('Please choose or enter a donation amount first.');
        const custom = $('#custom-amount');
        if (custom) custom.focus();
        return;
      }
      if (!validateDonor()) return;
      updateSummary();

      if (PAYMENTS_ENABLED) {
        /* ---- REAL FLOW (activate after backend integration) ----
           In production you would:
             const res = await fetch('/api/create-order', { method:'POST',
               body: JSON.stringify({ amount: state.amount * 100,
                 purpose: state.purpose, email: state.email }) });
             const { orderId } = await res.json();
             new window.Razorpay({ key: PUBLIC_KEY_ONLY, order_id: orderId,
               handler: (resp) => verifyOnServer(resp) }).open();
           Never embed secret keys here. Kept as guidance only. */
        window.ecfToast && window.ecfToast('Live payments are not active in this build.');
        showPayModal('demo');
      } else {
        showPayModal('demo');
      }
    });
    const closeBtn = $('#pay-close');
    if (closeBtn) closeBtn.addEventListener('click', closePay);
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function boot() {
    buildAmountCards();
    buildPurposePills();
    initSummaryBindings();
    initProceed();
    updateSummary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
