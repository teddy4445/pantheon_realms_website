/* Pantheon Realms — vanilla JavaScript. No imports, libraries, or build step. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const menu = $('.menu-toggle');
  const nav = $('#main-nav');
  function setMenu(open) {
    menu.setAttribute('aria-expanded', String(open));
    menu.innerHTML = open ? 'Close <span aria-hidden="true">×</span>' : 'Menu <span aria-hidden="true">☰</span>';
    nav.classList.toggle('open', open);
  }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
  });

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectFaction(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    $('#pantheon-panel').replaceWith($('#faction-' + index).content.firstElementChild.cloneNode(true));
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectFaction(i));
    tab.addEventListener('keydown', e => {
      const targets = {ArrowRight:(i + 1) % tabs.length, ArrowLeft:(i + tabs.length - 1) % tabs.length, Home:0, End:tabs.length - 1};
      if (e.key in targets) { e.preventDefault(); selectFaction(targets[e.key], true); }
    });
  });

  const dialog = $('.lightbox');
  const gallery = [...document.querySelectorAll('.gallery-item')];
  let current = 0;
  let opener;
  function showFrame(index) {
    current = (index + gallery.length) % gallery.length;
    const item = gallery[current];
    const img = dialog.querySelector('img');
    img.src = item.querySelector('img').src;
    img.alt = item.querySelector('img').alt;
    const caption = dialog.querySelector('[aria-live]');
    caption.replaceChildren(document.createTextNode(item.querySelector('strong').textContent));
    const number = document.createElement('span');
    number.textContent = `${current + 1} / ${gallery.length}`;
    caption.append(number);
  }
  function openGallery(index) {
    opener = document.activeElement;
    dialog.innerHTML = '<div class="lightbox-content"><button class="lightbox-close" aria-label="Close gallery">×</button><img alt=""><div class="lightbox-controls"><button aria-label="Previous screenshot">←</button><p aria-live="polite"></p><button aria-label="Next screenshot">→</button></div></div>';
    showFrame(index);
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('[aria-label="Previous screenshot"]').addEventListener('click', () => showFrame(current - 1));
    dialog.querySelector('[aria-label="Next screenshot"]').addEventListener('click', () => showFrame(current + 1));
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }
  gallery.forEach((item, i) => item.addEventListener('click', () => openGallery(i)));
  $('.town-image')?.addEventListener('click', () => openGallery(0));
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; opener?.focus(); });
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); showFrame(current + (e.key === 'ArrowRight' ? 1 : -1)); }
  });

  // Config uses a normal script so this page also works when index.html is opened directly.
  const config = window.SITE_CONFIG || {};
  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return false;
    if (/^https:\/\//i.test(value)) {
      try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
    }
    return /^(?:\.\/)?(?:[\w-]+\/)+[\w.%-]+$/.test(value) && !value.includes('..') && !/%(?:2e|2f|5c)/i.test(value);
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  const releases = (Array.isArray(config.downloads) ? config.downloads : []).filter(d => d.enabled && safeUrl(d.url));
  const primary = releases.find(d => d.platform === 'Windows') || releases[0];
  const card = $('.download-action');
  const download = $('#legend-download');
  const heroDownload = $('.hero-actions .button');
  heroDownload.textContent = 'Download';
  for(const button of [download,heroDownload]) {
   if(primary){
    button.href=primary.url;
    button.removeAttribute('aria-disabled');button.removeAttribute('role');button.removeAttribute('tabindex');
    button.setAttribute('aria-label','Download Pantheon Realms for '+primary.platform+' (opens download page)');
    // Hosted file viewers must open normally: the download attribute is only for same-origin files.
    button.removeAttribute('download');
    if(new URL(primary.url,location.href).origin!==location.origin){button.target='_blank';button.rel='noopener noreferrer';}
    else {button.removeAttribute('target');button.removeAttribute('rel');if(primary.filename)button.download=primary.filename;}
   }
   else {
    button.removeAttribute('href');button.setAttribute('role','button');button.tabIndex=0;button.setAttribute('aria-disabled','true');button.setAttribute('aria-label','Download Pantheon Realms — link coming soon');
    const unavailable=e=>{e.preventDefault();$('#download-button-detail').textContent='Download link coming soon';$('#download-feedback').textContent='The download link has not been published yet.';};
    button.addEventListener('click',unavailable);
    button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){unavailable(e);}});
   }
  }
  const note = $('.build-note');
  note.replaceChildren(el('span', 'status-dot'), document.createTextNode(`Version ${config.version || '1.0.0'} · Windows x64 · Play offline`));
  if(primary){
    const size=Number.isFinite(primary.bytes)?`${Math.round(primary.bytes/1000000)} MB`:'Download';
    $('#download-button-detail').textContent=`v${config.version} · Windows x64 · ${size}`;
    $('#release-version').textContent=`Version ${config.version} · ${config.channel} · Built ${config.buildDate}`;
    $('#release-file').textContent=primary.filename;
    $('#release-checksum').textContent=primary.sha256;
  }
  if (safeUrl(config.browserUrl)) { const link = el('a', 'text-link', 'Play in browser ↗'); link.href = config.browserUrl; card.append(link); }
  if (safeUrl(config.trailerUrl)) {
    const figure = el('figure', 'trailer'); const video = el('video');
    video.controls = true; video.preload = 'none'; video.poster = './images/new/hero-six-realms.png'; video.src = config.trailerUrl; video.setAttribute('aria-label', 'Pantheon Realms trailer');
    figure.append(video, el('figcaption', '', 'Official trailer')); $('.gallery').before(figure);
  }
  (Array.isArray(config.communityLinks) ? config.communityLinks : []).filter(l => safeUrl(l.url)).forEach(l => {
    const link = el('a', '', l.label); link.href = l.url; $('.footer nav').append(link);
  });
  if (typeof config.siteUrl === 'string' && /^https:\/\//.test(config.siteUrl) && safeUrl(config.siteUrl)) {
    const canonical = el('link'); canonical.rel = 'canonical'; canonical.href = config.siteUrl; document.head.append(canonical);
  }
})();
