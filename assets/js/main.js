
const BUSINESS_NAME = "Centro Veterinario Inara";
const CLINIC_EMAIL = "clinicaveterinaria.inara@gmail.com";
const CLINIC_TEL = "+524432749465";
// Mobile nav
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
// FAQ accordions
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});
// Vacunas species filter
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
    const f = btn.dataset.filter;
    document.querySelectorAll('[data-species]').forEach(el => {
      el.style.display = (f === 'todos' || el.dataset.species.split(' ').includes(f)) ? '' : 'none';
    });
  });
});
// Home quick booker -> prefill citas via sessionStorage
document.querySelectorAll('#quick-booker .opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('[data-group]');
    group.querySelectorAll('.opt').forEach(b => b.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
    if (group.dataset.group === 'species') sessionStorage.setItem('inara_species', btn.dataset.value);
    if (group.dataset.group === 'motive') sessionStorage.setItem('inara_motive', btn.dataset.value);
  });
});
// Contact form -> mailto
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    contactForm.querySelectorAll('[required]').forEach(f => {
      const err = f.closest('.field').querySelector('.field-error');
      if (!f.value.trim()) { ok = false; f.classList.add('invalid'); if (err) err.classList.add('show'); }
      else { f.classList.remove('invalid'); if (err) err.classList.remove('show'); }
    });
    if (!ok) return;
    const name = document.getElementById('cf-name').value.trim();
    const tel = document.getElementById('cf-tel').value.trim();
    const sp = document.getElementById('cf-species').value;
    const mo = document.getElementById('cf-motive').value;
    const msg = document.getElementById('cf-msg').value.trim();
    const subject = 'Mensaje desde el sitio web — ' + name;
    const body = 'Nombre: ' + name + '\nTeléfono: ' + tel + '\nEspecie: ' + sp + '\nMotivo: ' + mo + '\n\n' + msg;
    window.location.href = 'mailto:' + CLINIC_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    const done = document.getElementById('contact-sent');
    if (done) done.style.display = 'block';
  });
}
// ---- Appointment booker ----
const booker = document.getElementById('booker');
if (booker) {
  const state = { species:'', petName:'', petAge:'', motive:'', date:'', slot:'', owner:'', phone:'', email:'', notes:'' };
  let step = 1;
  const panels = booker.querySelectorAll('.step-panel');
  const progLabel = document.getElementById('booker-progress');
  const progBar = document.getElementById('booker-bar');
  const stepNames = {1:'Identidad de la mascota',2:'¿Qué necesita?',3:'¿Cuándo te gustaría venir?',4:'Tus datos de contacto'};
  function showStep(n){
    step = n;
    panels.forEach(p => p.classList.toggle('active', Number(p.dataset.step) === n));
    if (progLabel) progLabel.textContent = 'PASO ' + n + ' DE 4 — ' + stepNames[n];
    if (progBar) progBar.style.width = (n * 25) + '%';
    updateSummary();
    const active = booker.querySelector('.step-panel.active h3');
    if (active) active.setAttribute('tabindex','-1'), active.focus({preventScroll:true});
  }
  function setErr(id, show){ const el = document.getElementById(id); if (el) el.classList.toggle('show', !!show); }
  // Step 1 species
  booker.querySelectorAll('[data-species-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      booker.querySelectorAll('[data-species-opt]').forEach(b => b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
      state.species = btn.dataset.speciesOpt;
      setErr('err-species', false);
      updateSummary();
    });
  });
  // Step 2 motive
  booker.querySelectorAll('[data-motive-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      booker.querySelectorAll('[data-motive-opt]').forEach(b => b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
      state.motive = btn.dataset.motiveOpt;
      setErr('err-motive', false);
      updateSummary();
    });
  });
  // Step 3 slots
  booker.querySelectorAll('[data-slot-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      booker.querySelectorAll('[data-slot-opt]').forEach(b => b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
      state.slot = btn.dataset.slotOpt;
      setErr('err-slot', false);
      updateSummary();
    });
  });
  const dateInput = document.getElementById('bk-date');
  if (dateInput) {
    const today = new Date(); today.setDate(today.getDate() + 1);
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.addEventListener('change', () => {
      const d = new Date(dateInput.value + 'T12:00:00');
      const sundayMsg = document.getElementById('err-sunday');
      if (!isNaN(d) && d.getDay() === 0) {
        if (sundayMsg) sundayMsg.classList.add('show');
        dateInput.classList.add('invalid');
        dateInput.value = '';
        state.date = '';
      } else {
        if (sundayMsg) sundayMsg.classList.remove('show');
        dateInput.classList.remove('invalid');
        state.date = dateInput.value;
      }
      updateSummary();
    });
  }
  // Step 4 fields
  ['bk-petname','bk-petage','bk-owner','bk-phone','bk-email','bk-notes'].forEach(id => {
    const f = document.getElementById(id);
    if (!f) return;
    f.addEventListener('input', () => {
      const map = {'bk-petname':'petName','bk-petage':'petAge','bk-owner':'owner','bk-phone':'phone','bk-email':'email','bk-notes':'notes'};
      state[map[id]] = f.value.trim();
      f.classList.remove('invalid');
      updateSummary();
    });
  });
  function fmtDate(v){
    if (!v) return '';
    const d = new Date(v + 'T12:00:00');
    return d.toLocaleDateString('es-MX', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
  }
  function updateSummary(){
    const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    s('sum-pet', (state.petName ? state.petName + ' · ' : '') + (state.species || 'Aún no seleccionada'));
    s('sum-motive', state.motive || 'Por definir');
    s('sum-date', state.date ? fmtDate(state.date) : 'Sin fecha elegida');
    s('sum-slot', state.slot ? state.slot + ' [a confirmar]' : 'Por definir');
  }
  // Navigation
  booker.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = Number(btn.dataset.goto);
      if (target === 2) {
        if (!state.species) { setErr('err-species', true); return; }
        const name = document.getElementById('bk-petname');
        if (!name.value.trim()) { name.classList.add('invalid'); document.getElementById('err-petname').classList.add('show'); name.focus(); return; }
      }
      if (target === 3) {
        if (!state.motive) { setErr('err-motive', true); return; }
      }
      if (target === 4) {
        if (!state.date) { setErr('err-date', true); return; }
        if (!state.slot) { setErr('err-slot', true); return; }
      }
      showStep(target);
    });
  });
  // Confirm by email -> PROMPT mailto format
  const mailBtn = document.getElementById('confirm-mail');
  if (mailBtn) {
    mailBtn.addEventListener('click', () => {
      const owner = document.getElementById('bk-owner');
      const phone = document.getElementById('bk-phone');
      let ok = true;
      if (!owner.value.trim()) { owner.classList.add('invalid'); document.getElementById('err-owner').classList.add('show'); ok = false; }
      if (!phone.value.trim()) { phone.classList.add('invalid'); document.getElementById('err-phone').classList.add('show'); ok = false; }
      if (!state.species || !state.motive || !state.date || !state.slot) { showStep(1); return; }
      if (!ok) { showStep(4); owner.focus(); return; }
      const pet = state.petName || state.species;
      const day = fmtDate(state.date);
      const subject = 'Cita — ' + pet + ', ' + state.motive + ', ' + day + ' ' + state.slot;
      const body = 'Cita — ' + pet + ', ' + state.motive + ', ' + day + ' ' + state.slot + '. Dueño: ' + state.owner + '. Tel: ' + state.phone + '.';
      window.location.href = 'mailto:' + CLINIC_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      const sent = document.getElementById('booker-sent');
      if (sent) sent.style.display = 'block';
    });
  }
  // Prefill from home quick booker
  const preS = sessionStorage.getItem('inara_species');
  const preM = sessionStorage.getItem('inara_motive');
  if (preS) {
    const b = booker.querySelector('[data-species-opt="' + preS + '"]');
    if (b) b.click();
  }
  if (preM) {
    const b = booker.querySelector('[data-motive-opt="' + preM + '"]');
    if (b) b.click();
  }
  updateSummary();
}
