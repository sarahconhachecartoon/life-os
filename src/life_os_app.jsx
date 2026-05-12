import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './life_os_dashboard';
import Fitness from './life_os_fitness';
import Hogar from './life_os_hogar';
import Trabajo from './life_os_trabajo';
import Personal from './life_os_personal';

// ─── Iconos SVG ────────────────────────────────────────────────────────────────
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconFitness = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h2m12 0h2M6 12v-2a2 2 0 014 0v4a2 2 0 004 0v-4a2 2 0 014 0v2"/>
  </svg>
);
const IconHogar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/>
  </svg>
);
const IconTrabajo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
  </svg>
);
const IconPersonal = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.22-8.78-1.42 1.42M5.64 18.36l-1.42 1.42m14.14 0-1.42-1.42M5.64 5.64 4.22 4.22"/>
  </svg>
);
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

// ─── Temas de color ─────────────────────────────────────────────────────────────
const THEMES = {
  rose:       { name: 'Rose',       accent: '#C9A0A0', light: '#F5EDEC', mid: '#D9B8B8' },
  nude:       { name: 'Nude',       accent: '#C4A882', light: '#F5EFE5', mid: '#D4BE9E' },
  peach:      { name: 'Peach',      accent: '#D9A892', light: '#F8EDE8', mid: '#E8C0AD' },
  terracota:  { name: 'Terracota',  accent: '#B88A75', light: '#F2E8E2', mid: '#CFA898' },
  topo:       { name: 'Topo',       accent: '#A89B8C', light: '#EEE9E4', mid: '#C0B5A8' },
  beige:      { name: 'Beige',      accent: '#BFAE93', light: '#F2EDE3', mid: '#D4C8B0' },
  moka:       { name: 'Moka',       accent: '#9E8572', light: '#EBE3DC', mid: '#B89E8C' },
  salvia:     { name: 'Salvia',     accent: '#8FA888', light: '#E5EDDF', mid: '#AABFA4' },
  eucalipto:  { name: 'Eucalipto',  accent: '#8FA89E', light: '#E2EDEA', mid: '#A8C0BA' },
  oliva:      { name: 'Oliva',      accent: '#8A9878', light: '#E5EAE0', mid: '#A5B294' },
  niebla:     { name: 'Niebla',     accent: '#9FB1B8', light: '#E5EDF0', mid: '#B8C8CE' },
  humo:       { name: 'Humo',       accent: '#9BA8AF', light: '#E6EAEC', mid: '#B4BEC3' },
  grisazul:   { name: 'Gris azul',  accent: '#8A9BAA', light: '#E2E8EE', mid: '#A4B3BF' },
  lavanda:    { name: 'Lavanda',    accent: '#A89DB3', light: '#EDE9F2', mid: '#C0B8CC' },
  ciruela:    { name: 'Ciruela',    accent: '#9A7A9A', light: '#EDE2ED', mid: '#B89AB8' },
};

// ─── Estado inicial ─────────────────────────────────────────────────────────────
const getInitialState = () => ({
  themeId: 'rose',
  lastOpenedDate: '',
  tasks: [],
  habits: {
    morning: [
      { id: 'm1', label: 'Café', doneDate: null },
      { id: 'm2', label: 'Trabajo', doneDate: null },
      { id: 'm3', label: 'Skincare', doneDate: null },
      { id: 'm4', label: 'Gym', doneDate: null },
      { id: 'm5', label: 'Lectura', doneDate: null },
      { id: 'm6', label: 'Hacer la cama', doneDate: null },
    ],
    night: [
      { id: 'n1', label: 'Agenda', doneDate: null },
      { id: 'n2', label: 'Notion', doneDate: null },
      { id: 'n3', label: 'Day One', doneDate: null },
      { id: 'n4', label: 'Dientes', doneDate: null },
      { id: 'n5', label: 'Skincare', doneDate: null },
      { id: 'n6', label: 'Trenza', doneDate: null },
      { id: 'n7', label: 'Ropa para mañana', doneDate: null },
    ],
  },
  agenda: { today: [] },
  menu: { desayuno: '', snack: '', almuerzo: '', cena: '' },
  reading: {
    kindle: { title: '', author: '', currentPage: 0, totalPages: 0 },
    paper:  { title: '', author: '', currentPage: 0, totalPages: 0 },
    audio:  { title: '', author: '', currentPage: 0, totalPages: 0 },
  },
  notes: '',
  body: { weight: [], waist: [], hip: [] },
  cycleLog: {},
  moodHistory: {},
  inspirationImage: null,
  fitness: {
    bodyLog: [],
    foodLibrary: { desayuno: [], snack: [], almuerzo: [], cena: [] },
    weekMenu: {},
    gymLog: {},
    cycleStart: null,
  },
  hogar: {
    rooms: {
      Salón:       [],
      Entrada:     [],
      Cocina:      [],
      Estudio:     [],
      Dormitorio:  [],
      Baño:        [],
    },
    shop: [],
    ideas: '',
    inspImages: [],
  },
  trabajo: {
    budgets: [],
    tasks: [],
    buro: [],
    // NUEVO: proyectos de cómic
    comicProjects: [],
  },
  personal: {
    gallery: {},       // { 'YYYY-MM': [base64, ...] }
    projects: [],      // proyectos ballena
    books: [],
    films: [],
    others: [],
    wishlist: [],
    ideas: '',
    monomanias: [],
    // NUEVO: libros por año
    booksByYear: {},   // { '2026': [{ id, title, favorite }] }
  },
});

