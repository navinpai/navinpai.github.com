(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const params = new URLSearchParams(location.search);
  const presenter = params.has('presenter');
  const exportMode = params.has('export');
  const viewport = document.querySelector('#viewport');
  const overview = document.querySelector('#overview');
  const help = document.querySelector('#help');
  let index = 0;
  let revealed = false;
  let channel;
  let presenterWindow;
  let elapsed = 0;
  let selectedLevel = 0;
  let startedAt = null;
  let touchStart = null;
  try { channel = new BroadcastChannel('sre-fails-wad-presentation'); } catch { /* File URLs can restrict cross-window communication. */ }
  document.body.classList.toggle('presenter-mode', presenter);
  document.body.classList.toggle('export', exportMode);

  function fit() {
    const bounds = viewport.getBoundingClientRect();
    document.documentElement.style.setProperty('--scale', Math.min(bounds.width / 1440, bounds.height / 810));
  }
  function fromHash() {
    const match = location.hash.match(/^#slide-(\d+)$/);
    return match ? Math.min(slides.length - 1, Math.max(0, Number(match[1]) - 1)) : 0;
  }
  function show(next, broadcast = true, reveal = false) {
    index = Math.max(0, Math.min(slides.length - 1, next));
    revealed = Boolean(reveal && slides[index].hasAttribute('data-has-reveal'));
    const activeElement = document.activeElement;
    if (activeElement && slides.some(slide => slide.contains(activeElement))) activeElement.blur();
    slides.forEach((slide, n) => {
      slide.hidden = n !== index;
      slide.setAttribute('aria-hidden', String(n !== index));
      slide.inert = n !== index;
      slide.querySelectorAll('[data-reveal]').forEach(part => {
        const visible = n === index && revealed;
        part.hidden = !visible;
        part.inert = !visible;
        part.setAttribute('aria-hidden', String(!visible));
      });
      slide.querySelectorAll('[data-before-reveal]').forEach(part => {
        part.hidden = n === index && revealed;
      });
    });
    const slide = slides[index];
    const fragment = `#slide-${index + 1}`;
    if (location.hash !== fragment) history.replaceState(null, '', fragment);
    document.querySelector('#counter').textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
    const hasReveal = slide.hasAttribute('data-has-reveal');
    document.querySelector('#previous').disabled = index === 0 && !revealed;
    const nextButton = document.querySelector('#next');
    nextButton.disabled = index === slides.length - 1 && (!hasReveal || revealed);
    nextButton.setAttribute('aria-label', hasReveal && !revealed ? 'Reveal solution' : 'Next slide');
    nextButton.title = hasReveal && !revealed ? 'Reveal solution (Right / Space)' : 'Next slide';
    const stepStatus = document.querySelector('#step-status');
    stepStatus.hidden = !hasReveal;
    stepStatus.textContent = revealed ? 'Solution · 2/2' : 'Problem · 1/2';
    document.querySelector('#announcement').textContent = `Slide ${index + 1} of ${slides.length}: ${slide.dataset.title}${hasReveal ? (revealed ? '. Solution revealed.' : '. Problem; advance to reveal the solution.') : ''}`;
    document.querySelector('#notes-title').textContent = slide.dataset.title;
    document.querySelector('#notes-copy').innerHTML = slide.querySelector('.speaker-notes')?.innerHTML || '<p>No notes for this slide.</p>';
    document.querySelector('#next-title').textContent = hasReveal && !revealed ? `Reveal solution: ${slide.querySelector('.case-solution h3')?.textContent || 'the three missing controls'}` : slides[index + 1]?.dataset.title || 'End of deck';
    document.querySelectorAll('#overview-list button').forEach((button, n) => button.setAttribute('aria-current', String(n === index)));
    if (broadcast) channel?.postMessage({ type: 'state', index, revealed });
  }
  function advance() {
    if (slides[index].hasAttribute('data-has-reveal') && !revealed) show(index, true, true);
    else show(index + 1);
  }
  function retreat() {
    if (revealed) show(index);
    else show(index - 1);
  }
  function closeDialogs() {
    for (const dialog of [overview, help]) if (dialog.open) dialog.close();
  }
  function openOverview() {
    closeDialogs();
    overview.showModal();
    overview.querySelector('[aria-current=true]')?.focus();
  }
  async function fullscreen() {
    closeDialogs();
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      document.querySelector('#announcement').textContent = 'Fullscreen is unavailable. Use your browser fullscreen control.';
    }
  }
  function openPresenter() {
    if (presenter) return;
    closeDialogs();
    const url = new URL(location.href);
    url.searchParams.delete('export');
    url.searchParams.set('presenter', '1');
    presenterWindow = window.open(url.href, 'sre-fails-wad-presenter', 'width=1440,height=900');
    if (!presenterWindow) {
      document.querySelector('#announcement').textContent = 'Allow pop-ups for this page to open the presenter window.';
      help.showModal();
    }
  }
  document.querySelector('#previous').addEventListener('click', () => { closeDialogs(); retreat(); });
  document.querySelector('#next').addEventListener('click', () => { closeDialogs(); advance(); });
  document.querySelector('#open-overview').addEventListener('click', openOverview);
  document.querySelector('#open-presenter').addEventListener('click', openPresenter);
  document.querySelector('#open-presenter').hidden = presenter;
  document.querySelector('#fullscreen').addEventListener('click', fullscreen);
  document.querySelector('#print').addEventListener('click', () => window.print());
  for (const dialog of [overview, help]) {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  }
  for (const [n, slide] of slides.entries()) {
    const button = document.createElement('button');
    const number = document.createElement('span');
    number.textContent = `${String(n + 1).padStart(2, '0')} / ${slide.dataset.chapter}`;
    button.append(number, document.createTextNode(slide.dataset.title));
    button.addEventListener('click', () => { overview.close(); show(n); });
    document.querySelector('#overview-list').append(button);
  }
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable=true]')) return;
    if (overview.open || help.open) return;
    if (event.key === 'Escape') { document.body.classList.remove('blank'); return; }
    if (event.target.closest('button,a') && [' ', 'Enter'].includes(event.key)) return;
    if (event.target.closest('.level') && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      const nextLevel = (selectedLevel + (event.key === 'ArrowRight' ? 1 : 3)) % levels.length;
      const button = document.querySelectorAll('.level')[nextLevel];
      button.click();
      button.focus();
      return;
    }
    const key = event.key.toLowerCase();
    if (['arrowright', 'arrowdown', 'pagedown', ' '].includes(key)) { event.preventDefault(); advance(); }
    else if (['arrowleft', 'arrowup', 'pageup'].includes(key)) { event.preventDefault(); retreat(); }
    else if (key === 'home') { event.preventDefault(); show(0); }
    else if (key === 'end') { event.preventDefault(); show(slides.length - 1); }
    else if (key === 'g') openOverview();
    else if (key === 'p') openPresenter();
    else if (key === 'f') fullscreen();
    else if (key === 'b') document.body.classList.toggle('blank');
    else if (key === '?') help.showModal();
  });
  viewport.addEventListener('click', event => {
    if (event.detail > 1 || event.target.closest('button,a,input,select,textarea') || window.getSelection()?.toString()) return;
    advance();
  });
  viewport.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button,a')) { touchStart = null; return; }
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  viewport.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) advance();
      else retreat();
    }
    touchStart = null;
  }, { passive: true });
  const levels = [
    ['Inspect the failing service.', 'Read scoped telemetry and the service catalog. Record evidence; no production writes.', 'Read-only credentials. An append-only action record.'],
    ['Propose a bounded change.', 'Show the target, evidence, expected outcome, and rollback. A person executes the change.', 'A reviewable plan. No execution credential.'],
    ['Execute one approved action.', 'A person approves the exact target, parameters, and expiry. Changed plans require fresh approval.', 'Approval bound to a specific operation; short-lived credentials.'],
    ['Act inside a tested envelope.', 'Allow known, reversible actions within a small blast radius. Stop on failed verification or repeated attempts.', 'Independent verification, a retry budget, and a human-operated kill switch.']
  ];
  document.querySelectorAll('.level').forEach((button, n) => button.addEventListener('click', () => {
    selectedLevel = n;
    document.querySelectorAll('.level').forEach((b, i) => b.setAttribute('aria-pressed', String(i === n)));
    document.querySelector('#level-title').textContent = levels[n][0];
    document.querySelector('#level-copy').textContent = levels[n][1];
    document.querySelector('#level-boundary').textContent = levels[n][2];
    channel?.postMessage({ type: 'level', level: n });
  }));
  channel?.addEventListener('message', event => {
    const message = event.data;
    if (message?.type === 'state' && Number.isInteger(message.index) && message.index >= 0 && message.index < slides.length && typeof message.revealed === 'boolean') show(message.index, false, message.revealed);
    if (message?.type === 'request' && !presenter) {
      channel.postMessage({ type: 'state', index, revealed });
      channel.postMessage({ type: 'level', level: selectedLevel });
    }
    if (message?.type === 'level' && Number.isInteger(message.level) && levels[message.level]) {
      const n = message.level;
      selectedLevel = n;
      document.querySelectorAll('.level').forEach((b, i) => b.setAttribute('aria-pressed', String(i === n)));
      document.querySelector('#level-title').textContent = levels[n][0];
      document.querySelector('#level-copy').textContent = levels[n][1];
      document.querySelector('#level-boundary').textContent = levels[n][2];
    }
  });
  const timerToggle = document.querySelector('#timer-toggle');
  timerToggle.addEventListener('click', () => {
    if (startedAt === null) startedAt = Date.now();
    else { elapsed += Date.now() - startedAt; startedAt = null; }
    timerToggle.textContent = startedAt === null ? 'Start' : 'Pause';
  });
  document.querySelector('#timer-reset').addEventListener('click', () => { elapsed = 0; startedAt = null; timerToggle.textContent = 'Start'; });
  if (presenter) setInterval(() => {
    const seconds = Math.floor((elapsed + (startedAt === null ? 0 : Date.now() - startedAt)) / 1000);
    document.querySelector('#timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }, 250);
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => show(fromHash()));
  window.addEventListener('beforeprint', closeDialogs);
  show(fromHash(), false);
  fit();
  if (presenter) channel?.postMessage({ type: 'request' });
})();
