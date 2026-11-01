/* Accessible searchable combobox — replaces jQuery+Select2 (~150KB dropped). */

import { attachIconFallback } from './fx.js';

export function createCombo(rootEl, { items, value, labelOf, iconOf, tagOf, onChange, searchPlaceholder = '' }) {
  let open = false;
  let cursor = 0;
  let selected = value;
  let query = '';

  const searchId = `${rootEl.id || 'combo'}-search`;
  rootEl.innerHTML = `
    <button type="button" class="combo-trigger" aria-haspopup="listbox" aria-expanded="false">
      <span class="trigger-icon"></span><span class="combo-label"></span><i class="fas fa-chevron-down caret"></i>
    </button>
    <div class="combo-pop">
      <label class="sr-only" for="${searchId}">${searchPlaceholder || 'Search'}</label>
      <input type="text" id="${searchId}" autocomplete="off" placeholder="${searchPlaceholder}">
      <div class="combo-list" role="listbox"></div>
    </div>`;

  const trigger = rootEl.querySelector('.combo-trigger');
  const pop = rootEl.querySelector('.combo-pop');
  const input = rootEl.querySelector('input');
  const list = rootEl.querySelector('.combo-list');

  const visible = () => {
    const q = query.trim().toLowerCase();
    return items.filter(it => {
      if (!q) return true;
      const label = labelOf(it).toLowerCase();
      return label.includes(q) || String(it.id).toLowerCase().includes(q)
        || (it.t && it.t.toLowerCase().includes(q));
    });
  };

  function renderList() {
    const vs = visible();
    cursor = Math.min(cursor, Math.max(vs.length - 1, 0));
    list.innerHTML = '';
    vs.forEach((it, idx) => {
      const opt = document.createElement('div');
      opt.className = 'combo-opt';
      opt.setAttribute('role', 'option');
      opt.setAttribute('aria-selected', String(it.id === selected));
      if (idx === cursor) opt.classList.add('active');
      const label = document.createElement('span');
      label.textContent = labelOf(it);
      opt.append(label);
      if (iconOf) {
        const img = document.createElement('img');
        attachIconFallback(img, labelOf(it));
        img.src = iconOf(it);
        img.alt = '';
        img.loading = 'lazy';
        opt.prepend(img);
      }
      if (tagOf) {
        const tag = document.createElement('span');
        tag.className = 'opt-tag';
        tag.textContent = tagOf(it);
        opt.append(tag);
      }
      opt.addEventListener('click', () => { pick(it.id); close(); });
      list.append(opt);
    });
    if (!vs.length) {
      list.innerHTML = '<div class="combo-opt" style="color:var(--text-3)">—</div>';
    }
    return vs;
  }

  function renderTrigger() {
    const it = items.find(x => x.id === selected) || items[0];
    rootEl.querySelector('.combo-label').textContent = labelOf(it);
    const iconWrap = rootEl.querySelector('.trigger-icon');
    iconWrap.innerHTML = '';
    if (iconOf) {
      const img = document.createElement('img');
      attachIconFallback(img, labelOf(it));
      img.src = iconOf(it);
      img.alt = '';
      iconWrap.append(img);
    }
  }

  function pick(id) {
    selected = id;
    renderTrigger();
    onChange?.(id);
  }

  function openPop() {
    open = true;
    pop.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    query = '';
    input.value = '';
    cursor = Math.max(visible().findIndex(it => it.id === selected), 0);
    renderList();
    list.querySelector('.combo-opt.active')?.scrollIntoView({ block: 'nearest' });
    input.focus();
  }

  function close() {
    open = false;
    pop.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', () => (open ? close() : openPop()));
  input.addEventListener('input', () => { query = input.value; cursor = 0; renderList(); });
  input.addEventListener('keydown', (e) => {
    const vs = visible();
    if (e.key === 'ArrowDown') { cursor = Math.min(cursor + 1, vs.length - 1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { cursor = Math.max(cursor - 1, 0); e.preventDefault(); }
    else if (e.key === 'Enter') { if (vs[cursor]) { pick(vs[cursor].id); close(); } e.preventDefault(); return; }
    else if (e.key === 'Escape') { close(); return; }
    else return;
    renderList();
    vs[cursor]?.scrollIntoView({ block: 'nearest' });
  });
  const onDocClick = (e) => { if (open && !rootEl.contains(e.target)) close(); };
  document.addEventListener('click', onDocClick);

  renderTrigger();
  /* Rebuilding a combo (language switch) would otherwise leave the previous
     instance's document listener and detached DOM tree alive forever. */
  return {
    get value() { return selected; },
    set value(id) { pick(id); },
    destroy() { document.removeEventListener('click', onDocClick); },
  };
}