// ─── Merge seguro (mantiene datos existentes, añade campos nuevos) ───────────────
const mergeState = (saved) => {
  try {
    if (!saved || typeof saved !== 'object') return getInitialState();

    const defaults = getInitialState();

    // Garantizar que todos los sub-objetos existen antes de hacer spread
    const safePersonal  = (saved.personal  && typeof saved.personal  === 'object') ? saved.personal  : {};
    const safeTrabajo   = (saved.trabajo   && typeof saved.trabajo   === 'object') ? saved.trabajo   : {};
    const safeFitness   = (saved.fitness   && typeof saved.fitness   === 'object') ? saved.fitness   : {};
    const safeHogar     = (saved.hogar     && typeof saved.hogar     === 'object') ? saved.hogar     : {};
    const safeReading   = (saved.reading   && typeof saved.reading   === 'object') ? saved.reading   : {};
    const safeHabits    = (saved.habits    && typeof saved.habits    === 'object') ? saved.habits    : {};
    const safeBody      = (saved.body      && typeof saved.body      === 'object') ? saved.body      : {};

    return {
      ...defaults,
      ...saved,
      // Campos planos con fallback
      themeId:         saved.themeId        ?? defaults.themeId,
      lastOpenedDate:  saved.lastOpenedDate  ?? defaults.lastOpenedDate,
      tasks:           Array.isArray(saved.tasks) ? saved.tasks : [],
      notes:           saved.notes          ?? '',
      cycleLog:        saved.cycleLog        ?? {},
      moodHistory:     saved.moodHistory     ?? {},
      inspirationImage: saved.inspirationImage ?? null,
      menu:            saved.menu            ?? defaults.menu,
      agenda:          saved.agenda          ?? defaults.agenda,
      // Sub-objetos
      habits: {
        morning: Array.isArray(safeHabits.morning) ? safeHabits.morning : defaults.habits.morning,
        night:   Array.isArray(safeHabits.night)   ? safeHabits.night   : defaults.habits.night,
      },
      reading: {
        kindle: { ...defaults.reading.kindle, ...(safeReading.kindle ?? {}) },
        paper:  { ...defaults.reading.paper,  ...(safeReading.paper  ?? {}) },
        audio:  { ...defaults.reading.audio,  ...(safeReading.audio  ?? {}) },
      },
      body: {
        weight: Array.isArray(safeBody.weight) ? safeBody.weight : [],
        waist:  Array.isArray(safeBody.waist)  ? safeBody.waist  : [],
        hip:    Array.isArray(safeBody.hip)    ? safeBody.hip    : [],
      },
      fitness: { ...defaults.fitness, ...safeFitness },
      hogar:   { ...defaults.hogar,   ...safeHogar   },
      trabajo: {
        ...defaults.trabajo,
        ...safeTrabajo,
        budgets:       Array.isArray(safeTrabajo.budgets)       ? safeTrabajo.budgets       : [],
        tasks:         Array.isArray(safeTrabajo.tasks)         ? safeTrabajo.tasks         : [],
        buro:          Array.isArray(safeTrabajo.buro)          ? safeTrabajo.buro          : [],
        comicProjects: Array.isArray(safeTrabajo.comicProjects) ? safeTrabajo.comicProjects : [],
      },
      personal: {
        ...defaults.personal,
        ...safePersonal,
        gallery:    (safePersonal.gallery    && typeof safePersonal.gallery    === 'object') ? safePersonal.gallery    : {},
        projects:   Array.isArray(safePersonal.projects)   ? safePersonal.projects   : [],
        books:      Array.isArray(safePersonal.books)      ? safePersonal.books      : [],
        films:      Array.isArray(safePersonal.films)      ? safePersonal.films      : [],
        others:     Array.isArray(safePersonal.others)     ? safePersonal.others     : [],
        wishlist:   Array.isArray(safePersonal.wishlist)   ? safePersonal.wishlist   : [],
        ideas:      safePersonal.ideas      ?? '',
        monomanias: Array.isArray(safePersonal.monomanias) ? safePersonal.monomanias : [],
        booksByYear:(safePersonal.booksByYear && typeof safePersonal.booksByYear === 'object') ? safePersonal.booksByYear : {},
      },
    };
  } catch (e) {
    console.warn('Life OS: error al leer datos guardados, usando estado inicial.', e);
    return getInitialState();
  }
};

