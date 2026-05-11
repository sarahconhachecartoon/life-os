import React, { useState, useEffect, useMemo, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────
// LIFE OS — DASHBOARD v5
// Sin sidebar propio · Agenda solo hoy · Hábitos actualizados
// Monomanía lee del estado personal
// ─────────────────────────────────────────────────────────────────

const THEMES = [
  { id: 'rose',      name: 'Rosa empolvado',  accent: '#C9A0A0', soft: '#F4E8E8' },
  { id: 'nude',      name: 'Nude rosado',     accent: '#D4B8A8', soft: '#F5EBE4' },
  { id: 'peach',     name: 'Melocotón',       accent: '#D9A892', soft: '#F6E7DD' },
  { id: 'terracota', name: 'Terracota polvo', accent: '#B88A75', soft: '#EDD9CE' },
  { id: 'topo',      name: 'Topo',            accent: '#A89B8C', soft: '#E8E2D8' },
  { id: 'beige',     name: 'Beige cálido',    accent: '#BFAE93', soft: '#EFE7D7' },
  { id: 'moka',      name: 'Moka suave',      accent: '#9C8472', soft: '#E2D6C9' },
  { id: 'salvia',    name: 'Verde salvia',    accent: '#9DAE99', soft: '#E2EAE0' },
  { id: 'eucalipto', name: 'Eucalipto',       accent: '#8FA89E', soft: '#DDE7E2' },
  { id: 'oliva',     name: 'Oliva suave',     accent: '#A0A287', soft: '#E5E5D6' },
  { id: 'niebla',    name: 'Azul niebla',     accent: '#9FB1B8', soft: '#DEE6E9' },
  { id: 'humo',      name: 'Azul humo',       accent: '#8A9BAA', soft: '#D9DEE6' },
  { id: 'grisazul',  name: 'Azul grisáceo',   accent: '#9AA8B5', soft: '#DCE2E8' },
  { id: 'lavanda',   name: 'Lavanda apagada', accent: '#A89DB3', soft: '#E4DEE8' },
  { id: 'ciruela',   name: 'Ciruela suave',   accent: '#A88A98', soft: '#E5D8DE' },
];

const MOODS = [
  { id: 'mal',       label: 'Mal',       color: '#B88A75' },
  { id: 'normal',    label: 'Normal',    color: '#A89B8C' },
  { id: 'bien',      label: 'Bien',      color: '#9FB1B8' },
  { id: 'excelente', label: 'Excelente', color: '#A89DB3' },
];

const getCyclePhase = d => {
  if (d>=1&&d<=5)  return 'Menstruación';
  if (d>=6&&d<=13) return 'Folicular';
  if (d===14)      return 'Ovulación';
  if (d>=15&&d<=28)return 'Lútea';
  return 'Lútea tardía';
};

const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAYS   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const todayKey = (d = new Date()) => d.toISOString().slice(0,10);

// Hábitos por defecto actualizados
const DEFAULT_HABITS = {
  morning: [
    { id: 'hm1', label: 'Café',          doneDate: null },
    { id: 'hm2', label: 'Trabajo',       doneDate: null },
    { id: 'hm3', label: 'Skincare',      doneDate: null },
    { id: 'hm4', label: 'Gym',           doneDate: null },
    { id: 'hm5', label: 'Lectura',       doneDate: null },
    { id: 'hm6', label: 'Hacer la cama', doneDate: null },
  ],
  night: [
    { id: 'hn1', label: 'Agenda',             doneDate: null },
    { id: 'hn2', label: 'Notion',             doneDate: null },
    { id: 'hn3', label: 'Day One',            doneDate: null },
    { id: 'hn4', label: 'Dientes',            doneDate: null },
    { id: 'hn5', label: 'Skincare',           doneDate: null },
    { id: 'hn6', label: 'Trenza',             doneDate: null },
    { id: 'hn7', label: 'Ropa para mañana',   doneDate: null },
  ],
};

// ─────────────────────────────────────────────────────────────────
export default function LifeOSDashboard({ state, setState }) {
  const [settingsOpen,    setSettingsOpen]    = useState(false);
  const [newTaskText,     setNewTaskText]      = useState('');
  const [draggedId,       setDraggedId]        = useState(null);
  const [editingPage,     setEditingPage]      = useState({ kindle: false, paper: false });
  const [pageInput,       setPageInput]        = useState({ kindle: '', paper: '' });
  const [editingMeta,     setEditingMeta]      = useState(null); // 'kindle' | 'paper' | null
  const [metaForm,        setMetaForm]         = useState({ title:'', author:'', totalPages:'' });
  const [moodPickerOpen,  setMoodPickerOpen]   = useState(false);
  const [editingCycleDay, setEditingCycleDay]  = useState(false);
  // Agenda: añadir evento
  const [newAgTime,  setNewAgTime]  = useState('');
  const [newAgText,  setNewAgText]  = useState('');
  const moodRef = useRef(null);

  const theme = THEMES.find(t => t.id === state.themeId) || THEMES[0];

  // Cerrar mood picker al click fuera
  useEffect(() => {
    const h = e => { if (moodRef.current && !moodRef.current.contains(e.target)) setMoodPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const now        = new Date();
  const today      = todayKey();
  const monthName  = MONTHS[now.getMonth()];
  const dayName    = DAYS[now.getDay()];
  const dayNumber  = now.getDate();
  const year       = now.getFullYear();

  // Ciclo
  const cycleDay   = state.cycleLog?.[today];
  const cyclePhase = cycleDay !== undefined ? getCyclePhase(cycleDay) : null;
  const todayMood  = state.moodHistory?.[today];

  const setCycleDay = val => {
    const n = parseInt(val);
    if (isNaN(n) || n < 1) return;
    setState(s => ({ ...s, cycleLog: { ...(s.cycleLog||{}), [today]: n } }));
  };

  // Hábitos — asegurar que existen los correctos
  const habits = useMemo(() => {
    const h = state.habits;
    if (!h || !h.morning?.length) return DEFAULT_HABITS;
    return h;
  }, [state.habits]);

  // Tareas
  const addTask = () => {
    const text = newTaskText.trim();
    if (!text) return;
    setState(s => ({ ...s, tasks: [...s.tasks, { id:`t${Date.now()}`, text, done:false, priority:false }] }));
    setNewTaskText('');
  };
  const toggleTask     = id => setState(s => ({ ...s, tasks: s.tasks.map(t => t.id===id?{...t,done:!t.done}:t) }));
  const togglePriority = id => setState(s => {
    const n = s.tasks.filter(t=>t.priority).length;
    return { ...s, tasks: s.tasks.map(t => {
      if (t.id!==id) return t;
      if (!t.priority && n>=3) return t;
      return { ...t, priority:!t.priority };
    })};
  });
  const deleteTask = id => setState(s => ({ ...s, tasks: s.tasks.filter(t=>t.id!==id) }));
  const sortedTasks = useMemo(() => [...state.tasks].sort((a,b) => {
    if (a.priority!==b.priority) return a.priority?-1:1;
    if (a.done!==b.done) return a.done?1:-1;
    return 0;
  }), [state.tasks]);

  const handleDragStart = id => setDraggedId(id);
  const handleDragOver  = e => e.preventDefault();
  const handleDrop      = targetId => {
    if (!draggedId || draggedId===targetId) return;
    setState(s => {
      const arr  = [...s.tasks];
      const from = arr.findIndex(t=>t.id===draggedId);
      const to   = arr.findIndex(t=>t.id===targetId);
      const [moved] = arr.splice(from,1);
      arr.splice(to,0,moved);
      return { ...s, tasks:arr };
    });
    setDraggedId(null);
  };

  // Hábitos toggle
  const toggleHabit = (group, id) => setState(s => ({
    ...s,
    habits: {
      ...s.habits,
      [group]: s.habits[group].map(h => h.id===id?{...h,doneDate:h.doneDate===today?null:today}:h),
    },
  }));
  const habitDone = h => h.doneDate === today;

  // Mood
  const setMood = moodId => {
    setState(s => ({ ...s, moodHistory:{ ...s.moodHistory, [today]:moodId } }));
    setMoodPickerOpen(false);
  };

  // Lectura (dos libros: kindle + paper)
  const reading = state.reading?.kindle ? state.reading : { kindle: { title:'', author:'', currentPage:0, totalPages:0 }, paper: { title:'', author:'', currentPage:0, totalPages:0 } };

  const startEditPage = (format) => {
    setPageInput(p => ({ ...p, [format]: String(reading[format].currentPage) }));
    setEditingPage(p => ({ ...p, [format]: true }));
  };
  const commitPage = (format) => {
    const n = parseInt(pageInput[format]);
    if (!isNaN(n)) setState(s => ({
      ...s,
      reading: { ...s.reading, [format]: { ...s.reading[format], currentPage: Math.max(0, Math.min(s.reading[format].totalPages || 9999, n)) } }
    }));
    setEditingPage(p => ({ ...p, [format]: false }));
  };
  const openMetaForm = (format) => {
    setMetaForm({ title: reading[format].title, author: reading[format].author, totalPages: String(reading[format].totalPages || '') });
    setEditingMeta(format);
  };
  const saveMetaForm = () => {
    if (!editingMeta) return;
    setState(s => ({
      ...s,
      reading: { ...s.reading, [editingMeta]: {
        ...s.reading[editingMeta],
        title: metaForm.title,
        author: metaForm.author,
        totalPages: parseInt(metaForm.totalPages) || 0,
      }}
    }));
    setEditingMeta(null);
  };

  // Notas y menú
  const updateNotes = v => setState(s => ({ ...s, notes:v }));
  const updateMenu  = (k,v) => setState(s => ({ ...s, menu:{ ...s.menu, [k]:v } }));

  // Agenda — solo hoy, manual
  const agendaToday = state.agenda?.today || [];
  const addAgendaItem = () => {
    if (!newAgText.trim()) return;
    setState(s => ({
      ...s,
      agenda: {
        ...s.agenda,
        today: [...(s.agenda?.today||[]), { id:`a${Date.now()}`, time:newAgTime, text:newAgText.trim() }]
          .sort((a,b) => (a.time||'').localeCompare(b.time||'')),
      },
    }));
    setNewAgTime('');
    setNewAgText('');
  };
  const deleteAgendaItem = id => setState(s => ({
    ...s,
    agenda: { ...s.agenda, today: (s.agenda?.today||[]).filter(e=>e.id!==id) },
  }));

  // Monomanía activa — lee de personal
  const activeMono = useMemo(() => {
    const monos = state.personal?.monomanias || [];
    return monos.find(m => m.active) || null;
  }, [state.personal?.monomanias]);

  // Peso
  const weightSeries = state.body?.weight || [];
  const lastWeight   = weightSeries[weightSeries.length-1]?.value;
  const chartPath = useMemo(() => {
    if (weightSeries.length < 2) return '';
    const values = weightSeries.map(p=>p.value);
    const min=Math.min(...values), max=Math.max(...values), range=max-min||1;
    const w=280, h=36, step=w/(weightSeries.length-1);
    return weightSeries.map((p,i) => {
      const x=i*step, y=h-((p.value-min)/range)*h;
      return `${i===0?'M':'L'} ${x.toFixed(1)} ${(y+3).toFixed(1)}`;
    }).join(' ');
  }, [weightSeries]);

  // Export/Import
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`lifeos-${today}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const importData = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try { setState(s => ({ ...s, ...JSON.parse(ev.target.result) })); }
      catch { alert('Archivo no válido'); }
    };
    reader.readAsText(file);
  };

  // Icons
  const MoodDot = ({ id, size=14 }) => {
    const mood = MOODS.find(m => m.id === id);
    if (!mood) return null;
    return <div style={{width:size,height:size,borderRadius:'50%',background:mood.color,flexShrink:0}}/>;
  };

  const Icon = ({ name, size=18 }) => {
    const p={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'};
    switch(name) {
      case 'star':     return <svg {...p} fill="currentColor"><path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14l-5-4.5 6.5-.5z"/></svg>;
      case 'starline': return <svg {...p}><path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14l-5-4.5 6.5-.5z"/></svg>;
      case 'check':    return <svg {...p} strokeWidth={2.5} stroke="white"><path d="M5 12l5 5L20 7"/></svg>;
      case 'close':    return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
      case 'sun':      return <svg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>;
      case 'moon':     return <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>;
      case 'trash':    return <svg {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>;
      case 'settings': return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
      default: return null;
    }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Inter:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; }

    /* El dashboard ocupa TODO el espacio que le da app-content — sin grid propio */
    .dash {
      --accent: ${theme.accent};
      --soft:   ${theme.soft};
      --bg:     #FBF8F4;
      --bg-2:   #F4EFE8;
      --panel:  #FFFFFF;
      --ink:    #2C2A26;
      --ink-soft: #6B6661;
      --ink-faint: #B5AFA8;
      --line:   #ECE6DC;
      font-family: 'Inter', system-ui, sans-serif;
      color: var(--ink);
      background:
        radial-gradient(1200px 800px at 0% 0%, color-mix(in srgb, var(--soft) 40%, transparent), transparent 60%),
        radial-gradient(900px 700px at 100% 100%, color-mix(in srgb, var(--soft) 30%, transparent), transparent 55%),
        var(--bg);
      height: 100%;
      width: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      letter-spacing: 0.01em;
      -webkit-font-smoothing: antialiased;
    }

    /* TOPBAR */
    .dash-top {
      background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 74%, white));
      border-radius: 0;
      padding: 0 28px;
      height: 72px;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      color: white;
      box-shadow: 0 10px 28px -18px color-mix(in srgb, var(--accent) 85%, black);
      flex-shrink: 0;
    }
    .dash-top-side { font-family: 'Fraunces', serif; font-style: italic; font-size: 22px; opacity: .92; }
    .dash-top-side.right { text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
    .dash-top-center { display: flex; align-items: baseline; gap: 12px; font-family: 'Fraunces', serif; font-size: 44px; line-height: 1; }
    .dash-top-day { font-style: italic; }
    .dash-settings-btn {
      background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.35);
      border-radius: 10px; padding: 6px 10px; cursor: pointer; color: white;
      display: flex; align-items: center; transition: background .2s;
    }
    .dash-settings-btn:hover { background: rgba(255,255,255,.35); }

    /* MAIN GRID */
    .dash-main {
      flex: 1; min-height: 0;
      padding: 14px 18px 14px 14px;
      display: grid;
      grid-template-rows: 1fr 1fr;
      gap: 14px;
    }
    .dash-row { display: grid; gap: 14px; min-height: 0; }
    .dash-row-top    { grid-template-columns: 1.3fr 1fr 1.05fr; }
    .dash-row-bottom { grid-template-columns: 1fr 1.1fr 1fr; }

    /* CARDS */
    .dash-card {
      background: var(--panel); border-radius: 20px; border: 1px solid var(--line);
      box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 6px 22px -20px rgba(60,50,40,.16);
      display: flex; flex-direction: column; min-height: 0; min-width: 0; overflow: hidden;
      transition: box-shadow .4s;
    }
    .dash-card:hover { box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 14px 32px -18px rgba(60,50,40,.2); }
    .dash-card-head {
      padding: 11px 16px 9px; display: flex; align-items: center; justify-content: space-between;
    }
    .dash-tag {
      background: var(--accent); color: white;
      font-family: 'Fraunces', serif; font-style: italic; font-size: 15px;
      padding: 3px 13px 4px; border-radius: 999px;
      box-shadow: 0 3px 8px -5px color-mix(in srgb, var(--accent) 65%, transparent);
    }
    .dash-card-meta { font-size: 10px; letter-spacing: .2em; color: var(--ink-faint); text-transform: uppercase; }
    .dash-card-body { flex: 1; min-height: 0; padding: 2px 16px 14px; display: flex; flex-direction: column; overflow: hidden; }
    .dash-stack { display: flex; flex-direction: column; gap: 14px; min-height: 0; }

    /* INSPIRACIÓN */
    .dash-hero { padding: 0; position: relative; }
    .dash-hero-inner {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, var(--soft), color-mix(in srgb, var(--soft) 55%, white));
      display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .dash-hero-inner img { width: 100%; height: 100%; object-fit: cover; }
    .dash-hero-overlay {
      position: absolute; top: 0; left: 0; right: 0; padding: 11px 16px; z-index: 2;
      display: flex; align-items: center; justify-content: space-between;
    }
    .dash-hero-placeholder {
      font-family: 'Fraunces', serif; font-style: italic;
      color: color-mix(in srgb, var(--accent) 55%, var(--ink-soft));
      font-size: 13px; text-align: center; padding: 20px; max-width: 200px; line-height: 1.55;
    }

    /* TO DO */
    .dash-todo-list { flex: 1; overflow-y: auto; margin: 0 -3px; padding: 0 3px; }
    .dash-todo-list::-webkit-scrollbar { width: 3px; }
    .dash-todo-list::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }
    .dash-todo-item {
      display: flex; align-items: center; gap: 9px; padding: 6px 7px; border-radius: 10px;
      cursor: grab; font-size: 13px; position: relative; transition: background .22s;
    }
    .dash-todo-item:hover { background: var(--bg-2); }
    .dash-todo-item.priority { background: color-mix(in srgb, var(--soft) 65%, transparent); }
    .dash-todo-item.priority::before {
      content: ''; position: absolute; left: 2px; top: 8px; bottom: 8px;
      width: 2px; background: var(--accent); border-radius: 1px;
    }
    .dash-todo-check {
      width: 16px; height: 16px; border: 1.5px solid var(--ink-faint); border-radius: 5px;
      cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      transition: all .22s;
    }
    .dash-todo-check.done { background: var(--accent); border-color: var(--accent); }
    .dash-todo-text { flex: 1; line-height: 1.3; }
    .dash-todo-text.done { text-decoration: line-through; color: var(--ink-faint); }
    .dash-todo-star { opacity: 0; cursor: pointer; color: var(--ink-faint); transition: opacity .2s, color .2s; display: flex; }
    .dash-todo-item:hover .dash-todo-star { opacity: .55; }
    .dash-todo-star.active { opacity: 1; color: var(--accent); }
    .dash-todo-del { opacity: 0; cursor: pointer; font-size: 16px; color: var(--ink-faint); transition: opacity .2s; padding: 0 3px; }
    .dash-todo-item:hover .dash-todo-del { opacity: .45; }
    .dash-todo-del:hover { opacity: 1 !important; }
    .dash-todo-add { display: flex; gap: 8px; margin-top: 6px; padding: 7px 0 0; border-top: 1px dashed var(--line); }
    .dash-todo-input { flex: 1; border: none; outline: none; background: transparent; font: inherit; font-size: 13px; color: var(--ink); }
    .dash-todo-input::placeholder { color: var(--ink-faint); font-style: italic; font-family: 'Fraunces', serif; }

    /* ESTADO */
    .dash-body-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 7px; margin-bottom: 8px; }
    .dash-stat {
      background: var(--bg-2); border-radius: 12px; padding: 8px 10px; cursor: pointer; position: relative;
      transition: background .22s;
    }
    .dash-stat:hover { background: color-mix(in srgb, var(--soft) 60%, var(--bg-2)); }
    .dash-stat-lbl { font-size: 8px; letter-spacing: .25em; color: var(--ink-faint); text-transform: uppercase; margin-bottom: 4px; }
    .dash-stat-val { font-family: 'Fraunces', serif; font-size: 20px; line-height: 1; color: var(--ink); }
    .dash-stat-unit { font-size: 10px; color: var(--ink-faint); margin-left: 2px; font-family: 'Inter', sans-serif; }
    .dash-stat-sub { font-size: 10px; color: var(--ink-soft); margin-top: 3px; font-style: italic; font-family: 'Fraunces', serif; line-height: 1.2; }
    .dash-stat-in { font-family: 'Fraunces', serif; font-size: 18px; width: 60px; border: none; outline: none; background: transparent; color: var(--ink); }
    .dash-mood-display { display: flex; align-items: center; gap: 5px; color: var(--accent); }
    .dash-mood-lbl { font-family: 'Fraunces', serif; font-size: 13px; font-style: italic; color: var(--ink); }
    .dash-mood-empty { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--ink-faint); }
    .dash-mood-pop {
      position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%);
      background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
      box-shadow: 0 20px 40px -16px rgba(60,50,40,.22);
      padding: 10px 12px; display: flex; gap: 8px; z-index: 30; white-space: nowrap;
    }
    .dash-mood-opt {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      padding: 7px 10px; border-radius: 10px; cursor: pointer;
      border: 2px solid transparent; background: transparent; transition: all .18s;
    }
    .dash-mood-opt:hover { background: var(--bg-2); }
    .dash-mood-opt.sel { border-color: var(--ink); }
    .dash-mood-opt-lbl { font-size: 9px; font-family: 'Fraunces', serif; font-style: italic; color: var(--ink-soft); }
    .dash-mood-dot { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; }
    .dash-chart-mini { background: var(--bg-2); border-radius: 11px; padding: 7px 10px; }
    .dash-chart-cap { font-size: 8px; letter-spacing: .22em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 4px; }

    /* LECTURA */
    .dash-reading-row { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
    .dash-book-spine {
      width: 30px; height: 46px; border-radius: 3px 2px 2px 3px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 75%, white));
      box-shadow: 2px 0 5px rgba(0,0,0,.07);
    }
    .dash-reading-title { font-family: 'Fraunces', serif; font-size: 14px; font-weight: 400; margin-bottom: 3px; }
    .dash-reading-author { font-size: 11px; color: var(--ink-soft); font-style: italic; font-family: 'Fraunces', serif; }
    .dash-reading-bar-wrap { height: 4px; background: var(--bg-2); border-radius: 2px; overflow: hidden; margin-bottom: 7px; }
    .dash-reading-bar { height: 100%; background: var(--accent); border-radius: 2px; transition: width .4s; }
    .dash-reading-meta { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--ink-soft); }
    .dash-page-btn {
      font-family: 'Fraunces', serif; font-style: italic; font-size: 13px;
      background: var(--bg-2); border: 1.5px solid var(--line); border-radius: 8px;
      padding: 3px 10px; cursor: pointer; color: var(--ink-soft); transition: border-color .18s;
    }
    .dash-page-btn:hover { border-color: var(--accent); }
    .dash-page-input { font-family: 'Fraunces', serif; font-size: 13px; width: 64px; border: 1.5px solid var(--accent); border-radius: 8px; padding: 3px 8px; outline: none; color: var(--ink); background: white; }

    /* HÁBITOS */
    .dash-hab-section { margin-bottom: 8px; }
    .dash-hab-section:last-child { margin-bottom: 0; }
    .dash-hab-lbl { display: flex; align-items: center; gap: 5px; font-size: 9px; letter-spacing: .2em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 5px; }
    .dash-hab-item { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 9px; cursor: pointer; transition: background .18s; }
    .dash-hab-item:hover { background: var(--bg-2); }
    .dash-hab-check {
      width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid var(--line);
      flex-shrink: 0; transition: all .2s; display: flex; align-items: center; justify-content: center;
    }
    .dash-hab-check.done { background: var(--accent); border-color: var(--accent); }
    .dash-hab-label { font-size: 12px; }
    .dash-hab-label.done { text-decoration: line-through; color: var(--ink-faint); }

    /* AGENDA */
    .dash-ag-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; }
    .dash-ag-item { display: flex; align-items: baseline; gap: 8px; padding: 4px 6px; border-radius: 8px; transition: background .15s; }
    .dash-ag-item:hover { background: var(--bg-2); }
    .dash-ag-time { font-size: 10px; color: white; background: var(--accent); padding: 2px 7px; border-radius: 20px; font-weight: 500; flex-shrink: 0; }
    .dash-ag-text { font-size: 12px; flex: 1; }
    .dash-ag-del { background: none; border: none; cursor: pointer; color: var(--ink-faint); font-size: 13px; opacity: 0; transition: opacity .15s; padding: 0; }
    .dash-ag-item:hover .dash-ag-del { opacity: .5; }
    .dash-ag-del:hover { opacity: 1 !important; }
    .dash-ag-empty { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--ink-faint); padding: 4px 0; }
    .dash-ag-add { display: flex; gap: 5px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--line); flex-shrink: 0; }
    .dash-ag-time-in { width: 58px; border: 1.5px solid var(--line); border-radius: 8px; padding: 5px 6px; font: inherit; font-size: 11px; color: var(--ink); background: var(--bg-2); outline: none; }
    .dash-ag-time-in:focus { border-color: var(--accent); }
    .dash-ag-text-in { flex: 1; border: 1.5px solid var(--line); border-radius: 8px; padding: 5px 8px; font: inherit; font-size: 12px; color: var(--ink); background: var(--bg-2); outline: none; }
    .dash-ag-text-in::placeholder { color: var(--ink-faint); font-style: italic; font-family: 'Fraunces', serif; }
    .dash-ag-text-in:focus { border-color: var(--accent); }
    .dash-ag-add-btn { background: var(--accent); border: none; border-radius: 8px; color: white; padding: 5px 9px; cursor: pointer; font-size: 14px; transition: opacity .18s; }
    .dash-ag-add-btn:hover { opacity: .85; }

    /* MENÚ */
    .dash-menu-row { display: flex; align-items: baseline; gap: 8px; padding: 5px 0; border-bottom: 1px solid color-mix(in srgb, var(--line) 60%, transparent); }
    .dash-menu-row:last-child { border-bottom: none; }
    .dash-menu-lbl { font-size: 9px; letter-spacing: .18em; text-transform: uppercase; color: var(--ink-faint); min-width: 58px; font-style: italic; font-family: 'Fraunces', serif; }
    .dash-menu-in { flex: 1; border: none; outline: none; background: transparent; font: inherit; font-size: 12px; color: var(--ink); }
    .dash-menu-in::placeholder { color: var(--ink-faint); }

    /* NOTAS */
    .dash-notes-ta { flex: 1; width: 100%; resize: none; border: none; outline: none; font: inherit; font-size: 12px; color: var(--ink); background: transparent; line-height: 1.7; }
    .dash-notes-ta::placeholder { color: var(--ink-faint); font-style: italic; font-family: 'Fraunces', serif; }

    /* MONOMANÍA */
    .dash-mono-pill {
      background: linear-gradient(135deg, var(--soft), color-mix(in srgb, var(--soft) 55%, white));
      border-radius: 14px; padding: 12px 16px;
      border: 1px solid color-mix(in srgb, var(--accent) 20%, var(--line));
    }
    .dash-mono-title { font-family: 'Fraunces', serif; font-style: italic; font-size: 18px; color: var(--ink); }
    .dash-mono-empty { font-family: 'Fraunces', serif; font-style: italic; font-size: 13px; color: var(--ink-faint); }

    /* MODAL AJUSTES */
    .dash-overlay {
      position: fixed; inset: 0; background: rgba(44,42,38,.35); z-index: 50;
      display: flex; align-items: center; justify-content: center;
    }
    .dash-modal {
      background: var(--panel); border-radius: 22px; padding: 28px 28px 24px;
      width: 360px; max-height: 80vh; overflow-y: auto;
      box-shadow: 0 32px 64px -24px rgba(44,42,38,.28); position: relative;
    }
    .dash-modal-title { font-family: 'Fraunces', serif; font-size: 22px; margin-bottom: 20px; color: var(--ink); }
    .dash-modal-sub { font-size: 10px; letter-spacing: .25em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 14px; }
    .dash-modal-sub + .dash-color-grid { margin-bottom: 18px; }
    .dash-color-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 8px; }
    .dash-cdot {
      width: 36px; height: 36px; border-radius: 50%; cursor: pointer;
      border: 2.5px solid transparent; transition: transform .18s, border-color .18s;
    }
    .dash-cdot:hover { transform: scale(1.1); }
    .dash-cdot.sel { border-color: var(--ink); }
    .dash-modal-close {
      position: absolute; top: 16px; right: 16px;
      background: var(--bg-2); border: none; border-radius: 10px;
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--ink-soft); transition: background .2s;
    }
    .dash-modal-close:hover { background: var(--line); }
    .dash-btn-row { display: flex; gap: 8px; }
    .dash-btn-s {
      flex: 1; padding: 9px; border: 1.5px solid var(--line); border-radius: 12px;
      background: var(--bg-2); color: var(--ink); font: inherit; font-size: 12px;
      cursor: pointer; transition: border-color .2s;
      font-family: 'Fraunces', serif; font-style: italic;
    }
    .dash-btn-s:hover { border-color: var(--accent); }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="dash">

        {/* TOPBAR — sin sidebar propio */}
        <div className="dash-top">
          <div className="dash-top-side">{monthName}</div>
          <div className="dash-top-center">
            <span className="dash-top-day">{dayName}</span>
            <span>{dayNumber}</span>
          </div>
          <div className="dash-top-side right">
            <span>{year}</span>
            <button className="dash-settings-btn" onClick={() => setSettingsOpen(true)}>
              <Icon name="settings" size={15}/>
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="dash-main">

          {/* ROW TOP */}
          <div className="dash-row dash-row-top">

            {/* INSPIRACIÓN */}
            <div className="dash-card dash-hero">
              <div className="dash-hero-inner">
                {state.inspirationImage
                  ? <img src={state.inspirationImage} alt="Inspiración"/>
                  : <div className="dash-hero-placeholder">Añade imágenes en Personal → Inspiración para verlas aquí.</div>
                }
              </div>
              <div className="dash-hero-overlay">
                <span className="dash-tag">inspiración</span>
              </div>
            </div>

            {/* TO DO */}
            <div className="dash-card">
              <div className="dash-card-head">
                <span className="dash-tag">to do</span>
                <span className="dash-card-meta">{state.tasks.filter(t=>t.priority).length}/3 ★</span>
              </div>
              <div className="dash-card-body">
                <div className="dash-todo-list">
                  {sortedTasks.map(t => (
                    <div key={t.id}
                      className={`dash-todo-item${t.priority?' priority':''}`}
                      draggable onDragStart={()=>handleDragStart(t.id)}
                      onDragOver={handleDragOver} onDrop={()=>handleDrop(t.id)}>
                      <div className={`dash-todo-check${t.done?' done':''}`} onClick={()=>toggleTask(t.id)}>
                        {t.done && <Icon name="check" size={11}/>}
                      </div>
                      <span className={`dash-todo-text${t.done?' done':''}`}>{t.text}</span>
                      <span className={`dash-todo-star${t.priority?' active':''}`} onClick={()=>togglePriority(t.id)}>
                        <Icon name={t.priority?'star':'starline'} size={12}/>
                      </span>
                      <span className="dash-todo-del" onClick={()=>deleteTask(t.id)}>×</span>
                    </div>
                  ))}
                  {sortedTasks.length===0 && <div style={{fontSize:12,color:'var(--ink-faint)',fontStyle:'italic',padding:8,fontFamily:'Fraunces,serif'}}>día limpio.</div>}
                </div>
                <div className="dash-todo-add">
                  <input className="dash-todo-input" placeholder="añadir tarea…"
                    value={newTaskText} onChange={e=>setNewTaskText(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&addTask()}/>
                </div>
              </div>
            </div>

            {/* ESTADO + LECTURA */}
            <div className="dash-stack" style={{minHeight:0}}>
              <div className="dash-card" style={{flex:1}}>
                <div className="dash-card-head"><span className="dash-tag">estado</span></div>
                <div className="dash-card-body">
                  <div className="dash-body-row">
                    <div className="dash-stat" style={{cursor:'default'}}>
                      <div className="dash-stat-lbl">Peso</div>
                      <div className="dash-stat-val">{lastWeight?.toFixed(1)??'—'}<span className="dash-stat-unit">kg</span></div>
                      <div className="dash-stat-sub">esta semana</div>
                    </div>
                    <div className="dash-stat" onClick={()=>setEditingCycleDay(true)}>
                      <div className="dash-stat-lbl">Ciclo</div>
                      {editingCycleDay ? (
                        <input className="dash-stat-in" type="number" value={cycleDay??''} autoFocus
                          placeholder="día" onChange={e=>setCycleDay(e.target.value)}
                          onBlur={()=>setEditingCycleDay(false)}
                          onKeyDown={e=>e.key==='Enter'&&setEditingCycleDay(false)}/>
                      ) : (
                        <>
                          <div className="dash-stat-val">{cycleDay!==undefined?`día ${cycleDay}`:<span style={{fontSize:13,color:'var(--ink-faint)',fontStyle:'italic',fontFamily:'Fraunces,serif'}}>—</span>}</div>
                          {cyclePhase && <div className="dash-stat-sub">{cyclePhase.toLowerCase()}</div>}
                        </>
                      )}
                    </div>
                    <div className="dash-stat" ref={moodRef} onClick={()=>setMoodPickerOpen(o=>!o)}>
                      <div className="dash-stat-lbl">Me siento</div>
                      {todayMood
                        ? <div className="dash-mood-display">
                            <MoodDot id={todayMood} size={16}/>
                            <span className="dash-mood-lbl">{MOODS.find(m=>m.id===todayMood)?.label.toLowerCase()}</span>
                          </div>
                        : <div className="dash-mood-empty">elige…</div>}
                      {moodPickerOpen && (
                        <div className="dash-mood-pop" onClick={e=>e.stopPropagation()}>
                          {MOODS.map(m=>(
                            <button key={m.id} className={`dash-mood-opt${todayMood===m.id?' sel':''}`} onClick={()=>setMood(m.id)}>
                              <div className="dash-mood-dot" style={{background:m.color}}/>
                              <span className="dash-mood-opt-lbl">{m.label.toLowerCase()}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="dash-chart-mini">
                    <div className="dash-chart-cap">peso · últimas semanas</div>
                    <svg width="100%" height="38" viewBox="0 0 280 38" preserveAspectRatio="none">
                      <path d={chartPath} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      {weightSeries.map((p,i)=>{
                        const vals=weightSeries.map(x=>x.value);
                        const mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1;
                        const step=280/(weightSeries.length-1);
                        const x=i*step, y=36-((p.value-mn)/rng)*36+3;
                        return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--accent)"/>;
                      })}
                    </svg>
                  </div>
                </div>
              </div>

              <div className="dash-card" style={{flex:'0 0 auto'}}>
                <div className="dash-card-head"><span className="dash-tag">lectura</span></div>
                <div className="dash-card-body" style={{paddingBottom:10,gap:8}}>
                  {[['kindle','Kindle'],['paper','Papel']].map(([fmt,lbl]) => {
                    const book = reading[fmt];
                    const pct  = book.totalPages>0 ? Math.round((book.currentPage/book.totalPages)*100) : 0;
                    const hasBook = book.title || book.totalPages>0;
                    return (
                      <div key={fmt} style={{marginBottom:8}}>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
                          <div className="dash-book-spine" style={{width:22,height:34,flexShrink:0}}/>
                          <div style={{flex:1,minWidth:0}}>
                            {hasBook ? (
                              <>
                                <div className="dash-reading-title" style={{fontSize:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{book.title}</div>
                                <div className="dash-reading-author" style={{fontSize:10}}>{book.author}</div>
                              </>
                            ) : (
                              <button onClick={()=>openMetaForm(fmt)} style={{background:'none',border:'none',cursor:'pointer',fontFamily:'Fraunces,serif',fontStyle:'italic',fontSize:12,color:'var(--ink-faint)',padding:0,textAlign:'left'}}>
                                + añadir libro {lbl.toLowerCase()}…
                              </button>
                            )}
                          </div>
                          {hasBook && <button onClick={()=>openMetaForm(fmt)} style={{background:'none',border:'none',cursor:'pointer',fontSize:10,color:'var(--ink-faint)',padding:'2px 4px',borderRadius:5,transition:'background .15s'}} title="Editar">✎</button>}
                        </div>
                        {hasBook && <>
                          <div className="dash-reading-bar-wrap" style={{marginBottom:4}}>
                            <div className="dash-reading-bar" style={{width:`${pct}%`}}/>
                          </div>
                          <div className="dash-reading-meta">
                            {editingPage[fmt]
                              ? <input className="dash-page-input" type="number" value={pageInput[fmt]} autoFocus
                                  onChange={e=>setPageInput(p=>({...p,[fmt]:e.target.value}))}
                                  onBlur={()=>commitPage(fmt)}
                                  onKeyDown={e=>e.key==='Enter'&&commitPage(fmt)}/>
                              : <button className="dash-page-btn" onClick={()=>startEditPage(fmt)}>p. {book.currentPage} / {book.totalPages}</button>
                            }
                            <span>{pct}%</span>
                          </div>
                        </>}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Modal editar libro */}
              {editingMeta && (
                <div style={{position:'fixed',inset:0,background:'rgba(44,42,38,.3)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setEditingMeta(null)}>
                  <div style={{background:'var(--panel)',borderRadius:18,padding:'22px 24px',width:300,boxShadow:'0 24px 48px -20px rgba(44,42,38,.24)'}} onClick={e=>e.stopPropagation()}>
                    <div style={{fontFamily:'Fraunces,serif',fontStyle:'italic',fontSize:18,marginBottom:16,color:'var(--ink)'}}>
                      {editingMeta==='kindle'?'Kindle':'Papel'}
                    </div>
                    {[['title','Título'],['author','Autor'],['totalPages','Páginas totales']].map(([k,lbl])=>(
                      <div key={k} style={{marginBottom:10}}>
                        <div style={{fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--ink-faint)',marginBottom:4}}>{lbl}</div>
                        <input style={{width:'100%',border:'1.5px solid var(--line)',borderRadius:9,padding:'7px 10px',font:'inherit',fontSize:13,color:'var(--ink)',outline:'none',background:'var(--bg-2)'}}
                          value={metaForm[k]} onChange={e=>setMetaForm(v=>({...v,[k]:e.target.value}))}
                          onKeyDown={e=>e.key==='Enter'&&saveMetaForm()}
                          placeholder={lbl}/>
                      </div>
                    ))}
                    <div style={{display:'flex',gap:8,marginTop:14}}>
                      <button onClick={saveMetaForm} style={{flex:1,background:'var(--accent)',border:'none',borderRadius:10,color:'white',padding:'9px',fontFamily:'Fraunces,serif',fontStyle:'italic',fontSize:14,cursor:'pointer'}}>guardar</button>
                      <button onClick={()=>setEditingMeta(null)} style={{background:'transparent',border:'1.5px solid var(--line)',borderRadius:10,padding:'9px 14px',fontFamily:'Fraunces,serif',fontStyle:'italic',fontSize:14,color:'var(--inks)',cursor:'pointer'}}>cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>{/* fin row top */}

          {/* ROW BOTTOM */}
          <div className="dash-row dash-row-bottom">

            {/* HÁBITOS */}
            <div className="dash-card">
              <div className="dash-card-head"><span className="dash-tag">hábitos</span></div>
              <div className="dash-card-body" style={{overflowY:'auto'}}>
                <div className="dash-hab-section">
                  <div className="dash-hab-lbl"><Icon name="sun" size={11}/> mañana</div>
                  {habits.morning.map(h=>(
                    <div key={h.id} className="dash-hab-item" onClick={()=>toggleHabit('morning',h.id)}>
                      <div className={`dash-hab-check${habitDone(h)?' done':''}`}>
                        {habitDone(h) && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>}
                      </div>
                      <span className={`dash-hab-label${habitDone(h)?' done':''}`}>{h.label}</span>
                    </div>
                  ))}
                </div>
                <div className="dash-hab-section">
                  <div className="dash-hab-lbl"><Icon name="moon" size={11}/> noche</div>
                  {habits.night.map(h=>(
                    <div key={h.id} className="dash-hab-item" onClick={()=>toggleHabit('night',h.id)}>
                      <div className={`dash-hab-check${habitDone(h)?' done':''}`}>
                        {habitDone(h) && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>}
                      </div>
                      <span className={`dash-hab-label${habitDone(h)?' done':''}`}>{h.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AGENDA + MENÚ */}
            <div className="dash-stack" style={{minHeight:0}}>
              <div className="dash-card" style={{flex:1}}>
                <div className="dash-card-head"><span className="dash-tag">agenda</span></div>
                <div className="dash-card-body">
                  <div className="dash-ag-list">
                    {agendaToday.length===0 && <div className="dash-ag-empty">sin eventos hoy</div>}
                    {agendaToday.map(e=>(
                      <div key={e.id} className="dash-ag-item">
                        {e.time && <span className="dash-ag-time">{e.time}</span>}
                        <span className="dash-ag-text">{e.text}</span>
                        <button className="dash-ag-del" onClick={()=>deleteAgendaItem(e.id)}>×</button>
                      </div>
                    ))}
                  </div>
                  <div className="dash-ag-add">
                    <input className="dash-ag-time-in" type="time" value={newAgTime}
                      onChange={e=>setNewAgTime(e.target.value)}/>
                    <input className="dash-ag-text-in" placeholder="evento…" value={newAgText}
                      onChange={e=>setNewAgText(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&addAgendaItem()}/>
                    <button className="dash-ag-add-btn" onClick={addAgendaItem}>+</button>
                  </div>
                </div>
              </div>
              <div className="dash-card" style={{flex:1}}>
                <div className="dash-card-head"><span className="dash-tag">menú</span></div>
                <div className="dash-card-body">
                  {[['desayuno','desayuno'],['snack','snack'],['almuerzo','almuerzo'],['cena','cena']].map(([k,lbl])=>(
                    <div className="dash-menu-row" key={k}>
                      <span className="dash-menu-lbl">{lbl}</span>
                      <input className="dash-menu-in" value={state.menu[k]} onChange={e=>updateMenu(k,e.target.value)} placeholder="—"/>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NOTAS + MONOMANÍA */}
            <div className="dash-stack" style={{minHeight:0}}>
              <div className="dash-card" style={{flex:1}}>
                <div className="dash-card-head"><span className="dash-tag">notas</span></div>
                <div className="dash-card-body">
                  <textarea className="dash-notes-ta" placeholder="ideas, recordatorios…"
                    value={state.notes} onChange={e=>updateNotes(e.target.value)}/>
                </div>
              </div>
              <div className="dash-card" style={{flex:'0 0 auto'}}>
                <div className="dash-card-head"><span className="dash-tag">monomanía</span></div>
                <div className="dash-card-body" style={{paddingTop:6}}>
                  {activeMono
                    ? <div className="dash-mono-pill"><div className="dash-mono-title">{activeMono.title}</div></div>
                    : <div className="dash-mono-empty">sin monomanía activa</div>
                  }
                </div>
              </div>
            </div>

          </div>{/* fin row bottom */}
        </div>{/* fin dash-main */}

        {/* MODAL AJUSTES */}
        {settingsOpen && (
          <div className="dash-overlay" onClick={()=>setSettingsOpen(false)}>
            <div className="dash-modal" onClick={e=>e.stopPropagation()}>
              <button className="dash-modal-close" onClick={()=>setSettingsOpen(false)}><Icon name="close" size={16}/></button>
              <div className="dash-modal-title">ajustes</div>
              <div className="dash-modal-sub">Color del dashboard</div>
              <div className="dash-color-grid">
                {THEMES.map(t=>(
                  <div key={t.id} className={`dash-cdot${state.themeId===t.id?' sel':''}`}
                    style={{background:t.accent}} title={t.name}
                    onClick={()=>setState(s=>({...s,themeId:t.id}))}/>
                ))}
              </div>
              <div style={{fontSize:10,color:'var(--ink-faint)',marginBottom:18,fontStyle:'italic',fontFamily:'Fraunces,serif'}}>
                Las otras secciones tienen color fijo.
              </div>
              <div className="dash-modal-sub">Datos</div>
              <div className="dash-btn-row">
                <button className="dash-btn-s" onClick={exportData}>Exportar JSON</button>
                <label className="dash-btn-s" style={{cursor:'pointer',textAlign:'center'}}>
                  Importar JSON
                  <input type="file" accept="application/json" onChange={importData} style={{display:'none'}}/>
                </label>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}