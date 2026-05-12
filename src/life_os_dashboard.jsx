import React, { useState, useRef, useCallback } from 'react';

// ─── Utilidades ────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const todayDow = () => new Date().getDay();

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DAYS_SHORT = ['D','L','M','X','J','V','S'];

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Iconos SVG ────────────────────────────────────────────────────────────────
const IconPlus = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconCheck = ({size=13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const IconStar = ({size=13, filled}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IconTrash = ({size=13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const IconEdit = ({size=13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconRepeat = ({size=13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
  </svg>
);
const IconClose = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const IconDrag = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="9" cy="7" r="1" fill="currentColor"/><circle cx="15" cy="7" r="1" fill="currentColor"/>
    <circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/>
    <circle cx="9" cy="17" r="1" fill="currentColor"/><circle cx="15" cy="17" r="1" fill="currentColor"/>
  </svg>
);

// ─── Componente Tarjeta ─────────────────────────────────────────────────────────
const Card = ({ children, style = {}, className = '' }) => (
  <div className={`dash-card ${className}`} style={{
    background: '#FFFCF9',
    borderRadius: 20,
    border: '1px solid rgba(0,0,0,0.055)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    padding: '18px 20px',
    ...style,
  }}>
    {children}
  </div>
);

const CardLabel = ({ children, color }) => (
  <div style={{
    fontFamily: "'Fraunces', serif",
    fontStyle: 'italic',
    fontSize: 11,
    letterSpacing: '0.06em',
    color: color ?? '#9A8A80',
    textTransform: 'uppercase',
    marginBottom: 10,
  }}>
    {children}
  </div>
);

// ─── Modal de tarea (nueva / edición) ──────────────────────────────────────────
const TaskModal = ({ task, onSave, onClose, accent }) => {
  const [text, setText] = useState(task?.text ?? '');
  const [priority, setPriority] = useState(task?.priority ?? false);
  const [recDays, setRecDays] = useState(task?.recurrence?.days ?? []);

  const toggleDay = (d) => setRecDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  );

  const save = () => {
    if (!text.trim()) return;
    onSave({
      id: task?.id ?? uid(),
      text: text.trim(),
      done: task?.done ?? false,
      priority,
      recurrence: recDays.length > 0 ? { days: recDays } : null,
    });
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)',
        zIndex: 200, backdropFilter: 'blur(2px)',
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#FDFAF7',
        borderRadius: 20,
        border: `1px solid ${accent}30`,
        boxShadow: `0 20px 48px rgba(0,0,0,0.12)`,
        padding: '28px 30px',
        width: 380,
        zIndex: 201,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 17, color: '#3A3230' }}>
            {task ? 'Editar tarea' : 'Nueva tarea'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A80' }}>
            <IconClose />
          </button>
        </div>

        <input
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="Descripción de la tarea..."
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 14px',
            borderRadius: 10,
            border: `1.5px solid ${accent}30`,
            background: '#FAF7F3',
            fontSize: 14, color: '#3A3230',
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            marginBottom: 16,
          }}
        />

        {/* Prioridad */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 20 }}>
          <div style={{
            width: 18, height: 18, borderRadius: 5,
            border: `1.5px solid ${priority ? accent : '#C0B0A8'}`,
            background: priority ? accent : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }} onClick={() => setPriority(p => !p)}>
            {priority && <IconCheck size={11} />}
          </div>
          <span style={{ fontSize: 13, color: '#5A4A42' }}>Tarea prioritaria</span>
        </label>

        {/* Recurrencia */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.07em', color: '#9A8A80', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconRepeat size={11} /> Repetir cada semana
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {DAYS_SHORT.map((d, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                style={{
                  width: 32, height: 32,
                  borderRadius: 8,
                  border: `1.5px solid ${recDays.includes(i) ? accent : '#D8CEC8'}`,
                  background: recDays.includes(i) ? `${accent}20` : 'transparent',
                  color: recDays.includes(i) ? accent : '#9A8A80',
                  fontSize: 11, fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {d}
              </button>
            ))}
          </div>
          {recDays.length > 0 && (
            <div style={{ fontSize: 11, color: accent, marginTop: 8 }}>
              Repite cada {recDays.map(d => DAYS_ES[d]).join(', ')}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 10,
            border: '1px solid #D8CEC8', background: 'transparent',
            color: '#9A8A80', fontSize: 13, cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={save} style={{
            padding: '9px 18px', borderRadius: 10,
            border: 'none', background: accent,
            color: '#fff', fontSize: 13, cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}>
            Guardar
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Modal de libro ─────────────────────────────────────────────────────────────
const BookModal = ({ book, slot, onSave, onClose, accent }) => {
  const [form, setForm] = useState({ ...book });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const LABELS = { kindle: 'Kindle', paper: 'Papel', audio: 'Audiolibro / Otro' };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)',
        zIndex: 200, backdropFilter: 'blur(2px)',
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#FDFAF7',
        borderRadius: 20,
        border: `1px solid ${accent}30`,
        boxShadow: `0 20px 48px rgba(0,0,0,0.12)`,
        padding: '28px 30px',
        width: 360,
        zIndex: 201,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 17, color: '#3A3230' }}>
            {LABELS[slot]}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A80' }}>
            <IconClose />
          </button>
        </div>

        {['title','author'].map(k => (
          <input
            key={k}
            value={form[k]}
            onChange={set(k)}
            placeholder={k === 'title' ? 'Título...' : 'Autor/a...'}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '9px 14px', borderRadius: 10,
              border: `1.5px solid ${accent}25`, background: '#FAF7F3',
              fontSize: 13, color: '#3A3230',
              fontFamily: "'Inter', sans-serif", outline: 'none',
              marginBottom: 10,
            }}
          />
        ))}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['currentPage','totalPages'].map(k => (
            <input
              key={k}
              type="number" min="0"
              value={form[k]}
              onChange={set(k)}
              placeholder={k === 'currentPage' ? 'Página actual' : 'Total páginas'}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 10,
                border: `1.5px solid ${accent}25`, background: '#FAF7F3',
                fontSize: 13, color: '#3A3230',
                fontFamily: "'Inter', sans-serif", outline: 'none',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 10,
            border: '1px solid #D8CEC8', background: 'transparent',
            color: '#9A8A80', fontSize: 13, cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={() => { onSave(form); onClose(); }} style={{
            padding: '9px 18px', borderRadius: 10,
            border: 'none', background: accent,
            color: '#fff', fontSize: 13, cursor: 'pointer',
          }}>
            Guardar
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Barra de progreso ──────────────────────────────────────────────────────────
const ProgressBar = ({ value, accent, height = 4 }) => (
  <div style={{
    width: '100%', height,
    borderRadius: height,
    background: `${accent}20`,
    overflow: 'hidden',
  }}>
    <div style={{
      width: `${Math.min(value, 100)}%`, height: '100%',
      background: accent,
      borderRadius: height,
      transition: 'width 0.5s ease',
    }} />
  </div>
);

// ─── Tarjeta de libro ───────────────────────────────────────────────────────────
const BookCard = ({ slot, book, accent, onEdit, onPageUp }) => {
  const pct = book.totalPages > 0
    ? Math.round((book.currentPage / book.totalPages) * 100)
    : 0;
  const LABELS = { kindle: 'Kindle', paper: 'Papel', audio: 'Otro' };

  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 14,
      border: `1px solid ${accent}20`,
      background: `${accent}08`,
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 10, letterSpacing: '0.07em', color: accent, textTransform: 'uppercase', fontWeight: '500' }}>
          {LABELS[slot]}
        </span>
        <button onClick={onEdit} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: `${accent}70`, padding: 2,
        }}>
          <IconEdit size={11} />
        </button>
      </div>

      {book.title ? (
        <>
          <div style={{
            fontFamily: "'Fraunces', serif", fontStyle: 'italic',
            fontSize: 13, color: '#3A3230', marginBottom: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {book.title}
          </div>
          <div style={{ fontSize: 11, color: '#9A8A80', marginBottom: 8 }}>
            {book.author}
          </div>
          <ProgressBar value={pct} accent={accent} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: '#9A8A80' }}>
              p.{book.currentPage} / {book.totalPages}
            </span>
            <button onClick={onPageUp} style={{
              padding: '3px 8px', borderRadius: 6,
              border: `1px solid ${accent}30`, background: 'transparent',
              color: accent, fontSize: 11, cursor: 'pointer',
            }}>
              +1
            </button>
          </div>
        </>
      ) : (
        <button onClick={onEdit} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: `${accent}60`, fontSize: 12, padding: 0, marginTop: 4,
        }}>
          Añadir libro...
        </button>
      )}
    </div>
  );
};

