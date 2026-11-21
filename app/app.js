// Leonida Legend — GTA VI trophy guide & tracker.
// One page, two views (checklist and roadmap). All state lives in localStorage on this
// machine; the app fetches only its own data file and works with the network off.
// Progress shape: { earned: [trophy ids], counts: { id: number }, spoilers: bool }.
// Deep links for readers (and for the maker's screenshots): ?view=roadmap opens the
// roadmap, ?filter=missable picks a filter, ?open=<id> expands one guide,
// ?spoilers=off turns spoiler protection off, ?demo=1 loads a sample progress state.

import { ROADMAP } from './roadmap.js';

const STORAGE_KEY = 'leonida-legend-tracker-v1';
const SOURCE_LINKS = [
  ['Exophase — Grand Theft Auto VI trophies (PS5)', 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/'],
  ['Boosting Factory — GTA 6 trophy guide and roadmap', 'https://www.boostingfactory.com/gta-6/blog/gta-6-trophy-guide'],
];
const KIND_FILTERS = [
  ['all', 'All'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectibles', 'Collectibles'],
  ['activities', 'Activities'],
  ['online', 'Online'],
  ['misc', 'Everything else'],
];
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

function blankState() {
  return { earned: [], counts: {}, spoilers: true };
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    return { earned: parsed.earned ?? [], counts: parsed.counts ?? {}, spoilers: parsed.spoilers !== false };
  } catch {
    return blankState();
  }
}
function demoState() {
  // A believable mid-run save: the story is finished, the Chapter 1 meditation was caught,
  // and the counters are under way. Used by ?demo=1 so readers (and screenshots) can see
  // the tracker as it looks in use; it is never loaded unless asked for.
  return {
    earned: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 20, 21, 22, 25, 28, 33],
    counts: { 15: 132, 17: 19, 18: 9, 19: 14, 28: 18, 31: 47, 32: 28, 35: 64, 42: 31, 48: 210, 52: 90000, 53: 62000 },
    spoilers: true,
  };
}
if (params.has('demo')) localStorage.setItem(STORAGE_KEY, JSON.stringify(demoState()));
let state = loadState();
if (params.get('spoilers') === 'off') state.spoilers = false;
let earned = new Set(state.earned.filter((id) => byId.has(id)));
let openGuideId = Number(params.get('open')) || null;
let activeKind = params.get('filter') || 'all';
let activeView = params.get('view') === 'roadmap' ? 'roadmap' : 'checklist';

const els = {
  list: document.getElementById('trophy-list'),
  note: document.getElementById('list-note'),
  search: document.getElementById('search'),
  grade: document.getElementById('grade-filter'),
  spoilers: document.getElementById('spoiler-toggle'),
  kindChips: document.getElementById('kind-chips'),
  count: document.getElementById('progress-count'),
  pct: document.getElementById('progress-pct'),
  fill: document.getElementById('progress-fill'),
  gradeChips: document.getElementById('grade-chips'),
  roadmap: document.getElementById('roadmap-list'),
  viewChecklist: document.getElementById('view-checklist'),
  viewRoadmap: document.getElementById('view-roadmap'),
  tabChecklist: document.getElementById('tab-checklist'),
  tabRoadmap: document.getElementById('tab-roadmap'),
};

