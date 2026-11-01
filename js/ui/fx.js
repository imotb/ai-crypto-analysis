/* Micro-interactions: theme, toasts, ripple, staggered reveal. */

/* A missing icons/crypto/<slug>.png otherwise shows the browser's broken-image
   glyph. Swap in a neutral inline SVG monogram instead. */
export function iconFallback(letter = '?') {
  const ch = String(letter || '?').trim().charAt(0).toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">`
    + `<rect width="40" height="40" rx="10" fill="#64748b"/>`
    + `<text x="20" y="27" font-family="sans-serif" font-size="20" font-weight="700" `
    + `text-anchor="middle" fill="#fff">${ch}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function attachIconFallback(img, letter) {
  img.addEventListener('error', () => { img.src = iconFallback(letter); }, { once: true });
}

export function initRipple(root = document) {
  root.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn || btn.disabled) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${e.clientX - rect.left - size / 2}px`;
    span.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(span);
    span.addEventListener('animationend', () => span.remove(), { once: true });
  });
}

export function revealCards(scope = document) {
  scope.querySelectorAll('.reveal:not(.in)').forEach((el, i) => {
    el.style.setProperty('--i', i);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  });
}

export function toast(message, type = 'info', ms = 3500) {
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span></span><button type="button" aria-label="Dismiss">&times;</button>`;
  el.querySelector('span').textContent = message;
  stack.appendChild(el);
  const dismiss = () => {
    el.classList.add('out');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);
  };
  el.querySelector('button').addEventListener('click', dismiss);
  setTimeout(dismiss, ms);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('#themeToggle i');
  if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

export function skeletonLines(n) {
  return Array.from({ length: n }, (_, i) =>
    `<div class="sk sk-text" style="width:${92 - i * 12}%"></div>`).join('');
}

export function skeletonBlock(h = 90) {
  return `<div class="sk sk-box" style="height:${h}px"></div>`;
}