// ─── Rollover diario ─────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const todayDow = () => new Date().getDay(); // 0=dom,1=lun,...,6=sab

const applyRollover = (state) => {
  const todayStr = today();
  if (state.lastOpenedDate === todayStr) return state;

  const dow = todayDow();

  // Tareas: eliminar completadas. Recurrentes: regenerar si toca hoy.
  const recurringToday = state.tasks
    .filter(t => t.recurrence && t.recurrence.days && t.recurrence.days.includes(dow))
    .map(t => ({ ...t, done: false }));
  const pending = state.tasks.filter(t => !t.done && (!t.recurrence));
  // Unir: pendientes normales + recurrentes de hoy (sin duplicar)
  const existingRecurringIds = new Set(recurringToday.map(t => t.id));
  const nonRecurringPending = pending.filter(t => !existingRecurringIds.has(t.id));
  const newTasks = [...nonRecurringPending, ...recurringToday];

  // Hábitos: reset doneDate
  const resetHabits = (list) => list.map(h => ({ ...h, doneDate: null }));

  // Ciclo: auto-incremento
  const newCycleLog = { ...state.cycleLog };
  if (state.lastOpenedDate) {
    const lastDay = newCycleLog[state.lastOpenedDate];
    if (lastDay !== undefined) newCycleLog[todayStr] = lastDay + 1;
  }

  // Imagen de inspiración: rotar índice
  const currentMonth = new Date().toISOString().slice(0, 7);
  const imgs = state.personal?.gallery?.[currentMonth] ?? [];
  let nextImg = state.inspirationImage;
  if (imgs.length > 0) {
    const idx = imgs.indexOf(state.inspirationImage);
    nextImg = imgs[(idx + 1) % imgs.length];
  }

  return {
    ...state,
    lastOpenedDate: todayStr,
    tasks: newTasks,
    habits: {
      morning: resetHabits(state.habits.morning),
      night:   resetHabits(state.habits.night),
    },
    agenda: { today: [] },
    cycleLog: newCycleLog,
    inspirationImage: nextImg,
  };
};

// ─── localStorage key ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'lifeos_state_v5';

