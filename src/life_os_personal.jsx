import React, { useState, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────
// LIFE OS — PERSONAL (antes Second Brain)
// Color: rosa empolvado #C9A0A0 · 4 columnas · scroll suave
// La galería mensual alimenta el Dashboard automáticamente
// ─────────────────────────────────────────────────────────────────

const A = '#C9A0A0';
const S = '#F4E8E8';

const MONTHS = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
];

const PROJECT_STATUS = {
  active: { label: 'activo',   color: '#9DAE99' },
  paused: { label: 'pausado',  color: '#BFAE93' },
  done:   { label: 'terminado',color: '#B5AFA8' },
};

export const DEFAULT_PERSONAL = {
  gallery:   {},
  projects:  [],
  books:     [],
  films:     [],
  others:    [],
  wishlist:  [],
  ideas:     '',
  // Monomanías: [{ id, title, notes, active }]
  monomanias: [],
};

const CSS = `
  .pers__wrap {
    --pa: ${A}; --ps: ${S};
    --bg: #FBF8F4; --bg2: #F4EFE8; --panel: #FFFFFF;
    --ink: #2C2A26; --inks: #6B6661; --inkf: #B5AFA8; --line: #ECE6DC;
    display: flex; flex-direction: column; height: 100%; overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif; color: var(--ink);
    -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(900px 600px at 0% 0%, color-mix(in srgb, var(--ps) 45%, transparent), transparent 60%),
      radial-gradient(700px 500px at 100% 100%, color-mix(in srgb, var(--ps) 30%, transparent), transparent 55%),
      var(--bg);
  }

  /* TOPBAR */
  .pers__top {
    background: linear-gradient(135deg, var(--pa), color-mix(in srgb, var(--pa) 70%, white));
    padding: 0 28px; height: 68px; flex-shrink: 0;
    display: flex; align-items: center;
    box-shadow: 0 8px 24px -16px color-mix(in srgb, var(--pa) 80%, black);
  }
  .pers__title { font-family: 'Fraunces', serif; font-style: italic; font-size: 26px; color: white; }

  /* MAIN — 4 columnas */
  .pers__main {
    flex: 1; min-height: 0;
    display: grid; grid-template-columns: 200px 1fr 1fr 220px;
    gap: 14px; padding: 14px 18px 14px 14px; overflow: hidden;
  }

  /* COLUMNA CON SCROLL */
  .pers__col {
    display: flex; flex-direction: column; gap: 0; overflow: hidden;
  }
  .pers__card {
    background: var(--panel); border-radius: 20px; border: 1px solid var(--line);
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 4px 20px -16px rgba(60,50,40,.12);
    flex: 1;
  }
  .pers__card-h {
    padding: 11px 14px 9px; border-bottom: 1px solid var(--line);
    flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  }
  .pers__pill {
    background: var(--pa); color: white;
    font-family: 'Fraunces', serif; font-style: italic; font-size: 13px;
    padding: 3px 12px 4px; border-radius: 999px;
    box-shadow: 0 3px 8px -5px color-mix(in srgb, var(--pa) 60%, transparent);
  }
  .pers__scroll {
    flex: 1; overflow-y: auto; padding: 10px 12px;
    display: flex; flex-direction: column;
  }
  .pers__scroll::-webkit-scrollbar { width: 3px; }
  .pers__scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }

  /* ── INSPIRACIÓN MENSUAL ── */
  .pers__month-list { display: flex; flex-direction: column; gap: 2px; }
  .pers__month-row {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 6px; border-radius: 9px; cursor: pointer;
    transition: background .15s; border: none; background: transparent;
    text-align: left; width: 100%;
  }
  .pers__month-row:hover { background: var(--bg2); }
  .pers__month-row.pers__month--active { background: color-mix(in srgb, var(--ps) 55%, var(--bg2)); }
  .pers__month-row.pers__month--current .pers__month-name { color: var(--pa); font-weight: 500; }
  .pers__month-name {
    font-family: 'Fraunces', serif; font-style: italic; font-size: 13px;
    color: var(--ink); flex: 1; text-align: left;
  }
  .pers__month-count {
    font-size: 10px; color: var(--inkf);
    background: var(--bg2); border-radius: 20px; padding: 1px 7px;
  }

  /* Panel galería expandido */
  .pers__gallery-panel {
    background: var(--panel); border-radius: 14px; border: 1px solid var(--line);
    padding: 10px; margin-top: 4px; margin-bottom: 2px;
  }
  .pers__gallery-head {
    font-family: 'Fraunces', serif; font-style: italic;
    font-size: 12px; color: var(--pa); margin-bottom: 8px;
  }
  .pers__gallery-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-bottom: 8px;
  }
  .pers__gallery-img {
    aspect-ratio: 1; border-radius: 8px; object-fit: cover;
    width: 100%; display: block; cursor: pointer;
    border: 1.5px solid transparent; transition: border-color .18s;
  }
  .pers__gallery-img:hover { border-color: var(--pa); }
  .pers__gallery-empty {
    aspect-ratio: 1; border-radius: 8px; border: 1.5px dashed var(--line);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: border-color .18s; background: var(--bg2);
    font-size: 16px; color: var(--inkf);
  }
  .pers__gallery-empty:hover { border-color: var(--pa); color: var(--pa); }
  .pers__gallery-add {
    width: 100%; padding: 6px; border: 1.5px dashed var(--line);
    border-radius: 9px; background: transparent; color: var(--inks);
    font: inherit; font-size: 11px; font-family: 'Fraunces', serif; font-style: italic;
    cursor: pointer; transition: all .18s;
  }
  .pers__gallery-add:hover { border-color: var(--pa); color: var(--pa); background: var(--bg2); }

  /* ── PROYECTOS BALLENA ── */
  .pers__projects { display: flex; flex-direction: column; gap: 8px; }
  .pers__project {
    background: var(--bg2); border-radius: 14px; border: 1px solid transparent;
    transition: border-color .18s; overflow: hidden;
  }
  .pers__project:hover { border-color: var(--line); }
  .pers__project-head {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 12px 8px; cursor: pointer;
  }
  .pers__whale-icon { font-size: 14px; flex-shrink: 0; }
  .pers__project-title {
    font-family: 'Fraunces', serif; font-size: 14px; flex: 1; color: var(--ink);
  }
  .pers__status-badge {
    font-size: 9px; letter-spacing: .15em; text-transform: uppercase;
    padding: 2px 8px; border-radius: 20px; color: white; flex-shrink: 0;
    cursor: pointer;
  }
  .pers__project-del {
    background: none; border: none; cursor: pointer; color: var(--inkf);
    font-size: 14px; opacity: 0; transition: opacity .15s; padding: 0;
  }
  .pers__project:hover .pers__project-del { opacity: .5; }
  .pers__project-del:hover { opacity: 1 !important; }
  .pers__subtasks { padding: 0 12px 10px 32px; display: flex; flex-direction: column; gap: 3px; }
  .pers__subtask {
    display: flex; align-items: center; gap: 7px; padding: 3px 4px;
    border-radius: 7px; cursor: pointer; transition: background .15s;
    border: none; background: transparent; text-align: left; width: 100%;
  }
  .pers__subtask:hover { background: color-mix(in srgb, var(--ps) 25%, var(--bg2)); }
  .pers__sub-check {
    width: 13px; height: 13px; border-radius: 50%; border: 1.5px solid var(--line);
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: all .18s;
  }
  .pers__sub-check--done { background: var(--pa); border-color: var(--pa); }
  .pers__sub-txt { font-size: 11px; color: var(--inks); flex: 1; text-align: left; line-height: 1.4; }
  .pers__sub-txt--done { text-decoration: line-through; color: var(--inkf); }
  .pers__sub-del {
    background: none; border: none; cursor: pointer; color: var(--inkf);
    font-size: 12px; opacity: 0; transition: opacity .15s; padding: 0;
  }
  .pers__subtask:hover .pers__sub-del { opacity: .5; }
  .pers__sub-add {
    display: flex; gap: 4px; margin-top: 4px; padding-left: 0;
  }
  .pers__sub-in {
    flex: 1; border: 1px solid var(--line); border-radius: 7px;
    padding: 4px 8px; font: inherit; font-size: 11px; color: var(--ink);
    background: white; outline: none;
  }
  .pers__sub-in::placeholder { color: var(--inkf); font-style: italic; font-family: 'Fraunces', serif; }
  .pers__sub-in:focus { border-color: var(--pa); }
  .pers__sub-btn {
    background: var(--pa); border: none; border-radius: 7px; color: white;
    width: 22px; flex-shrink: 0; cursor: pointer; font-size: 14px; transition: opacity .18s;
  }
  .pers__sub-btn:hover { opacity: .85; }

  /* Form nuevo proyecto */
  .pers__proj-form {
    background: var(--bg2); border-radius: 12px; padding: 10px;
    border: 1.5px dashed var(--line); display: flex; gap: 6px; align-items: center;
  }
  .pers__proj-in {
    flex: 1; border: 1.5px solid var(--line); border-radius: 9px;
    padding: 7px 10px; font: inherit; font-size: 13px; color: var(--ink);
    background: white; outline: none; font-family: 'Fraunces', serif; font-style: italic;
  }
  .pers__proj-in::placeholder { color: var(--inkf); }
  .pers__proj-in:focus { border-color: var(--pa); }
  .pers__proj-save {
    background: var(--pa); border: none; border-radius: 9px; color: white;
    padding: 7px 14px; font: inherit; font-size: 12px; font-family: 'Fraunces', serif;
    font-style: italic; cursor: pointer; transition: opacity .18s; flex-shrink: 0;
  }
  .pers__proj-save:hover { opacity: .88; }
  .pers__add-proj-btn {
    display: flex; align-items: center; justify-content: center; gap: 5px;
    width: 100%; padding: 8px; border-radius: 10px;
    border: 1.5px dashed var(--line); background: transparent;
    color: var(--inks); font: inherit; font-size: 12px; cursor: pointer;
    transition: all .18s; font-family: 'Fraunces', serif; font-style: italic;
  }
  .pers__add-proj-btn:hover { border-color: var(--pa); color: var(--pa); background: var(--bg2); }

  /* ── INTERESES ── */
  .pers__interest-section { margin-bottom: 14px; }
  .pers__interest-section:last-child { margin-bottom: 0; }
  .pers__interest-lbl {
    font-family: 'Fraunces', serif; font-style: italic; font-size: 15px;
    color: var(--pa); margin-bottom: 6px; padding-bottom: 5px;
    border-bottom: 1px solid var(--line);
  }
  .pers__interest-list { display: flex; flex-direction: column; gap: 1px; }
  .pers__interest-item {
    display: flex; align-items: center; gap: 7px; padding: 4px 5px;
    border-radius: 8px; cursor: pointer; transition: background .15s;
    border: none; background: transparent; text-align: left; width: 100%;
  }
  .pers__interest-item:hover { background: var(--bg2); }
  .pers__int-check {
    width: 13px; height: 13px; border-radius: 50%; border: 1.5px solid var(--line);
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: all .18s;
  }
  .pers__int-check--done { background: var(--pa); border-color: var(--pa); }
  .pers__int-txt { font-size: 12px; flex: 1; color: var(--ink); text-align: left; }
  .pers__int-txt--done { text-decoration: line-through; color: var(--inkf); }
  .pers__int-del {
    background: none; border: none; cursor: pointer; color: var(--inkf);
    font-size: 13px; opacity: 0; transition: opacity .15s; padding: 0;
  }
  .pers__interest-item:hover .pers__int-del { opacity: .5; }
  .pers__int-del:hover { opacity: 1 !important; }
  .pers__int-add { display: flex; gap: 4px; margin-top: 5px; }
  .pers__int-in {
    flex: 1; border: 1px solid var(--line); border-radius: 8px;
    padding: 5px 8px; font: inherit; font-size: 11px; color: var(--ink);
    background: var(--bg2); outline: none;
  }
  .pers__int-in::placeholder { color: var(--inkf); font-style: italic; font-family: 'Fraunces', serif; }
  .pers__int-in:focus { border-color: var(--pa); }
  .pers__int-btn {
    background: var(--pa); border: none; border-radius: 8px; color: white;
    width: 24px; flex-shrink: 0; cursor: pointer; font-size: 15px; transition: opacity .18s;
  }
  .pers__int-btn:hover { opacity: .85; }

  /* ── WISHLIST ── */
  .pers__wish-list { display: flex; flex-direction: column; gap: 2px; }
  .pers__wish-item {
    display: flex; align-items: center; gap: 7px; padding: 5px 5px;
    border-radius: 9px; cursor: pointer; transition: background .15s;
    border: none; background: transparent; text-align: left; width: 100%;
  }
  .pers__wish-item:hover { background: var(--bg2); }
  .pers__wish-check {
    width: 14px; height: 14px; border-radius: 4px; border: 1.5px solid var(--line);
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: all .18s;
  }
  .pers__wish-check--done { background: var(--pa); border-color: var(--pa); }
  .pers__wish-txt { font-size: 12px; flex: 1; color: var(--ink); text-align: left; }
  .pers__wish-txt--done { text-decoration: line-through; color: var(--inkf); }
  .pers__wish-del {
    background: none; border: none; cursor: pointer; color: var(--inkf);
    font-size: 13px; opacity: 0; transition: opacity .15s; padding: 0;
  }
  .pers__wish-item:hover .pers__wish-del { opacity: .5; }
  .pers__wish-del:hover { opacity: 1 !important; }
  .pers__wish-add { display: flex; gap: 5px; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--line); }
  .pers__wish-in {
    flex: 1; border: 1.5px solid var(--line); border-radius: 9px;
    padding: 6px 9px; font: inherit; font-size: 12px; color: var(--ink);
    background: var(--bg2); outline: none;
  }
  .pers__wish-in::placeholder { color: var(--inkf); font-style: italic; font-family: 'Fraunces', serif; }
  .pers__wish-in:focus { border-color: var(--pa); }
  .pers__wish-btn {
    background: var(--pa); border: none; border-radius: 9px; color: white;
    padding: 6px 10px; cursor: pointer; font-size: 15px; transition: opacity .18s;
  }
  .pers__wish-btn:hover { opacity: .85; }

  /* IDEAS */
  .pers__ideas-card {
    background: var(--panel); border-radius: 20px; border: 1px solid var(--line);
    display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0;
    margin-top: 14px; min-height: 120px;
    box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 4px 20px -16px rgba(60,50,40,.12);
  }
  .pers__ideas-body { flex: 1; padding: 10px 12px; }
  .pers__ideas-ta {
    width: 100%; height: 100%; min-height: 80px; resize: none; border: none;
    outline: none; font: inherit; font-size: 12px; color: var(--ink);
    background: transparent; line-height: 1.7;
  }
  .pers__ideas-ta::placeholder { color: var(--inkf); font-style: italic; font-family: 'Fraunces', serif; }


  /* MONOMANÍAS */
  .pers__mono-item { background: var(--bg2); border-radius: 12px; padding: 10px 12px; border: 1px solid transparent; transition: border-color .18s; margin-bottom: 6px; display: flex; flex-direction: column; gap: 5px; }
  .pers__mono-item:hover { border-color: var(--line); }
  .pers__mono-item.pers__mono--active { background: color-mix(in srgb, var(--ps) 40%, var(--bg2)); border-color: color-mix(in srgb, var(--pa) 25%, var(--line)); }
  .pers__mono-head { display: flex; align-items: center; gap: 8px; }
  .pers__mono-title-txt { font-family: 'Fraunces', serif; font-size: 14px; flex: 1; color: var(--ink); }
  .pers__mono-badge { font-size: 9px; letter-spacing: .15em; text-transform: uppercase; padding: 2px 8px; border-radius: 20px; cursor: pointer; border: none; transition: all .2s; flex-shrink: 0; }
  .pers__mono-badge--on  { background: var(--pa); color: white; }
  .pers__mono-badge--off { background: var(--line); color: var(--inks); }
  .pers__mono-notes { font-size: 11px; color: var(--inks); line-height: 1.5; font-style: italic; font-family: 'Fraunces', serif; }
  .pers__mono-del { background: none; border: none; cursor: pointer; color: var(--inkf); font-size: 14px; opacity: 0; transition: opacity .15s; padding: 0; }
  .pers__mono-item:hover .pers__mono-del { opacity: .5; }
  .pers__mono-form { background: var(--bg2); border-radius: 12px; padding: 10px; border: 1.5px dashed var(--line); display: flex; flex-direction: column; gap: 6px; margin-bottom: 6px; }
  .pers__mono-in { border: 1.5px solid var(--line); border-radius: 9px; padding: 7px 10px; font: inherit; font-size: 13px; color: var(--ink); background: white; outline: none; font-family: 'Fraunces', serif; font-style: italic; }
  .pers__mono-in::placeholder { color: var(--inkf); }
  .pers__mono-in:focus { border-color: var(--pa); }
  .pers__mono-notes-in { border: 1.5px solid var(--line); border-radius: 9px; padding: 7px 10px; font: inherit; font-size: 12px; color: var(--ink); background: white; outline: none; resize: none; min-height: 52px; }
  .pers__mono-notes-in:focus { border-color: var(--pa); }
  .pers__mono-form-actions { display: flex; gap: 6px; }
  .pers__mono-save { flex: 1; background: var(--pa); border: none; border-radius: 9px; color: white; padding: 7px; font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; cursor: pointer; }
  .pers__mono-cancel { background: transparent; border: 1.5px solid var(--line); border-radius: 9px; padding: 7px 12px; font: inherit; font-size: 12px; color: var(--inks); cursor: pointer; }
  .pers__mono-add-btn { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; padding: 8px; border-radius: 10px; border: 1.5px dashed var(--line); background: transparent; color: var(--inks); font: inherit; font-size: 12px; cursor: pointer; transition: all .18s; font-family: 'Fraunces', serif; font-style: italic; }
  .pers__mono-add-btn:hover { border-color: var(--pa); color: var(--pa); background: var(--bg2); }

  /* MISC */
  .pers__empty { font-family: 'Fraunces', serif; font-style: italic; font-size: 12px; color: var(--inkf); padding: 4px 0; }
  .pers__check-svg { display: flex; align-items: center; justify-content: center; }
`;

