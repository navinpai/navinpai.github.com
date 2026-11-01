(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const dialogs = [...document.querySelectorAll('dialog')];
  const $ = selector => document.querySelector(selector);
  let current = 0;
  let policy = 'all';
  let controlsTimeout;

  function resize() {
    document.documentElement.style.setProperty('--scale', Math.min(innerWidth / 1440, innerHeight / 810));
  }
  function flashControls() {
    document.body.classList.add('show-controls');
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => document.body.classList.remove('show-controls'), 2200);
  }
  function showSlide(index, updateHash = true) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1}. ${slide.dataset.title}`);
    });
    const slide = slides[current];
    $('#slide-counter').textContent = `${current + 1} / ${slides.length}`;
    $('#progress i').style.width = `${(current + 1) / slides.length * 100}%`;
    $('#previous').disabled = current === 0;
    $('#next').disabled = current === slides.length - 1;
    $('#notes-prev').disabled = current === 0;
    $('#notes-next').disabled = current === slides.length - 1;
    $('#announcer').textContent = `Slide ${current + 1} of ${slides.length}: ${slide.dataset.title}`;
    $('#notes-heading').textContent = slide.dataset.title;
    $('#notes-time').textContent = slide.dataset.time;
    $('#notes-content').innerHTML = slide.querySelector('.speaker-notes').innerHTML;
    document.title = `${slide.dataset.title} · Navin Pai`;
    if (updateHash && location.hash !== `#${slide.id}`) history.replaceState(null, '', `${location.pathname}${location.search}#${slide.id}`);
    document.querySelectorAll('#overview-grid button').forEach((button, i) => button.classList.toggle('current', current === i));
  }
  function fromHash() {
    const index = slides.findIndex(slide => slide.id === location.hash.slice(1));
    showSlide(index < 0 ? 0 : index, false);
  }
  function toggleDialog(id) {
    const dialog = document.getElementById(id);
    if (dialog.open) return dialog.close();
    dialogs.forEach(other => { if (other.open) other.close(); });
    dialog.showModal();
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { $('#announcer').textContent = 'Use your browser fullscreen command if fullscreen is unavailable.'; }
  }
  const money = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0});
  const number = new Intl.NumberFormat('en-US', {maximumFractionDigits:1});
  function updateCost() {
    const result = window.AISRECost.calculate(Number($('#alert-volume').value), policy);
    $('#volume-label').textContent = number.format(result.alerts);
    $('#monthly-total').textContent = money.format(result.monthly);
    $('#run-count').textContent = `${number.format(result.investigations)} investigations / day`;
    $('#triage-total').textContent = money.format(result.classify + result.group);
    $('#investigation-total').textContent = money.format(result.investigate);
    $('#remediation-total').textContent = money.format(result.remediate);
    $('#policy-explanation').textContent = `Includes model usage for ${number.format(result.remediationAttempts)} remediation attempts / day.${policy === 'lean' ? ' Routed run: 120k in + 12k out + $0.05 summary.' : ''} Backend charges are separate.`;
    document.querySelectorAll('[data-policy]').forEach(button => {
      const active = button.dataset.policy === policy;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  slides.forEach((slide, i) => {
    const button = document.createElement('button');
    const n = document.createElement('span'); n.textContent = String(i + 1).padStart(2, '0');
    const title = document.createElement('strong'); title.textContent = slide.dataset.title;
    const timing = document.createElement('small'); timing.textContent = slide.dataset.time;
    button.append(n, title, timing);
    button.addEventListener('click', () => { $('#overview-panel').close(); showSlide(i); });
    $('#overview-grid').append(button);
  });
  $('#previous').addEventListener('click', () => showSlide(current - 1));
  $('#next').addEventListener('click', () => showSlide(current + 1));
  $('#notes-prev').addEventListener('click', () => showSlide(current - 1));
  $('#notes-next').addEventListener('click', () => showSlide(current + 1));
  $('#slide-counter').addEventListener('click', () => toggleDialog('overview-panel'));
  $('#notes-toggle').addEventListener('click', () => toggleDialog('notes-panel'));
  $('#fullscreen').addEventListener('click', fullscreen);
  $('[data-open="help-panel"]').addEventListener('click', flashControls);
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => toggleDialog(button.dataset.open)));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('[data-policy]').forEach(button => button.addEventListener('click', () => { policy = button.dataset.policy; updateCost(); }));
  $('#alert-volume').addEventListener('input', updateCost);
  dialogs.forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    const key = event.key.toLowerCase();
    const openDialog = dialogs.find(dialog => dialog.open);
    if (openDialog) {
      const closeKey = {'notes-panel':'n', 'overview-panel':'o', 'sources-panel':'s', 'help-panel':'?'}[openDialog.id];
      if (key === closeKey) { event.preventDefault(); openDialog.close(); }
      return;
    }
    if ((key === ' ' || key === 'enter') && event.target.closest('button,a')) return;
    const actions = {arrowright:()=>showSlide(current+1), pagedown:()=>showSlide(current+1), ' ':()=>showSlide(current+1),
      arrowleft:()=>showSlide(current-1), pageup:()=>showSlide(current-1), home:()=>showSlide(0), end:()=>showSlide(slides.length-1),
      n:()=>toggleDialog('notes-panel'), o:()=>toggleDialog('overview-panel'), s:()=>toggleDialog('sources-panel'),
      f:fullscreen, '?':()=>toggleDialog('help-panel')};
    if (actions[key]) { event.preventDefault(); actions[key](); flashControls(); }
  });
  let touchStart;
  $('#deck').addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 && !event.target.closest('button,a,input') ? {x:event.touches[0].clientX,y:event.touches[0].clientY} : null;
  }, {passive:true});
  $('#deck').addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) showSlide(current + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive:true});
  // Print every slide, including the otherwise inert/hidden slides, with readable tagged content.
  addEventListener('beforeprint', () => slides.forEach(slide => { slide.inert = false; slide.removeAttribute('aria-hidden'); }));
  addEventListener('afterprint', () => showSlide(current, false));
  addEventListener('resize', resize);
  addEventListener('hashchange', fromHash);
  addEventListener('mousemove', flashControls, {passive:true});
  document.body.classList.toggle('export', new URLSearchParams(location.search).has('export'));
  resize(); fromHash(); updateCost(); flashControls();
})();