function save() {
  state = { earned: [...earned], counts: state.counts, spoilers: state.spoilers };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function isMasked(t) {
  return t.hidden && state.spoilers && !earned.has(t.id);
}
function kindMatches(t) {
  if (activeKind === 'all') return true;
  if (activeKind === 'missable') return t.missable;
  return t.kind === activeKind;
}
function visibleTrophies() {
  const q = els.search.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (!kindMatches(t)) return false;
    if (els.grade.value !== 'all' && t.grade !== els.grade.value) return false;
    if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = `badge ${cls ?? ''}`;
  s.textContent = text;
  return s;
}
function renderProgress() {
  const total = trophies.length;
  els.count.textContent = `${earned.size} of ${total} earned`;
  const pct = Math.round((earned.size / total) * 100);
  els.pct.textContent = `${pct}%`;
  els.fill.style.width = `${pct}%`;
  els.gradeChips.replaceChildren(
    ...GRADE_ORDER.map((g) => {
      const all = trophies.filter((t) => t.grade === g);
      const got = all.filter((t) => earned.has(t.id)).length;
      const chip = document.createElement('span');
      chip.className = 'grade-chip';
      chip.innerHTML = '';
      chip.textContent = `${g}: `;
      const b = document.createElement('b');
      b.textContent = `${got}/${all.length}`;
      chip.append(b);
      return chip;
    }),
  );
}
function renderKindChips() {
  els.kindChips.replaceChildren(
    ...KIND_FILTERS.map(([value, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `chip${value === 'missable' ? ' missable-chip' : ''}${activeKind === value ? ' active' : ''}`;
      b.textContent = value === 'missable' ? `⚠ ${label}` : label;
      b.addEventListener('click', () => {
        activeKind = value;
        renderChecklist();
      });
      return b;
    }),
  );
}
function guideBody(t) {
  const body = document.createElement('div');
  body.className = 'guide-body';
  if (isMasked(t)) {
    const p = document.createElement('p');
    p.textContent = 'Guide hidden by spoiler protection until this trophy is earned. Turn spoiler protection off in the toolbar to read it now.';
    body.append(p);
    return body;
  }
  const p = document.createElement('p');
  p.textContent = t.guide;
  body.append(p);
  if (t.target) {
    const row = document.createElement('div');
    row.className = 'counter-row';
    const label = document.createElement('span');
    label.textContent = `Your count (PlayStation tracks ${t.target.toLocaleString('en-US')}):`;
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(t.target);
    input.value = String(state.counts[t.id] ?? 0);
    input.setAttribute('aria-label', `Your count for ${t.name}`);
    input.addEventListener('change', () => {
      const n = Math.max(0, Math.min(t.target, Number(input.value) || 0));
      state.counts[t.id] = n;
      if (n >= t.target) earned.add(t.id);
      save();
      renderAll();
    });
    row.append(label, input);
    body.append(row);
  }
  const meta = document.createElement('p');
  meta.className = 'guide-meta';
  const stage = ROADMAP.find((s) => s.stage === t.stage);
  meta.append(`Roadmap stage ${t.stage}: ${stage ? stage.title : ''}. Sources: ${t.sources} `);
  for (const [label, href] of SOURCE_LINKS) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    a.rel = 'noopener';
    meta.append(a, document.createTextNode(' · '));
  }
  meta.lastChild?.remove();
  body.append(meta);
  return body;
}
function trophyCard(t) {
  const card = document.createElement('article');
  card.className = `trophy-card${earned.has(t.id) ? ' earned' : ''}`;
  card.id = `trophy-${t.id}`;
  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    renderAll();
  });
  const main = document.createElement('div');
  main.className = 'trophy-main';
  const name = document.createElement('div');
  name.className = 'trophy-name';
  if (isMasked(t)) {
    const m = document.createElement('span');
    m.className = 'masked';
    m.textContent = 'Hidden trophy';
    name.append(m);
  } else {
    name.textContent = t.name;
  }
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = isMasked(t) ? 'Secret on PlayStation until earned. Spoiler protection is hiding its name and description.' : t.description;
  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(badge(t.grade, `grade-${t.grade}`), badge(t.kind === 'misc' ? 'everything else' : t.kind));
  if (t.missable) badges.append(badge('⚠ Missable', 'missable'));
  if (t.hidden) badges.append(badge('Hidden', 'hidden-badge'));
  if (t.target) badges.append(badge(`Target ${t.target.toLocaleString('en-US')}`));
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.textContent = openGuideId === t.id ? 'Hide guide ▴' : 'Guide & sources ▾';
  toggle.addEventListener('click', () => {
    openGuideId = openGuideId === t.id ? null : t.id;
    renderChecklist();
  });
  main.append(name, desc, badges, toggle);
  head.append(box, main);
  card.append(head);
  if (openGuideId === t.id) card.append(guideBody(t));
  return card;
}
function renderChecklist() {
  renderKindChips();
  els.spoilers.checked = state.spoilers;
  const visible = visibleTrophies();
  const onlineCount = trophies.filter((t) => t.kind === 'online').length;
  els.note.textContent =
    activeKind === 'online'
      ? 'The official list has no online trophies: all 55 are offline and single-player, so this filter is empty by design.'
      : `Showing ${visible.length} of ${trophies.length} trophies · ${trophies.filter((t) => t.missable).length} flagged missable or time-sensitive · ${trophies.filter((t) => t.hidden).length} hidden on PlayStation · ${onlineCount} online.`;
  els.list.replaceChildren(
    ...(visible.length ? visible.map(trophyCard) : [Object.assign(document.createElement('p'), { className: 'empty-note', textContent: 'No trophies match this filter.' })]),
  );
}
function renderRoadmap() {
  els.roadmap.replaceChildren(
    ...ROADMAP.map((stage) => {
      const card = document.createElement('article');
      card.className = 'stage-card';
      const h = document.createElement('h2');
      const no = document.createElement('span');
      no.className = 'stage-no';
      no.textContent = `Stage ${stage.stage} — `;
      h.append(no, stage.title);
      const hours = document.createElement('div');
      hours.className = 'stage-hours';
      hours.textContent = stage.hours;
      const summary = document.createElement('p');
      summary.className = 'stage-summary';
      summary.textContent = stage.summary;
      card.append(h, hours, summary);
      for (const w of stage.warnings) {
        const warn = document.createElement('p');
        warn.className = 'stage-warning';
        warn.textContent = w;
        card.append(warn);
      }
      const row = document.createElement('div');
      row.className = 'stage-trophies';
      for (const id of stage.trophyIds) {
        const t = byId.get(id);
        if (!t) continue;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `stage-trophy${earned.has(id) ? ' earned' : ''}`;
        chip.textContent = isMasked(t) ? 'Hidden trophy' : t.name;
        if (t.missable) {
          const flag = document.createElement('span');
          flag.className = 'flag';
          flag.textContent = ' ⚠';
          chip.append(flag);
        }
        chip.addEventListener('click', () => {
          openGuideId = id;
          setView('checklist');
          requestAnimationFrame(() => document.getElementById(`trophy-${id}`)?.scrollIntoView({ block: 'center' }));
        });
        row.append(chip);
      }
      card.append(row);
      return card;
    }),
  );
}
function setView(view) {
  activeView = view;
  els.viewChecklist.hidden = view !== 'checklist';
  els.viewRoadmap.hidden = view !== 'roadmap';
  els.tabChecklist.classList.toggle('active', view === 'checklist');
  els.tabRoadmap.classList.toggle('active', view === 'roadmap');
  if (view === 'roadmap') renderRoadmap();
}
function renderAll() {
  renderProgress();
  renderChecklist();
  if (activeView === 'roadmap') renderRoadmap();
}

els.search.addEventListener('input', renderChecklist);
els.grade.addEventListener('change', renderChecklist);
els.spoilers.addEventListener('change', () => {
  state.spoilers = els.spoilers.checked;
  save();
  renderChecklist();
});
els.tabChecklist.addEventListener('click', () => setView('checklist'));
els.tabRoadmap.addEventListener('click', () => setView('roadmap'));
document.getElementById('export-btn').addEventListener('click', () => {
  const payload = JSON.stringify({ app: 'leonida-legend', version: 1, ...state, earned: [...earned] }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = (parsed.earned ?? []).filter((id) => byId.has(id));
    earned = new Set(ids);
    state.counts = parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {};
    state.spoilers = parsed.spoilers !== false;
    save();
    renderAll();
  } catch {
    els.note.textContent = 'That file could not be read as Leonida Legend progress; nothing was changed.';
  }
  e.target.value = '';
});

renderProgress();
renderChecklist();
setView(activeView);
if (openGuideId) document.getElementById(`trophy-${openGuideId}`)?.scrollIntoView({ block: 'center' });