const CheckSVG = () => (
  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────
export default function PersonalSection({ state, setState }) {
  const currentMonth = new Date().getMonth(); // 0-indexed

  const [openMonth,      setOpenMonth]      = useState(currentMonth);
  const [newProject,     setNewProject]     = useState('');
  const [showProjForm,   setShowProjForm]   = useState(false);
  const [subInputs,      setSubInputs]      = useState({});   // { projectId: '' }
  const [newBook,        setNewBook]        = useState('');
  const [newFilm,        setNewFilm]        = useState('');
  const [newOther,       setNewOther]       = useState('');
  const [newWish,        setNewWish]        = useState('');

  const [showMonoForm,   setShowMonoForm]   = useState(false);
  const [newMono,        setNewMono]        = useState({ title: '', notes: '' });
  const fileRef = useRef(null);

  const personal    = state.personal || DEFAULT_PERSONAL;
  const setPersonal = updater => setState(s => ({
    ...s,
    personal: typeof updater === 'function' ? updater(s.personal || DEFAULT_PERSONAL) : updater,
  }));

  // ── Galería mensual ───────────────────────────────────────────
  const gallery = personal.gallery || {};

  const handleImgUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setPersonal(p => {
          const monthImgs = [...(p.gallery[openMonth] || []), ev.target.result];
          const newGallery = { ...p.gallery, [openMonth]: monthImgs };
          // Sincronizar con dashboard: si es el mes actual, actualizar inspirationImage
          const newState = { ...p, gallery: newGallery };
          return newState;
        });
        // Actualizar imagen del dashboard si es el mes actual
        if (openMonth === currentMonth) {
          setState(s => {
            const imgs = [...((s.personal?.gallery?.[currentMonth]) || []), ev.target.result];
            // Rotar: usar la imagen correspondiente al día del mes
            const dayIdx = (new Date().getDate() - 1) % imgs.length;
            return { ...s, inspirationImage: imgs[dayIdx] || null };
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImg = (monthIdx, imgIdx) => {
    setPersonal(p => {
      const imgs = [...(p.gallery[monthIdx] || [])];
      imgs.splice(imgIdx, 1);
      const newGallery = { ...p.gallery, [monthIdx]: imgs };
      return { ...p, gallery: newGallery };
    });
    // Actualizar dashboard si es el mes actual
    if (monthIdx === currentMonth) {
      setState(s => {
        const imgs = [...((s.personal?.gallery?.[currentMonth]) || [])];
        imgs.splice(imgIdx, 1);
        const dayIdx = imgs.length > 0 ? (new Date().getDate() - 1) % imgs.length : -1;
        return { ...s, inspirationImage: dayIdx >= 0 ? imgs[dayIdx] : null };
      });
    }
  };

  // ── Proyectos Ballena ─────────────────────────────────────────
  const projects = personal.projects || [];

  const addProject = () => {
    const title = newProject.trim();
    if (!title) return;
    setPersonal(p => ({
      ...p,
      projects: [...(p.projects || []), { id: `pr${Date.now()}`, title, status: 'active', subtasks: [] }],
    }));
    setNewProject('');
    setShowProjForm(false);
  };

  const deleteProject = id => setPersonal(p => ({ ...p, projects: p.projects.filter(x => x.id !== id) }));

  const cycleStatus = id => setPersonal(p => ({
    ...p,
    projects: p.projects.map(pr => {
      if (pr.id !== id) return pr;
      const order = ['active', 'paused', 'done'];
      const next  = order[(order.indexOf(pr.status) + 1) % order.length];
      return { ...pr, status: next };
    }),
  }));

  const addSubtask = (projId) => {
    const text = (subInputs[projId] || '').trim();
    if (!text) return;
    setPersonal(p => ({
      ...p,
      projects: p.projects.map(pr =>
        pr.id !== projId ? pr : {
          ...pr,
          subtasks: [...(pr.subtasks || []), { id: `st${Date.now()}`, text, done: false }],
        }
      ),
    }));
    setSubInputs(v => ({ ...v, [projId]: '' }));
  };

  const toggleSubtask = (projId, subId) => setPersonal(p => ({
    ...p,
    projects: p.projects.map(pr =>
      pr.id !== projId ? pr : {
        ...pr,
        subtasks: pr.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s),
      }
    ),
  }));

  const deleteSubtask = (projId, subId) => setPersonal(p => ({
    ...p,
    projects: p.projects.map(pr =>
      pr.id !== projId ? pr : { ...pr, subtasks: pr.subtasks.filter(s => s.id !== subId) }
    ),
  }));

  // ── Intereses helpers ─────────────────────────────────────────
  const makeInterestHandlers = (key, newVal, setNew) => ({
    add: () => {
      const text = newVal.trim();
      if (!text) return;
      setPersonal(p => ({ ...p, [key]: [...(p[key] || []), { id: `i${Date.now()}`, text, done: false }] }));
      setNew('');
    },
    toggle: id => setPersonal(p => ({ ...p, [key]: p[key].map(x => x.id === id ? { ...x, done: !x.done } : x) })),
    del:    id => setPersonal(p => ({ ...p, [key]: p[key].filter(x => x.id !== id) })),
  });

  const booksH  = makeInterestHandlers('books',  newBook,  setNewBook);
  const filmsH  = makeInterestHandlers('films',  newFilm,  setNewFilm);
  const othersH = makeInterestHandlers('others', newOther, setNewOther);

  // ── Wishlist ──────────────────────────────────────────────────
  const addWish    = () => { const t=newWish.trim(); if(!t) return; setPersonal(p=>({...p,wishlist:[...(p.wishlist||[]),{id:`w${Date.now()}`,text:t,done:false}]})); setNewWish(''); };
  const toggleWish = id => setPersonal(p => ({ ...p, wishlist: p.wishlist.map(x => x.id === id ? { ...x, done: !x.done } : x) }));
  const deleteWish = id => setPersonal(p => ({ ...p, wishlist: p.wishlist.filter(x => x.id !== id) }));


  // ── Monomanías ────────────────────────────────────────────────
  const monomanias = personal.monomanias || [];
  const saveMono = () => {
    const title = newMono.title.trim();
    if (!title) return;
    setPersonal(p => ({
      ...p,
      monomanias: [...(p.monomanias || []), { id: `mn${Date.now()}`, title, notes: newMono.notes.trim(), active: false }],
    }));
    setNewMono({ title: '', notes: '' });
    setShowMonoForm(false);
  };
  const toggleMono = id => {
    setPersonal(p => {
      const updated = (p.monomanias || []).map(m =>
        m.id === id ? { ...m, active: !m.active } : { ...m, active: false }
      );
      // Sync active mono to global state for dashboard
      const active = updated.find(m => m.active) || null;
      setState(s => ({ ...s, personal: { ...(s.personal || {}), monomanias: updated } }));
      return { ...p, monomanias: updated };
    });
  };
  const deleteMono = id => setPersonal(p => ({ ...p, monomanias: (p.monomanias || []).filter(m => m.id !== id) }));

  const books   = personal.books   || [];
  const films   = personal.films   || [];
  const others  = personal.others  || [];
  const wishlist= personal.wishlist|| [];
  const ideas   = personal.ideas   || '';

  // ── InterestSection helper component ─────────────────────────
  const InterestBlock = ({ label, items, handlers, newVal, setNew }) => (
    <div className="pers__interest-section">
      <div className="pers__interest-lbl">{label}</div>
      <div className="pers__interest-list">
        {items.length === 0 && <div className="pers__empty">Sin añadir todavía.</div>}
        {items.map(item => (
          <button key={item.id} className="pers__interest-item" onClick={() => handlers.toggle(item.id)}>
            <div className={`pers__int-check${item.done?' pers__int-check--done':''}`}>
              {item.done && <CheckSVG/>}
            </div>
            <span className={`pers__int-txt${item.done?' pers__int-txt--done':''}`}>{item.text}</span>
            <span className="pers__int-del" onClick={e=>{e.stopPropagation();handlers.del(item.id);}}>×</span>
          </button>
        ))}
      </div>
      <div className="pers__int-add">
        <input className="pers__int-in" placeholder={`añadir ${label.toLowerCase()}…`}
          value={newVal} onChange={e=>setNew(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&handlers.add()}/>
        <button className="pers__int-btn" onClick={handlers.add}>+</button>
      </div>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleImgUpload}/>
      <div className="pers__wrap">

        {/* TOPBAR */}
        <div className="pers__top">
          <span className="pers__title">personal</span>
        </div>

        {/* MAIN */}
        <div className="pers__main">

          {/* ── COL 1: INSPIRACIÓN MENSUAL ── */}
          <div className="pers__col">
            <div className="pers__card">
              <div className="pers__card-h">
                <span className="pers__pill">inspiración</span>
              </div>
              <div className="pers__scroll">
                <div className="pers__month-list">
                  {MONTHS.map((month, idx) => {
                    const imgs      = gallery[idx] || [];
                    const isOpen    = openMonth === idx;
                    const isCurrent = idx === currentMonth;
                    return (
                      <React.Fragment key={idx}>
                        <button
                          className={`pers__month-row${isOpen?' pers__month--active':''}${isCurrent?' pers__month--current':''}`}
                          onClick={() => setOpenMonth(isOpen ? -1 : idx)}
                        >
                          <span className="pers__month-name">{month}</span>
                          {imgs.length > 0 && (
                            <span className="pers__month-count">{imgs.length}</span>
                          )}
                        </button>

                        {isOpen && (
                          <div className="pers__gallery-panel">
                            <div className="pers__gallery-head">{month} {new Date().getFullYear()}</div>
                            {imgs.length > 0 && (
                              <div className="pers__gallery-grid">
                                {imgs.map((src, i) => (
                                  <div key={i} style={{position:'relative'}}>
                                    <img className="pers__gallery-img" src={src} alt=""
                                      onClick={() => removeImg(idx, i)}
                                      title="Clic para eliminar"/>
                                    <div style={{
                                      position:'absolute',top:3,right:3,
                                      background:'rgba(44,42,38,.55)',borderRadius:'50%',
                                      width:18,height:18,display:'flex',alignItems:'center',
                                      justifyContent:'center',color:'white',fontSize:11,cursor:'pointer'
                                    }} onClick={() => removeImg(idx, i)}>×</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button className="pers__gallery-add" onClick={() => fileRef.current?.click()}>
                              + añadir imagen{isCurrent ? ' (actualiza dashboard)' : ''}
                            </button>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── COL 2: PROYECTOS BALLENA ── */}
          <div className="pers__col">
            <div className="pers__card">
              <div className="pers__card-h">
                <span className="pers__pill">proyectos ballena</span>
              </div>
              <div className="pers__scroll">
                <div className="pers__projects">
                  {projects.length === 0 && !showProjForm && (
                    <div className="pers__empty">Ningún proyecto todavía.</div>
                  )}

                  {projects.map(pr => (
                    <div key={pr.id} className="pers__project">
                      <div className="pers__project-head">
                        <span className="pers__whale-icon">🐋</span>
                        <span className="pers__project-title">{pr.title}</span>
                        <span
                          className="pers__status-badge"
                          style={{ background: PROJECT_STATUS[pr.status]?.color || A }}
                          onClick={e => { e.stopPropagation(); cycleStatus(pr.id); }}
                          title="Clic para cambiar estado"
                        >
                          {PROJECT_STATUS[pr.status]?.label}
                        </span>
                        <button className="pers__project-del" onClick={() => deleteProject(pr.id)}>×</button>
                      </div>

                      <div className="pers__subtasks">
                        {(pr.subtasks || []).map(s => (
                          <button key={s.id} className="pers__subtask" onClick={() => toggleSubtask(pr.id, s.id)}>
                            <div className={`pers__sub-check${s.done?' pers__sub-check--done':''}`}>
                              {s.done && <CheckSVG/>}
                            </div>
                            <span className={`pers__sub-txt${s.done?' pers__sub-txt--done':''}`}>{s.text}</span>
                            <span className="pers__sub-del" onClick={e=>{e.stopPropagation();deleteSubtask(pr.id,s.id);}}>×</span>
                          </button>
                        ))}
                        <div className="pers__sub-add">
                          <input
                            className="pers__sub-in"
                            placeholder="añadir subtarea…"
                            value={subInputs[pr.id] || ''}
                            onChange={e => setSubInputs(v => ({ ...v, [pr.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && addSubtask(pr.id)}
                          />
                          <button className="pers__sub-btn" onClick={() => addSubtask(pr.id)}>+</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {showProjForm && (
                    <div className="pers__proj-form">
                      <input
                        className="pers__proj-in"
                        placeholder="Nombre del proyecto…"
                        value={newProject}
                        onChange={e => setNewProject(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addProject()}
                        autoFocus
                      />
                      <button className="pers__proj-save" onClick={addProject}>crear</button>
                    </div>
                  )}

                  {!showProjForm && (
                    <button className="pers__add-proj-btn" onClick={() => setShowProjForm(true)}>
                      + nuevo proyecto ballena
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── COL 3: INTERESES ── */}
          <div className="pers__col">
            <div className="pers__card">
              <div className="pers__card-h">
                <span className="pers__pill">intereses</span>
              </div>
              <div className="pers__scroll">
                <InterestBlock label="libros"    items={books}  handlers={booksH}  newVal={newBook}  setNew={setNewBook}/>
                <InterestBlock label="películas" items={films}  handlers={filmsH}  newVal={newFilm}  setNew={setNewFilm}/>
                <InterestBlock label="otros"     items={others} handlers={othersH} newVal={newOther} setNew={setNewOther}/>
              </div>
            </div>
          </div>

          {/* ── COL 4: WISHLIST + IDEAS ── */}
          <div className="pers__col">

            {/* MONOMANÍAS */}
            <div className="pers__side-card" style={{ flex: '0 0 auto', marginBottom: 14 }}>
              <div className="pers__side-card-h">
                <span className="pers__pill">monomanías</span>
              </div>
              <div style={{ padding: '8px 12px', overflowY: 'auto', maxHeight: 220 }}>
                {monomanias.length === 0 && !showMonoForm && (
                  <div className="pers__empty">Ninguna monomanía todavía.</div>
                )}
                {monomanias.map(m => (
                  <div key={m.id} className={`pers__mono-item${m.active ? ' pers__mono--active' : ''}`}>
                    <div className="pers__mono-head">
                      <span className="pers__mono-title-txt">{m.title}</span>
                      <button
                        className={`pers__mono-badge ${m.active ? 'pers__mono-badge--on' : 'pers__mono-badge--off'}`}
                        onClick={() => toggleMono(m.id)}
                      >{m.active ? 'activa' : 'inactiva'}</button>
                      <button className="pers__mono-del" onClick={() => deleteMono(m.id)}>×</button>
                    </div>
                    {m.notes && <div className="pers__mono-notes">{m.notes}</div>}
                  </div>
                ))}
                {showMonoForm && (
                  <div className="pers__mono-form">
                    <input className="pers__mono-in" placeholder="Título de la monomanía…"
                      value={newMono.title} autoFocus
                      onChange={e => setNewMono(v => ({ ...v, title: e.target.value }))}/>
                    <textarea className="pers__mono-notes-in" placeholder="Notas opcionales…"
                      value={newMono.notes}
                      onChange={e => setNewMono(v => ({ ...v, notes: e.target.value }))}/>
                    <div className="pers__mono-form-actions">
                      <button className="pers__mono-save" onClick={saveMono}>guardar</button>
                      <button className="pers__mono-cancel" onClick={() => { setShowMonoForm(false); setNewMono({ title:'', notes:'' }); }}>cancelar</button>
                    </div>
                  </div>
                )}
                {!showMonoForm && (
                  <button className="pers__mono-add-btn" onClick={() => setShowMonoForm(true)}>+ nueva monomanía</button>
                )}
              </div>
            </div>

            {/* WISHLIST */}
            <div className="pers__card">
              <div className="pers__card-h">
                <span className="pers__pill">wishlist</span>
              </div>
              <div className="pers__scroll">
                <div className="pers__wish-list">
                  {wishlist.length === 0 && <div className="pers__empty">La lista está vacía.</div>}
                  {wishlist.map(item => (
                    <button key={item.id} className="pers__wish-item" onClick={() => toggleWish(item.id)}>
                      <div className={`pers__wish-check${item.done?' pers__wish-check--done':''}`}>
                        {item.done && <CheckSVG/>}
                      </div>
                      <span className={`pers__wish-txt${item.done?' pers__wish-txt--done':''}`}>{item.text}</span>
                      <span className="pers__wish-del" onClick={e=>{e.stopPropagation();deleteWish(item.id);}}>×</span>
                    </button>
                  ))}
                </div>
                <div className="pers__wish-add">
                  <input className="pers__wish-in" placeholder="añadir a la lista…"
                    value={newWish} onChange={e=>setNewWish(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&addWish()}/>
                  <button className="pers__wish-btn" onClick={addWish}>+</button>
                </div>
              </div>
            </div>

            {/* IDEAS */}
            <div className="pers__ideas-card">
              <div className="pers__card-h">
                <span className="pers__pill">ideas</span>
              </div>
              <div className="pers__ideas-body">
                <textarea
                  className="pers__ideas-ta"
                  placeholder="Ideas, reflexiones, cosas que no quieres olvidar…"
                  value={ideas}
                  onChange={e => setPersonal(p => ({ ...p, ideas: e.target.value }))}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
