import React, { useState, useEffect } from 'react';
import LifeOSDashboard from './life_os_dashboard';
import FitnessSection, { DEFAULT_FITNESS }  from './life_os_fitness';
import HogarSection,   { DEFAULT_HOGAR }    from './life_os_hogar';
import TrabajoSection, { DEFAULT_TRABAJO }  from './life_os_trabajo';
import PersonalSection,{ DEFAULT_PERSONAL } from './life_os_personal';

const STORAGE_KEY = 'lifeos_state_v5'; // ← versión nueva para forzar migración limpia
const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

// ─── Hábitos correctos (versión definitiva) ────────────────────
const CORRECT_HABITS = {
  morning: [
    { id: 'hm1', label: 'Café',          doneDate: null },
    { id: 'hm2', label: 'Trabajo',       doneDate: null },
    { id: 'hm3', label: 'Skincare',      doneDate: null },
    { id: 'hm4', label: 'Gym',           doneDate: null },
    { id: 'hm5', label: 'Lectura',       doneDate: null },
    { id: 'hm6', label: 'Hacer la cama', doneDate: null },
  ],
  night: [
    { id: 'hn1', label: 'Agenda',           doneDate: null },
    { id: 'hn2', label: 'Notion',           doneDate: null },
    { id: 'hn3', label: 'Day One',          doneDate: null },
    { id: 'hn4', label: 'Dientes',          doneDate: null },
    { id: 'hn5', label: 'Skincare',         doneDate: null },
    { id: 'hn6', label: 'Trenza',           doneDate: null },
    { id: 'hn7', label: 'Ropa para mañana', doneDate: null },
  ],
};

// ─── Lectura: dos libros (Kindle + papel) ─────────────────────
const DEFAULT_READING = {
  kindle: { title: '', author: '', currentPage: 0, totalPages: 0 },
  paper:  { title: '', author: '', currentPage: 0, totalPages: 0 },
};

const syncInspirationFromGallery = (state) => {
  const currentMonth = new Date().getMonth();
  const imgs = state.personal?.gallery?.[currentMonth] || [];
  if (imgs.length === 0) return state;
  const dayIdx = (new Date().getDate() - 1) % imgs.length;
  return { ...state, inspirationImage: imgs[dayIdx] };
};

// Migra la estructura de lectura antigua (objeto simple) al nuevo formato (kindle+paper)
const migrateReading = (reading) => {
  if (!reading) return DEFAULT_READING;
  // Ya tiene el nuevo formato
  if (reading.kindle !== undefined) return reading;
  // Tiene el formato viejo — lo pasa a kindle
  return {
    kindle: {
      title: reading.title || '',
      author: reading.author || '',
      currentPage: reading.currentPage || 0,
      totalPages: reading.totalPages || 0,
    },
    paper: { title: '', author: '', currentPage: 0, totalPages: 0 },
  };
};

const DEFAULT_STATE = {
  themeId: 'rose',
  lastOpenedDate: todayKey(),
  tasks: [],
  habits: CORRECT_HABITS,
  agenda: { today: [] },
  menu: { desayuno: '', snack: '', almuerzo: '', cena: '' },
  reading: DEFAULT_READING,
  notes: '',
  body: { weight: [] },
  cycleLog:         {},
  moodHistory:      {},
  inspirationImage: null,
  fitness:  DEFAULT_FITNESS,
  hogar:    DEFAULT_HOGAR,
  trabajo:  DEFAULT_TRABAJO,
  personal: DEFAULT_PERSONAL,
};

// Carga desde v4 (versión anterior) si v5 no existe aún
const loadState = () => {
  try {
    // Intentar cargar v5 primero
    const rawV5 = localStorage.getItem(STORAGE_KEY);
    if (rawV5) {
      const parsed = JSON.parse(rawV5);
      const merged = {
        ...DEFAULT_STATE,
        ...parsed,
        habits:   CORRECT_HABITS, // siempre forzar hábitos correctos
        reading:  migrateReading(parsed.reading),
        fitness:  { ...DEFAULT_FITNESS,  ...(parsed.fitness  || {}) },
        hogar:    { ...DEFAULT_HOGAR,    ...(parsed.hogar    || {}) },
        trabajo:  { ...DEFAULT_TRABAJO,  ...(parsed.trabajo  || {}) },
        personal: { ...DEFAULT_PERSONAL, ...(parsed.personal || {}) },
      };
      return syncInspirationFromGallery(merged);
    }

    // Migrar desde v4
    const rawV4 = localStorage.getItem('lifeos_state_v4');
    if (rawV4) {
      const parsed = JSON.parse(rawV4);
      const merged = {
        ...DEFAULT_STATE,
        ...parsed,
        habits:   CORRECT_HABITS, // migrar hábitos
        reading:  migrateReading(parsed.reading),
        fitness:  { ...DEFAULT_FITNESS,  ...(parsed.fitness  || {}) },
        hogar:    { ...DEFAULT_HOGAR,    ...(parsed.hogar    || {}) },
        trabajo:  { ...DEFAULT_TRABAJO,  ...(parsed.trabajo  || {}) },
        personal: { ...DEFAULT_PERSONAL, ...(parsed.personal || {}) },
      };
      return syncInspirationFromGallery(merged);
    }

    return DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
};

const saveState = s => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
};

