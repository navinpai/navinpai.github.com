(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const walkthroughIndex = slides.findIndex(slide => slide.classList.contains('walkthrough-slide'));
  const mainCount = slides.filter(slide => !slide.dataset.appendix).length;
  const params = new URLSearchParams(location.search);
  const notes = document.querySelector('#notes-panel');
  const overview = document.querySelector('#overview-panel');
  const help = document.querySelector('#help-panel');
  const dialogs = [notes, overview, help];
  const details = ['failure', 'cause', 'retry'];
  let current = 0;
  let detail = 0;
  let appendixReturn = mainCount - 1;
  let controlTimeout;
  document.body.classList.toggle('export', params.has('export'));
  document.body.classList.toggle('include-appendix', params.has('appendix'));

  function resize() {
    document.documentElement.style.setProperty('--scale', Math.min(innerWidth / 1366, innerHeight / 768));
  }
  function flashControls() {
    document.body.classList.add('show-controls');
    clearTimeout(controlTimeout);
    controlTimeout = setTimeout(() => document.body.classList.remove('show-controls'), 2200);
  }
  function updateNotes() {
    const slide = slides[current];
    document.querySelector('#notes-heading').textContent = slide.dataset.title;
    document.querySelector('#notes-time').textContent = slide.dataset.time;
    document.querySelector('#notes-content').innerHTML = slide.querySelector('.speaker-notes').innerHTML;
    document.querySelector('#notes-content').querySelectorAll('a').forEach(link => {
      link.target = '_blank';
      link.rel = 'noopener';
    });
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
    const label = current < mainCount ? `${current + 1} / ${mainCount}` : `${String.fromCharCode(65 + current - mainCount)} / C`;
    document.querySelector('#slide-counter').textContent = label;
    document.querySelector('#progress i').style.width = `${Math.min(current + 1, mainCount) / mainCount * 100}%`;
    document.querySelector('#announcer').textContent = `Slide ${label}: ${slides[current].dataset.title}`;
    document.title = `${slides[current].dataset.title} · Navin Pai`;
    if (updateHash && location.hash !== `#${slides[current].id}`) history.replaceState(null, '', `${location.pathname}${location.search}#${slides[current].id}`);
    updateNotes();
    document.querySelectorAll('#overview-grid button').forEach((button, i) => button.classList.toggle('current', i === current));
  }
  function fromHash() {
    const id = location.hash.slice(1).replace(/^step-/, 'slide-');
    const index = slides.findIndex(slide => slide.id === id);
    showSlide(index < 0 ? 0 : index, false);
  }
  function setDetail(index) {
    detail = Math.max(0, Math.min(details.length - 1, index));
    document.querySelectorAll('[data-detail]').forEach(button => {
      const selected = button.dataset.detail === details[detail];
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-panel]').forEach(panel => panel.hidden = panel.dataset.panel !== details[detail]);
  }
  function next() {
    if (current === walkthroughIndex && detail < 2) return setDetail(detail + 1);
    // Q&A is the end of the main talk. The appendix is reached with B or overview.
    if (current === mainCount - 1) return;
    showSlide(current + 1);
  }
  function previous() {
    if (current === walkthroughIndex && detail > 0) return setDetail(detail - 1);
    showSlide(current - 1);
  }
  function toggleDialog(dialog) {
    if (dialog.open) return dialog.close();
    dialogs.forEach(other => { if (other.open) other.close(); });
    dialog.showModal();
  }
  function toggleAppendix() {
    if (current >= mainCount) return showSlide(appendixReturn);
    appendixReturn = current;
    showSlide(mainCount);
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      document.querySelector('#announcer').textContent = 'Fullscreen is unavailable in this browser. Use the browser’s fullscreen command.';
    }
  }

  slides.forEach((slide, i) => {
    const button = document.createElement('button');
    const number = i < mainCount ? String(i + 1).padStart(2, '0') : `APPENDIX ${String.fromCharCode(65 + i - mainCount)}`;
    const n = document.createElement('span'); n.textContent = number;
    const title = document.createElement('strong'); title.textContent = slide.dataset.title.replace('Appendix · ', '');
    const time = document.createElement('small'); time.textContent = slide.dataset.time;
    button.append(n, title, time);
    button.addEventListener('click', () => { showSlide(i); overview.close(); });
    document.querySelector('#overview-grid').append(button);
  });
  document.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => setDetail(details.indexOf(button.dataset.detail))));
  document.querySelector('#previous').addEventListener('click', previous);
  document.querySelector('#next').addEventListener('click', next);
  document.querySelector('#slide-counter').addEventListener('click', () => toggleDialog(overview));
  document.querySelector('#notes-toggle').addEventListener('click', () => toggleDialog(notes));
  document.querySelector('#help-toggle').addEventListener('click', () => toggleDialog(help));
  document.querySelector('#fullscreen').addEventListener('click', fullscreen);
  document.querySelector('#notes-prev').addEventListener('click', () => showSlide(current - 1));
  document.querySelector('#notes-next').addEventListener('click', () => showSlide(current === mainCount - 1 ? current : current + 1));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  dialogs.forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog && !event.composedPath().some(element => element !== dialog && element instanceof HTMLElement && dialog.contains(element))) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }}));
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    const openDialog = dialogs.find(dialog => dialog.open);
    const key = event.key.toLowerCase();
    if (openDialog) {
      if (key === 'n' && openDialog === notes) { notes.close(); event.preventDefault(); }
      if (key === 'o' && openDialog === overview) { overview.close(); event.preventDefault(); }
      if (key === '?' && openDialog === help) { help.close(); event.preventDefault(); }
      return;
    }
    // Preserve the native space/enter behavior of focused controls and links.
    if ((key === ' ' || key === 'enter') && event.target.closest('button,a')) return;
    const handlers = {
      arrowright: next, pagedown: next, ' ': next,
      arrowleft: previous, pageup: previous,
      home: () => showSlide(0), end: () => showSlide(mainCount - 1),
      n: () => toggleDialog(notes), o: () => toggleDialog(overview),
      b: toggleAppendix, f: fullscreen, '?': () => toggleDialog(help)
    };
    if (handlers[key]) { event.preventDefault(); handlers[key](); flashControls(); }
  });
  let touchStart;
  document.querySelector('#deck').addEventListener('touchstart', event => {
    if (event.touches.length === 1 && !event.target.closest('button,a')) touchStart = {x:event.touches[0].clientX,y:event.touches[0].clientY};
    else touchStart = null;
  }, {passive:true});
  document.querySelector('#deck').addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) dx < 0 ? next() : previous();
    touchStart = null;
  }, {passive:true});
  addEventListener('mousemove', flashControls, {passive:true});
  addEventListener('resize', resize);
  addEventListener('hashchange', fromHash);
  resize(); fromHash(); setDetail(0); flashControls();
})();