// ─── App principal ───────────────────────────────────────────────────────────────
export default function App() {
  const [state, setStateRaw] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved) return applyRollover(getInitialState());
      return applyRollover(mergeState(saved));
    } catch {
      return applyRollover(getInitialState());
    }
  });

  const [section, setSection] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Auto-save
  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const theme = THEMES[state.themeId] ?? THEMES.rose;

  // ── Export / Import ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `lifeos-backup-${today()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setState(mergeState(data));
        setSettingsOpen(false);
      } catch { alert('Archivo inválido'); }
    };
    reader.readAsText(file);
  };

  // ── Secciones ──────────────────────────────────────────────────────────────────
  const sections = [
    { id: 'dashboard', icon: <IconDashboard />, label: 'Dashboard' },
    { id: 'fitness',   icon: <IconFitness />,   label: 'Fitness'   },
    { id: 'hogar',     icon: <IconHogar />,     label: 'Hogar'     },
    { id: 'trabajo',   icon: <IconTrabajo />,   label: 'Trabajo'   },
    { id: 'personal',  icon: <IconPersonal />,  label: 'Personal'  },
  ];

  const sectionColors = {
    dashboard: theme.accent,
    fitness:   '#D9A892',
    hogar:     '#BFAE93',
    trabajo:   '#8FA89E',
    personal:  '#C9A0A0',
  };

  const currentColor = sectionColors[section] ?? theme.accent;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: '#FBF8F4',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Halos de fondo */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 600px 400px at 0% 0%, ${currentColor}18 0%, transparent 70%),
          radial-gradient(ellipse 500px 350px at 100% 100%, ${currentColor}12 0%, transparent 70%)
        `,
        transition: 'background 0.8s ease',
      }} />

      {/* ── Sidebar ── */}
      <aside style={{
        width: 56,
        background: `linear-gradient(180deg, ${currentColor}22 0%, ${currentColor}10 100%)`,
        backdropFilter: 'blur(12px)',
        borderRight: `1px solid ${currentColor}30`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        gap: 4,
        zIndex: 10,
        position: 'relative',
        transition: 'background 0.6s ease',
      }}>
        {/* Botón ajustes */}
        <button
          onClick={() => setSettingsOpen(true)}
          title="Ajustes"
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            border: 'none',
            background: settingsOpen ? `${currentColor}40` : 'transparent',
            color: currentColor,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
            transition: 'background 0.2s',
          }}
        >
          <IconSettings />
        </button>

        <div style={{ width: 24, height: 1, background: `${currentColor}30`, marginBottom: 8 }} />

        {/* Nav — nombres verticales en Fraunces */}
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            title={s.label}
            style={{
              width: 44,
              padding: '8px 0',
              borderRadius: 10,
              border: 'none',
              background: section === s.id ? `${currentColor}30` : 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic',
              fontSize: 10,
              letterSpacing: '0.04em',
              color: section === s.id ? currentColor : `${currentColor}70`,
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              lineHeight: 1,
              transition: 'color 0.2s',
            }}>
              {s.label}
            </span>
          </button>
        ))}
      </aside>

      {/* ── Contenido principal ── */}
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {section === 'dashboard' && (
          <Dashboard state={state} setState={setState} theme={theme} themeId={state.themeId} themes={THEMES} />
        )}
        {section === 'fitness' && (
          <Fitness state={state} setState={setState} />
        )}
        {section === 'hogar' && (
          <Hogar state={state} setState={setState} />
        )}
        {section === 'trabajo' && (
          <Trabajo state={state} setState={setState} />
        )}
        {section === 'personal' && (
          <Personal state={state} setState={setState} onNavigate={setSection} />
        )}
      </main>

      {/* ── Panel de ajustes ── */}
      {settingsOpen && (
        <>
          <div
            onClick={() => setSettingsOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)',
              zIndex: 100, backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#FDFAF7',
            borderRadius: 24,
            border: `1px solid ${currentColor}30`,
            boxShadow: `0 24px 64px rgba(0,0,0,0.12), 0 0 0 1px ${currentColor}10`,
            padding: '32px 36px',
            width: 480,
            zIndex: 101,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: '#3A3230', fontStyle: 'italic' }}>
                Ajustes
              </span>
              <button onClick={() => setSettingsOpen(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A80', padding: 4,
              }}>
                <IconClose />
              </button>
            </div>

            {/* Selector de tema */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', color: '#9A8A80', textTransform: 'uppercase', marginBottom: 12 }}>
                Color del dashboard
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(THEMES).map(([id, t]) => (
                  <button
                    key={id}
                    onClick={() => setState(s => ({ ...s, themeId: id }))}
                    title={t.name}
                    style={{
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: t.accent,
                      border: state.themeId === id
                        ? `2.5px solid ${t.accent}` : '2.5px solid transparent',
                      outline: state.themeId === id ? `3px solid ${t.accent}40` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      transform: state.themeId === id ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: `${currentColor}20`, marginBottom: 24 }} />

            {/* Export / Import */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleExport}
                style={{
                  padding: '11px 20px',
                  borderRadius: 12,
                  border: `1.5px solid ${currentColor}40`,
                  background: 'transparent',
                  color: '#5A4A42',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = `${currentColor}15`}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                Exportar datos (JSON)
              </button>

              <label style={{
                padding: '11px 20px',
                borderRadius: 12,
                border: `1.5px solid ${currentColor}40`,
                background: 'transparent',
                color: '#5A4A42',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.background = `${currentColor}15`}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                Importar datos (JSON)
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ marginTop: 20, fontSize: 11, color: '#B0A098', lineHeight: 1.6 }}>
              Los datos se guardan automáticamente en tu navegador.
            </div>
          </div>
        </>
      )}
    </div>
  );
}