// ─── ESTADOS EMOCIONALES ────────────────────────────────────────────────────────
const MOODS = [
  { id: 'bad',       label: 'Mal',       color: '#B88A75' },
  { id: 'normal',    label: 'Normal',    color: '#A89B8C' },
  { id: 'good',      label: 'Bien',      color: '#9FB1B8' },
  { id: 'excellent', label: 'Excelente', color: '#A89DB3' },
];

// ─── DASHBOARD ──────────────────────────────────────────────────────────────────
export default function Dashboard({ state, setState, theme, themeId, themes }) {
  const accent = theme.accent;
  const now = new Date();
  const todayStr = today();
  const dowIdx = now.getDay();

  // Modals
  const [taskModal, setTaskModal]   = useState(null); // null | 'new' | task obj
  const [bookModal, setBookModal]   = useState(null); // null | slot key
  const [agendaInput, setAgendaInput] = useState({ time: '', text: '' });

  // Drag & drop tasks
  const dragIdx = useRef(null);
  const dragOver = useRef(null);

  // ── Tareas ──────────────────────────────────────────────────────────────────
  const priorityCount = state.tasks.filter(t => t.priority).length;

  const saveTask = (task) => {
    setState(s => {
      const exists = s.tasks.find(t => t.id === task.id);
      return {
        ...s,
        tasks: exists
          ? s.tasks.map(t => t.id === task.id ? task : t)
          : [...s.tasks, task],
      };
    });
  };

  const toggleTask = (id) => {
    setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  };

  const deleteTask = (id) => {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  };

  const togglePriority = (id) => {
    setState(s => {
      const task = s.tasks.find(t => t.id === id);
      if (!task) return s;
      const canAdd = !task.priority && s.tasks.filter(t => t.priority).length < 3;
      if (!task.priority && !canAdd) return s;
      return { ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, priority: !t.priority } : t) };
    });
  };

  // Drag & drop
  const onDragStart = (i) => { dragIdx.current = i; };
  const onDragEnter = (i) => { dragOver.current = i; };
  const onDragEnd = () => {
    setState(s => {
      const tasks = [...s.tasks];
      const [moved] = tasks.splice(dragIdx.current, 1);
      tasks.splice(dragOver.current, 0, moved);
      dragIdx.current = null; dragOver.current = null;
      return { ...s, tasks };
    });
  };

  // ── Hábitos ─────────────────────────────────────────────────────────────────
  const toggleHabit = (type, id) => {
    setState(s => ({
      ...s,
      habits: {
        ...s.habits,
        [type]: s.habits[type].map(h =>
          h.id === id ? { ...h, doneDate: h.doneDate ? null : todayStr } : h
        ),
      },
    }));
  };

  // ── Agenda ──────────────────────────────────────────────────────────────────
  const addAgenda = () => {
    if (!agendaInput.text.trim()) return;
    const item = { id: uid(), time: agendaInput.time, text: agendaInput.text.trim() };
    setState(s => ({
      ...s,
      agenda: {
        today: [...s.agenda.today, item].sort((a, b) => a.time.localeCompare(b.time)),
      },
    }));
    setAgendaInput({ time: '', text: '' });
  };

  const deleteAgenda = (id) => {
    setState(s => ({ ...s, agenda: { today: s.agenda.today.filter(i => i.id !== id) } }));
  };

  // ── Estado emocional ─────────────────────────────────────────────────────────
  const currentMood = state.moodHistory?.[todayStr];
  const setMood = (id) => {
    setState(s => ({ ...s, moodHistory: { ...s.moodHistory, [todayStr]: id } }));
  };

  // ── Ciclo ───────────────────────────────────────────────────────────────────
  const cycleDay = state.cycleLog?.[todayStr];
  const getCyclePhase = (d) => {
    if (!d) return null;
    if (d <= 5)  return { label: 'Menstrual',  color: '#B88A75' };
    if (d <= 13) return { label: 'Folicular',  color: '#9FB1B8' };
    if (d <= 16) return { label: 'Ovulación',  color: '#A89DB3' };
    return       { label: 'Lútea',       color: '#A89B8C' };
  };
  const cyclePhase = getCyclePhase(cycleDay);

  // ── Lectura ──────────────────────────────────────────────────────────────────
  const updateBook = (slot, data) => {
    setState(s => ({ ...s, reading: { ...s.reading, [slot]: { ...s.reading[slot], ...data } } }));
  };

  const bumpPage = (slot) => {
    setState(s => {
      const b = s.reading[slot];
      if (b.currentPage < b.totalPages)
        return { ...s, reading: { ...s.reading, [slot]: { ...b, currentPage: b.currentPage + 1 } } };
      return s;
    });
  };

  // ── Peso ─────────────────────────────────────────────────────────────────────
  const latestWeight = state.body?.weight?.slice(-1)?.[0]?.value ?? null;

  // ── Monomanía activa ──────────────────────────────────────────────────────────
  const activeMonomania = state.personal?.monomanias?.find(m => m.active);

  // ── Imagen de inspiración ─────────────────────────────────────────────────────
  const currentMonth = now.toISOString().slice(0, 7);
  const monthImgs = state.personal?.gallery?.[currentMonth] ?? [];
  const inspImg = state.inspirationImage ?? monthImgs[0] ?? null;

  // ─── Layout ────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '14px 18px',
      gap: 10,
      boxSizing: 'border-box',
      overflowY: 'auto',
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        background: '#FFFCF9',
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'Fraunces', serif", fontStyle: 'italic',
          fontSize: 13, letterSpacing: '0.12em', color: `${accent}AA`,
          textTransform: 'uppercase',
        }}>
          {MONTHS_ES[now.getMonth()]}
        </span>
        <div style={{ textAlign: 'center' }}>
          <span style={{
            fontFamily: "'Fraunces', serif", fontStyle: 'italic',
            fontSize: 22, color: '#3A3230', letterSpacing: '0.03em',
          }}>
            {DAYS_ES[dowIdx]} {now.getDate()}
          </span>
        </div>
        <span style={{
          fontFamily: "'Fraunces', serif", fontStyle: 'italic',
          fontSize: 13, letterSpacing: '0.12em', color: `${accent}AA`,
        }}>
          {now.getFullYear()}
        </span>
      </div>

      {/* ── FILA 1: Inspiración · To Do · Estado ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr', gap: 10, flexShrink: 0 }}>

        {/* Imagen */}
        <Card style={{ padding: 0, overflow: 'hidden', minHeight: 200 }}>
          {inspImg ? (
            <img src={inspImg} alt="" style={{
              width: '100%', height: '100%', minHeight: 200,
              objectFit: 'cover',
              display: 'block',
            }} />
          ) : (
            <div style={{
              height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${accent}12`,
              color: `${accent}70`, fontSize: 12,
            }}>
              Añade imágenes en Personal
            </div>
          )}
        </Card>

        {/* To Do */}
        <Card style={{ display: 'flex', flexDirection: 'column', minHeight: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <CardLabel color={accent}>To Do</CardLabel>
            <button
              onClick={() => setTaskModal('new')}
              style={{
                background: `${accent}18`, border: 'none', borderRadius: 7,
                width: 24, height: 24, cursor: 'pointer', color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <IconPlus size={13} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {state.tasks.length === 0 && (
              <div style={{ fontSize: 12, color: '#C0B0A8', padding: '8px 0' }}>Sin tareas por hoy</div>
            )}
            {state.tasks.map((task, i) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragEnter={() => onDragEnter(i)}
                onDragEnd={onDragEnd}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 8px',
                  borderRadius: 9,
                  background: task.done ? 'transparent' : (task.priority ? `${accent}12` : 'transparent'),
                  border: task.priority && !task.done ? `1px solid ${accent}25` : '1px solid transparent',
                  transition: 'all 0.15s',
                  cursor: 'grab',
                  opacity: task.done ? 0.45 : 1,
                }}
              >
                <span style={{ color: '#C8B8B0', cursor: 'grab', flexShrink: 0 }}><IconDrag /></span>

                {/* Checkbox */}
                <div
                  onClick={() => toggleTask(task.id)}
                  style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${task.done ? accent : '#C8B8B0'}`,
                    background: task.done ? accent : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', transition: 'all 0.15s',
                  }}
                >
                  {task.done && <IconCheck size={9} />}
                </div>

                <span style={{
                  flex: 1, fontSize: 13, color: '#3A3230',
                  textDecoration: task.done ? 'line-through' : 'none',
                  wordBreak: 'break-word',
                }}>
                  {task.text}
                </span>

                {/* Recurrencia badge */}
                {task.recurrence && (
                  <span title={`Repite ${task.recurrence.days.map(d => DAYS_SHORT[d]).join(',')}`}
                    style={{ color: `${accent}80`, flexShrink: 0 }}>
                    <IconRepeat size={11} />
                  </span>
                )}

                {/* Prioridad */}
                <button onClick={() => togglePriority(task.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: task.priority ? accent : '#D0C0B8', flexShrink: 0,
                }}>
                  <IconStar size={12} filled={task.priority} />
                </button>

                {/* Editar */}
                <button onClick={() => setTaskModal(task)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: '#D0C0B8', flexShrink: 0,
                }}>
                  <IconEdit size={11} />
                </button>

                {/* Borrar */}
                <button onClick={() => deleteTask(task.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: '#D0C0B8', flexShrink: 0,
                }}>
                  <IconTrash size={11} />
                </button>
              </div>
            ))}
          </div>

          {priorityCount > 0 && (
            <div style={{ fontSize: 10, color: `${accent}80`, marginTop: 6 }}>
              {priorityCount}/3 prioritarias
            </div>
          )}
        </Card>

        {/* Estado: peso + ciclo + mood */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
          <CardLabel color={accent}>Estado</CardLabel>

          {/* Peso */}
          <div style={{
            padding: '8px 12px', borderRadius: 12,
            background: `${accent}10`, border: `1px solid ${accent}20`,
          }}>
            <div style={{ fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Peso</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: '#3A3230' }}>
              {latestWeight ? `${latestWeight} kg` : '—'}
            </div>
          </div>

          {/* Ciclo */}
          <div style={{
            padding: '8px 12px', borderRadius: 12,
            background: cyclePhase ? `${cyclePhase.color}15` : `${accent}10`,
            border: `1px solid ${cyclePhase ? cyclePhase.color + '30' : accent + '20'}`,
          }}>
            <div style={{ fontSize: 10, color: cyclePhase?.color ?? accent, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Ciclo</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, color: '#3A3230' }}>
              {cycleDay ? `Día ${cycleDay} · ${cyclePhase?.label ?? ''}` : '—'}
            </div>
          </div>

          {/* Mood */}
          <div>
            <div style={{ fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Me siento</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {MOODS.map(m => (
                <button key={m.id} onClick={() => setMood(m.id)} style={{
                  flex: 1, minWidth: 0, padding: '5px 2px',
                  borderRadius: 8,
                  border: `1.5px solid ${currentMood === m.id ? m.color : m.color + '30'}`,
                  background: currentMood === m.id ? `${m.color}25` : 'transparent',
                  color: m.color, fontSize: 10, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── FILA 2: Hábitos · Agenda · Menú ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr 0.8fr', gap: 10, flexShrink: 0 }}>

        {/* Hábitos */}
        <Card>
          <CardLabel color={accent}>Hábitos</CardLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { key: 'morning', label: 'Mañana' },
              { key: 'night',   label: 'Noche'  },
            ].map(({ key, label }) => (
              <div key={key}>
                <div style={{ fontSize: 10, color: accent, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
                  {label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {state.habits[key].map(h => {
                    const done = h.doneDate === todayStr;
                    return (
                      <label key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                        <div
                          onClick={() => toggleHabit(key, h.id)}
                          style={{
                            width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                            border: `1.5px solid ${done ? accent : '#C8B8B0'}`,
                            background: done ? accent : 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', transition: 'all 0.15s',
                          }}
                        >
                          {done && <IconCheck size={9} />}
                        </div>
                        <span style={{
                          fontSize: 12, color: done ? `${accent}90` : '#5A4A42',
                          textDecoration: done ? 'line-through' : 'none',
                        }}>
                          {h.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Agenda */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <CardLabel color={accent}>Agenda de hoy</CardLabel>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', marginBottom: 10 }}>
            {state.agenda.today.length === 0 && (
              <div style={{ fontSize: 12, color: '#C0B0A8' }}>Sin eventos</div>
            )}
            {state.agenda.today.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '4px 6px', borderRadius: 8,
                background: `${accent}08`,
              }}>
                <span style={{ fontSize: 11, color: accent, fontWeight: '500', flexShrink: 0, minWidth: 34 }}>
                  {item.time}
                </span>
                <span style={{ fontSize: 12, color: '#3A3230', flex: 1 }}>{item.text}</span>
                <button onClick={() => deleteAgenda(item.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#D0C0B8', padding: 0,
                }}>
                  <IconClose size={11} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="time"
              value={agendaInput.time}
              onChange={e => setAgendaInput(a => ({ ...a, time: e.target.value }))}
              style={{
                width: 72, padding: '6px 8px', borderRadius: 8,
                border: `1px solid ${accent}25`, background: '#FAF7F3',
                fontSize: 12, color: '#3A3230', outline: 'none',
              }}
            />
            <input
              value={agendaInput.text}
              onChange={e => setAgendaInput(a => ({ ...a, text: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addAgenda()}
              placeholder="Evento..."
              style={{
                flex: 1, padding: '6px 10px', borderRadius: 8,
                border: `1px solid ${accent}25`, background: '#FAF7F3',
                fontSize: 12, color: '#3A3230', outline: 'none',
              }}
            />
            <button onClick={addAgenda} style={{
              background: accent, border: 'none', borderRadius: 8,
              width: 28, height: 28, cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <IconPlus size={13} />
            </button>
          </div>
        </Card>

        {/* Menú */}
        <Card>
          <CardLabel color={accent}>Menú</CardLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['desayuno','snack','almuerzo','cena'].map(meal => (
              <div key={meal} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                padding: '5px 8px', borderRadius: 9, background: `${accent}07`,
              }}>
                <span style={{
                  fontSize: 9, color: accent, textTransform: 'uppercase',
                  letterSpacing: '0.07em', flexShrink: 0, paddingTop: 1, minWidth: 50,
                }}>
                  {meal}
                </span>
                <span style={{ fontSize: 12, color: state.menu[meal] ? '#3A3230' : '#C0B0A8' }}>
                  {state.menu[meal] || '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── FILA 3: Lectura · Notas · Monomanía ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr', gap: 10, flexShrink: 0 }}>

        {/* Lectura — 3 libros */}
        <Card>
          <CardLabel color={accent}>Lectura</CardLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            {['kindle','paper','audio'].map(slot => (
              <BookCard
                key={slot}
                slot={slot}
                book={state.reading[slot]}
                accent={accent}
                onEdit={() => setBookModal(slot)}
                onPageUp={() => bumpPage(slot)}
              />
            ))}
          </div>
        </Card>

        {/* Notas */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <CardLabel color={accent}>Notas</CardLabel>
          <textarea
            value={state.notes ?? ''}
            onChange={e => setState(s => ({ ...s, notes: e.target.value }))}
            placeholder="Ideas, recordatorios..."
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none',
              background: 'transparent', fontSize: 12, color: '#3A3230',
              fontFamily: "'Inter', sans-serif", lineHeight: 1.6,
              minHeight: 80,
            }}
          />
        </Card>

        {/* Monomanía */}
        <Card>
          <CardLabel color={accent}>Monomanía</CardLabel>
          {activeMonomania ? (
            <div>
              <div style={{
                fontFamily: "'Fraunces', serif", fontStyle: 'italic',
                fontSize: 14, color: '#3A3230', marginBottom: 6,
              }}>
                {activeMonomania.title}
              </div>
              {activeMonomania.notes && (
                <div style={{ fontSize: 12, color: '#7A6A62', lineHeight: 1.5 }}>
                  {activeMonomania.notes.slice(0, 120)}{activeMonomania.notes.length > 120 ? '…' : ''}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#C0B0A8' }}>Sin monomanía activa</div>
          )}
        </Card>
      </div>

      {/* ── Modals ── */}
      {taskModal && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          accent={accent}
          onSave={saveTask}
          onClose={() => setTaskModal(null)}
        />
      )}

      {bookModal && (
        <BookModal
          slot={bookModal}
          book={state.reading[bookModal]}
          accent={accent}
          onSave={data => updateBook(bookModal, data)}
          onClose={() => setBookModal(null)}
        />
      )}
    </div>
  );
}