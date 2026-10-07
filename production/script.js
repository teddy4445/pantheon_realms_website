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
    img.alt = item.querySelector('small').textContent + ' — actual development-build screenshot';
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
  $('.town-image').addEventListener('click', () => openGallery(1));
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
  const card = $('.download-card');
  const top = $('.download-card-top');
  top.querySelector('h3').textContent = primary ? 'Play on ' + primary.platform : 'Downloads';
  top.querySelector('p').textContent = [config.channel || 'Development build', config.version].filter(Boolean).join(' ');
  card.querySelectorAll('.release, [role="status"]').forEach(node => node.remove());
  const releaseArea = el('div');
  if (!releases.length) {
    const message = el('p', '', 'The download link will be available here when published.');
    message.setAttribute('role', 'status'); releaseArea.append(message);
  }
  releases.forEach(d => {
    const row = el('div', 'release');
    const link = el('a', 'button primary', 'Download for ' + d.platform + ' ↓');
    link.href = d.url;
    if (d.filename) link.download = d.filename;
    row.append(link);
    const bits = [d.arch, Number(d.bytes) > 0 ? Math.round(d.bytes / 1000000) + ' MB' : '', config.buildDate ? 'Build ' + config.buildDate : ''].filter(Boolean);
    row.append(el('p', 'release-meta', bits.join(' · ')));
    if (/^[a-f\d]{64}$/i.test(d.sha256 || '')) {
      const details = el('details');
      details.append(el('summary', '', 'Verify your download'), el('p', '', 'SHA-256'), el('code', '', d.sha256)); row.append(details);
    }
    releaseArea.append(row);
  });
  top.after(releaseArea);
  const heroDownload = $('.hero-actions .button');
  if (primary) { heroDownload.href = primary.url; heroDownload.textContent = 'Download current build ↗'; if (primary.filename) heroDownload.download = primary.filename; }
  const note = $('.build-note');
  note.replaceChildren(el('span', 'status-dot'), document.createTextNode('Windows x64 · Development build ' + (config.version || '')));
  if (safeUrl(config.browserUrl)) { const link = el('a', 'text-link', 'Play in browser ↗'); link.href = config.browserUrl; card.append(link); }
  if (safeUrl(config.trailerUrl)) {
    const figure = el('figure', 'trailer'); const video = el('video');
    video.controls = true; video.preload = 'none'; video.poster = './images/greek-1280.webp'; video.src = config.trailerUrl; video.setAttribute('aria-label', 'Pantheon Realms trailer');
    figure.append(video, el('figcaption', '', 'Official trailer')); $('.gallery').before(figure);
  }
  (Array.isArray(config.communityLinks) ? config.communityLinks : []).filter(l => safeUrl(l.url)).forEach(l => {
    const link = el('a', '', l.label); link.href = l.url; $('.footer nav').append(link);
  });
  if (typeof config.siteUrl === 'string' && /^https:\/\//.test(config.siteUrl) && safeUrl(config.siteUrl)) {
    const canonical = el('link'); canonical.rel = 'canonical'; canonical.href = config.siteUrl; document.head.append(canonical);
  }
})();