const applyDailyRollover = state => {
  const today = todayKey();
  if (state.lastOpenedDate === today) return state;
  const yesterday   = todayKey(new Date(Date.now() - 86400000));
  const prevDay     = state.cycleLog?.[yesterday];
  const newCycleLog = { ...(state.cycleLog || {}) };
  if (prevDay !== undefined) newCycleLog[today] = prevDay + 1;
  const rolled = {
    ...state,
    lastOpenedDate: today,
    cycleLog: newCycleLog,
    tasks: state.tasks.filter(t => !t.done),
    // Rollover hábitos: resetear doneDate pero mantener los labels correctos
    habits: {
      morning: CORRECT_HABITS.morning.map(h => ({ ...h, doneDate: null })),
      night:   CORRECT_HABITS.night.map(h   => ({ ...h, doneDate: null })),
    },
    // Limpiar agenda del día anterior
    agenda: { today: [] },
  };
  return syncInspirationFromGallery(rolled);
};

const SECTION_COLORS = {
  dashboard: null,
  fitness:   '#D9A892',
  hogar:     '#BFAE93',
  trabajo:   '#8FA89E',
  personal:  '#C9A0A0',
};

const THEMES = [
  { id: 'rose',      accent: '#C9A0A0' },
  { id: 'nude',      accent: '#D4B8A8' },
  { id: 'peach',     accent: '#D9A892' },
  { id: 'terracota', accent: '#B88A75' },
  { id: 'topo',      accent: '#A89B8C' },
  { id: 'beige',     accent: '#BFAE93' },
  { id: 'moka',      accent: '#9C8472' },
  { id: 'salvia',    accent: '#9DAE99' },
  { id: 'eucalipto', accent: '#8FA89E' },
  { id: 'oliva',     accent: '#A0A287' },
  { id: 'niebla',    accent: '#9FB1B8' },
  { id: 'humo',      accent: '#8A9BAA' },
  { id: 'grisazul',  accent: '#9AA8B5' },
  { id: 'lavanda',   accent: '#A89DB3' },
  { id: 'ciruela',   accent: '#A88A98' },
];

const SidebarIcon = ({ name, size = 18 }) => {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':      return <svg {...c}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/></svg>;
    case 'fitness':   return <svg {...c}><path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M7 17l-5 5M17 7l5-5"/></svg>;
    case 'house':     return <svg {...c}><path d="M4 21V10l8-6 8 6v11"/><path d="M9 21v-6h6v6"/></svg>;
    case 'briefcase': return <svg {...c}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
    case 'person':    return <svg {...c}><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>;
    default: return null;
  }
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&family=Inter:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { margin: 0; padding: 0; height: 100vh; width: 100vw; overflow: hidden; }
  .app-root {
    display: grid; grid-template-columns: 66px 1fr;
    height: 100vh; width: 100vw; overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .app-sidebar {
    background: rgba(255,255,255,.65); backdrop-filter: blur(12px);
    border-right: 1px solid #ECE6DC;
    display: flex; flex-direction: column; align-items: center;
    padding: 16px 0; gap: 4px; z-index: 10;
  }
  .app-sb-btn {
    width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
    border: none; background: transparent; color: #6B6661;
    border-radius: 12px; cursor: pointer; transition: background .25s, color .25s, box-shadow .25s;
  }
  .app-sb-btn:hover  { background: #F0EBE3; color: #2C2A26; }
  .app-sb-btn.active { color: white; box-shadow: 0 6px 18px -8px rgba(0,0,0,.2); }
  .app-sb-spacer { flex: 1; }
  .app-content { min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
`;

export default function LifeOSApp() {
  const [state, setState]     = useState(() => applyDailyRollover(loadState()));
  const [section, setSection] = useState('dashboard');

  useEffect(() => { saveState(state); }, [state]);

  const theme = THEMES.find(t => t.id === state.themeId) || THEMES[0];

  return (
    <>
      <style>{css}</style>
      <div className="app-root">
        <aside className="app-sidebar">
          <div style={{ height: 4 }} />
          {[
            ['dashboard', 'home'],
            ['fitness',   'fitness'],
            ['hogar',     'house'],
            ['trabajo',   'briefcase'],
            ['personal',  'person'],
          ].map(([id, icon]) => {
            const isActive = section === id;
            const color    = SECTION_COLORS[id] || theme.accent;
            return (
              <button key={id}
                className={`app-sb-btn${isActive ? ' active' : ''}`}
                style={isActive ? { background: color, boxShadow: `0 6px 18px -8px ${color}cc` } : {}}
                onClick={() => setSection(id)}
                aria-label={id}>
                <SidebarIcon name={icon} size={18} />
              </button>
            );
          })}
          <div className="app-sb-spacer" />
        </aside>

        <div className="app-content">
          {section === 'dashboard' && <LifeOSDashboard state={state} setState={setState} />}
          {section === 'fitness'   && <FitnessSection  state={state} setState={setState} />}
          {section === 'hogar'     && <HogarSection     state={state} setState={setState} />}
          {section === 'trabajo'   && <TrabajoSection   state={state} setState={setState} />}
          {section === 'personal'  && <PersonalSection  state={state} setState={setState} />}
        </div>
      </div>
    </>
  );
}


