import React, { useState, useRef } from 'react';

const today    = () => new Date().toISOString().split('T')[0];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DAYS_SHORT = ['D','L','M','X','J','V','S'];
const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Iconos ────────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 14, strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconPlus    = ({ s = 14 }) => <Ico size={s} d="M12 5v14M5 12h14" />;
const IconCheck   = ({ s = 11 }) => <Ico size={s} d="M20 6 9 17l-5-5" strokeWidth={2.2} />;
const IconTrash   = ({ s = 13 }) => <Ico size={s} d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />;
const IconEdit    = ({ s = 12 }) => <Ico size={s} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />;
const IconClose   = ({ s = 13 }) => <Ico size={s} d="M18 6 6 18M6 6l12 12" />;
const IconRepeat  = ({ s = 12 }) => <Ico size={s} d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />;
const IconStar = ({ s = 13, filled }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconDrag = ({ s = 13 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="9" cy="7"  r="1" fill="currentColor" />
    <circle cx="15" cy="7"  r="1" fill="currentColor" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
    <circle cx="9" cy="17" r="1" fill="currentColor" />
    <circle cx="15" cy="17" r="1" fill="currentColor" />
  </svg>
);

// ─── Componentes base ──────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#FFFCF9',
    borderRadius: 20,
    border: '1px solid rgba(0,0,0,0.055)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    padding: '16px 18px',
    ...style,
  }}>
    {children}
  </div>
);

// Pill con fondo de color — igual que la versión original
const Pill = ({ children, color }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center',
    fontFamily: "'Fraunces', serif", fontStyle: 'italic',
    fontSize: 11, letterSpacing: '0.04em',
    color: '#fff',
    background: color ?? '#9A8A80',
    borderRadius: 20,
    padding: '3px 12px',
    marginBottom: 11,
  }}>
    {children}
  </div>
);

const ProgressBar = ({ value, accent, height = 3 }) => (
  <div style={{ width: '100%', height, borderRadius: height, background: `${accent}20`, overflow: 'hidden' }}>
    <div style={{
      width: `${Math.min(value, 100)}%`, height: '100%',
      background: accent, borderRadius: height,
      transition: 'width 0.5s ease',
    }} />
  </div>
);

// ─── Estados emocionales ───────────────────────────────────────────────────────
const MOODS = [
  { id: 'bad',       label: 'Mal',       color: '#B88A75' },
  { id: 'normal',    label: 'Normal',    color: '#A89B8C' },
  { id: 'good',      label: 'Bien',      color: '#9FB1B8' },
  { id: 'excellent', label: 'Excelente', color: '#A89DB3' },
];

// ─── BookCard (horizontal, para columna derecha) ────────────────────────────────
const BookCard = ({ slot, label, book, accent, onEdit, onPageUp }) => {
  const pct = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 12,
      border: `1px solid ${accent}20`, background: `${accent}07`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 9, letterSpacing: '0.08em', color: accent, textTransform: 'uppercase', fontWeight: '500' }}>
          {label}
        </span>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${accent}70`, padding: 0 }}>
          <IconEdit s={11} />
        </button>
      </div>
      {book.title ? (
        <>
          <div style={{
            fontFamily: "'Fraunces', serif", fontStyle: 'italic',
            fontSize: 13, color: '#3A3230', marginBottom: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {book.title}
          </div>
          <div style={{ fontSize: 11, color: '#9A8A80', marginBottom: 6 }}>{book.author}</div>
          <ProgressBar value={pct} accent={accent} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
            <span style={{ fontSize: 11, color: '#9A8A80' }}>p.{book.currentPage} / {book.totalPages}</span>
            <button onClick={onPageUp} style={{
              padding: '2px 8px', borderRadius: 6,
              border: `1px solid ${accent}30`, background: 'transparent',
              color: accent, fontSize: 11, cursor: 'pointer',
            }}>+1</button>
          </div>
        </>
      ) : (
        <button onClick={onEdit} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: `${accent}55`, fontSize: 12, padding: 0,
        }}>
          Añadir libro...
        </button>
      )}
    </div>
  );
};

// ─── Modal tarea ───────────────────────────────────────────────────────────────
const TaskModal = ({ task, onSave, onClose, accent }) => {
  const [text, setText]       = useState(task?.text ?? '');
  const [priority, setPriority] = useState(task?.priority ?? false);
  const [recDays, setRecDays] = useState(task?.recurrence?.days ?? []);

  const toggleDay = d => setRecDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const save = () => {
    if (!text.trim()) return;
    onSave({
      id: task?.id ?? uid(), text: text.trim(),
      done: task?.done ?? false, priority,
      recurrence: recDays.length > 0 ? { days: recDays } : null,
    });
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: '#FDFAF7', borderRadius: 20, border: `1px solid ${accent}30`,
        boxShadow: '0 20px 48px rgba(0,0,0,0.12)', padding: '28px 30px', width: 380, zIndex: 201,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 17, color: '#3A3230' }}>
            {task ? 'Editar tarea' : 'Nueva tarea'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A80' }}><IconClose /></button>
        </div>

        <input
          autoFocus value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="Descripción..."
          style={{
            width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10,
            border: `1.5px solid ${accent}30`, background: '#FAF7F3',
            fontSize: 14, color: '#3A3230', fontFamily: "'Inter', sans-serif", outline: 'none', marginBottom: 14,
          }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 18 }}>
          <div
            onClick={() => setPriority(p => !p)}
            style={{
              width: 18, height: 18, borderRadius: 5,
              border: `1.5px solid ${priority ? accent : '#C0B0A8'}`,
              background: priority ? accent : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
            }}
          >
            {priority && <IconCheck s={11} />}
          </div>
          <span style={{ fontSize: 13, color: '#5A4A42' }}>Tarea prioritaria</span>
        </label>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: '#9A8A80', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
            Repetir semanalmente
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {DAYS_SHORT.map((d, i) => (
              <button key={i} onClick={() => toggleDay(i)} style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1.5px solid ${recDays.includes(i) ? accent : '#D8CEC8'}`,
                background: recDays.includes(i) ? `${accent}20` : 'transparent',
                color: recDays.includes(i) ? accent : '#9A8A80',
                fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
              }}>{d}</button>
            ))}
          </div>
          {recDays.length > 0 && (
            <div style={{ fontSize: 11, color: accent, marginTop: 7 }}>
              Repite cada {recDays.map(d => DAYS_ES[d]).join(', ')}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 10, border: '1px solid #D8CEC8',
            background: 'transparent', color: '#9A8A80', fontSize: 13, cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={save} style={{
            padding: '9px 18px', borderRadius: 10, border: 'none',
            background: accent, color: '#fff', fontSize: 13, cursor: 'pointer',
          }}>Guardar</button>
        </div>
      </div>
    </>
  );
};

// ─── Modal libro ───────────────────────────────────────────────────────────────
const BookModal = ({ slot, book, onSave, onClose, accent }) => {
  const LABELS = { kindle: 'Kindle', paper: 'Libro', audio: 'Libro compartido' };
  const [form, setForm] = useState({ ...book });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: '#FDFAF7', borderRadius: 20, border: `1px solid ${accent}30`,
        boxShadow: '0 20px 48px rgba(0,0,0,0.12)', padding: '28px 30px', width: 360, zIndex: 201,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 17, color: '#3A3230' }}>
            {LABELS[slot]}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A80' }}><IconClose /></button>
        </div>
        {['title', 'author'].map(k => (
          <input key={k} value={form[k]} onChange={set(k)}
            placeholder={k === 'title' ? 'Título...' : 'Autor/a...'}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '9px 14px', borderRadius: 10,
              border: `1.5px solid ${accent}25`, background: '#FAF7F3',
              fontSize: 13, color: '#3A3230', fontFamily: "'Inter', sans-serif", outline: 'none', marginBottom: 10,
            }}
          />
        ))}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['currentPage', 'totalPages'].map(k => (
            <input key={k} type="number" min="0" value={form[k]} onChange={set(k)}
              placeholder={k === 'currentPage' ? 'Pág. actual' : 'Total págs.'}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 10,
                border: `1.5px solid ${accent}25`, background: '#FAF7F3',
                fontSize: 13, color: '#3A3230', fontFamily: "'Inter', sans-serif", outline: 'none',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 10, border: '1px solid #D8CEC8',
            background: 'transparent', color: '#9A8A80', fontSize: 13, cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={() => { onSave(form); onClose(); }} style={{
            padding: '9px 18px', borderRadius: 10, border: 'none',
            background: accent, color: '#fff', fontSize: 13, cursor: 'pointer',
          }}>Guardar</button>
        </div>
      </div>
    </>
  );
};

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
export default function Dashboard({ state, setState, theme }) {
  const accent   = theme.accent;
  const now      = new Date();
  const todayStr = today();
  const dowIdx   = now.getDay();

  const [taskModal, setTaskModal]     = useState(null);
  const [bookModal, setBookModal]     = useState(null);
  const [agendaInput, setAgendaInput] = useState({ time: '', text: '' });
  const dragIdx  = useRef(null);
  const dragOver = useRef(null);

  // ── Tareas ──────────────────────────────────────────────────────────────────
  const priorityCount = (state.tasks ?? []).filter(t => t.priority).length;

  const saveTask = task => setState(s => {
    const exists = s.tasks.find(t => t.id === task.id);
    return { ...s, tasks: exists ? s.tasks.map(t => t.id === task.id ? task : t) : [...s.tasks, task] };
  });

  const toggleTask     = id => setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  const deleteTask     = id => setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
  const togglePriority = id => setState(s => {
    const task = s.tasks.find(t => t.id === id);
    if (!task) return s;
    if (!task.priority && s.tasks.filter(t => t.priority).length >= 3) return s;
    return { ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, priority: !t.priority } : t) };
  });

  const onDragStart = i => { dragIdx.current = i; };
  const onDragEnter = i => { dragOver.current = i; };
  const onDragEnd   = () => setState(s => {
    const tasks = [...s.tasks];
    const [moved] = tasks.splice(dragIdx.current, 1);
    tasks.splice(dragOver.current, 0, moved);
    dragIdx.current = null; dragOver.current = null;
    return { ...s, tasks };
  });

  // ── Hábitos ─────────────────────────────────────────────────────────────────
  const toggleHabit = (type, id) => setState(s => ({
    ...s,
    habits: {
      ...s.habits,
      [type]: s.habits[type].map(h => h.id === id ? { ...h, doneDate: h.doneDate ? null : todayStr } : h),
    },
  }));

  // ── Agenda ──────────────────────────────────────────────────────────────────
  const addAgenda = () => {
    if (!agendaInput.text.trim()) return;
    const item = { id: uid(), time: agendaInput.time, text: agendaInput.text.trim() };
    setState(s => ({
      ...s,
      agenda: { today: [...s.agenda.today, item].sort((a, b) => a.time.localeCompare(b.time)) },
    }));
    setAgendaInput({ time: '', text: '' });
  };
  const deleteAgenda = id => setState(s => ({ ...s, agenda: { today: s.agenda.today.filter(i => i.id !== id) } }));

  // ── Mood ────────────────────────────────────────────────────────────────────
  const currentMood = state.moodHistory?.[todayStr];
  const setMood     = id => setState(s => ({ ...s, moodHistory: { ...s.moodHistory, [todayStr]: id } }));

  // ── Ciclo ───────────────────────────────────────────────────────────────────
  const cycleDay = state.cycleLog?.[todayStr];
  const getCyclePhase = d => {
    if (!d) return null;
    if (d <= 5)  return { label: 'Menstrual', color: '#B88A75' };
    if (d <= 13) return { label: 'Folicular', color: '#9FB1B8' };
    if (d <= 16) return { label: 'Ovulación', color: '#A89DB3' };
    return { label: 'Lútea', color: '#A89B8C' };
  };
  const cyclePhase = getCyclePhase(cycleDay);

  // ── Libros ──────────────────────────────────────────────────────────────────
  const updateBook = (slot, data) => setState(s => ({ ...s, reading: { ...s.reading, [slot]: { ...s.reading[slot], ...data } } }));
  const bumpPage   = slot => setState(s => {
    const b = s.reading[slot];
    if (b.currentPage < b.totalPages)
      return { ...s, reading: { ...s.reading, [slot]: { ...b, currentPage: b.currentPage + 1 } } };
    return s;
  });

  // ── Datos derivados ─────────────────────────────────────────────────────────
  const latestWeight    = state.body?.weight?.slice(-1)?.[0]?.value ?? null;
  const activeMonomania = state.personal?.monomanias?.find(m => m.active);
  const currentMonth    = now.toISOString().slice(0, 7);
  const monthImgs       = state.personal?.gallery?.[currentMonth] ?? [];
  const inspImg         = state.inspirationImage ?? monthImgs[0] ?? null;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      padding: '12px 16px', gap: 9, boxSizing: 'border-box', overflowY: 'auto',
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 24px',
        background: accent,
        borderRadius: 16,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'Fraunces', serif", fontStyle: 'italic',
          fontSize: 13, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.85)',
          textTransform: 'uppercase',
        }}>
          {MONTHS_ES[now.getMonth()]}
        </span>
        <span style={{
          fontFamily: "'Fraunces', serif", fontStyle: 'italic',
          fontSize: 24, color: '#fff', letterSpacing: '0.02em',
        }}>
          {DAYS_ES[dowIdx]} {now.getDate()}
        </span>
        <span style={{
          fontFamily: "'Fraunces', serif", fontStyle: 'italic',
          fontSize: 13, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.85)',
        }}>
          {now.getFullYear()}
        </span>
      </div>

      {/* ── CUERPO: columna izquierda + columna derecha fija ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 9, flex: 1, minHeight: 0 }}>

        {/* ── IZQUIERDA ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, minHeight: 0 }}>

          {/* FILA 1: Inspiración + To Do */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 9 }}>

            {/* Imagen */}
            <Card style={{ padding: 0, overflow: 'hidden', minHeight: 210 }}>
              {inspImg ? (
                <img src={inspImg} alt="" style={{ width: '100%', height: '100%', minHeight: 210, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accent}10`, color: `${accent}60`, fontSize: 12 }}>
                  Añade imágenes en Personal
                </div>
              )}
            </Card>

            {/* To Do */}
            <Card style={{ display: 'flex', flexDirection: 'column', minHeight: 210 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Pill color={accent}>to do</Pill>
                <button onClick={() => setTaskModal('new')} style={{
                  background: `${accent}18`, border: 'none', borderRadius: 7,
                  width: 24, height: 24, cursor: 'pointer', color: accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <IconPlus s={13} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {(state.tasks ?? []).length === 0 && (
                  <div style={{ fontSize: 12, color: '#C0B0A8' }}>Sin tareas por hoy</div>
                )}
                {(state.tasks ?? []).map((task, i) => (
                  <div
                    key={task.id} draggable
                    onDragStart={() => onDragStart(i)}
                    onDragEnter={() => onDragEnter(i)}
                    onDragEnd={onDragEnd}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 7px', borderRadius: 9,
                      background: task.done ? 'transparent' : (task.priority ? `${accent}12` : 'transparent'),
                      border: task.priority && !task.done ? `1px solid ${accent}22` : '1px solid transparent',
                      cursor: 'grab', opacity: task.done ? 0.4 : 1, transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ color: '#C8B8B0', flexShrink: 0 }}><IconDrag s={12} /></span>
                    <div onClick={() => toggleTask(task.id)} style={{
                      width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${task.done ? accent : '#C8B8B0'}`,
                      background: task.done ? accent : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', transition: 'all 0.15s',
                    }}>
                      {task.done && <IconCheck s={9} />}
                    </div>
                    <span style={{ flex: 1, fontSize: 12.5, color: '#3A3230', textDecoration: task.done ? 'line-through' : 'none', wordBreak: 'break-word' }}>
                      {task.text}
                    </span>
                    {task.recurrence && (
                      <span style={{ color: `${accent}70`, flexShrink: 0 }} title="Tarea recurrente"><IconRepeat s={11} /></span>
                    )}
                    <button onClick={() => togglePriority(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: task.priority ? accent : '#D8C8C0', flexShrink: 0 }}>
                      <IconStar s={12} filled={task.priority} />
                    </button>
                    <button onClick={() => setTaskModal(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#D8C8C0', flexShrink: 0 }}>
                      <IconEdit s={11} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#D8C8C0', flexShrink: 0 }}>
                      <IconTrash s={11} />
                    </button>
                  </div>
                ))}
              </div>
              {priorityCount > 0 && (
                <div style={{ fontSize: 10, color: `${accent}80`, marginTop: 5 }}>{priorityCount}/3 prioritarias</div>
              )}
            </Card>
          </div>

          {/* FILA 2: Hábitos + Agenda + Menú */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 0.75fr', gap: 9, flex: 1, minHeight: 0 }}>

            {/* Hábitos */}
            <Card style={{ overflowY: 'auto' }}>
              <Pill color={accent}>hábitos</Pill>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[{ key: 'morning', label: 'Mañana' }, { key: 'night', label: 'Noche' }].map(({ key, label }) => (
                  <div key={key}>
                    <div style={{ fontSize: 9, color: accent, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 7 }}>{label}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {(state.habits?.[key] ?? []).map(h => {
                        const done = h.doneDate === todayStr;
                        return (
                          <label key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                            <div onClick={() => toggleHabit(key, h.id)} style={{
                              width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                              border: `1.5px solid ${done ? accent : '#C8B8B0'}`,
                              background: done ? accent : 'transparent',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', transition: 'all 0.15s',
                            }}>
                              {done && <IconCheck s={8} />}
                            </div>
                            <span style={{ fontSize: 12, color: done ? `${accent}90` : '#5A4A42', textDecoration: done ? 'line-through' : 'none' }}>
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
            <Card style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <Pill color={accent}>agenda</Pill>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', marginBottom: 10 }}>
                {(state.agenda?.today ?? []).length === 0 && (
                  <div style={{ fontSize: 12, color: '#C0B0A8' }}>Sin eventos</div>
                )}
                {(state.agenda?.today ?? []).map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '4px 7px', borderRadius: 8, background: `${accent}08`,
                  }}>
                    <span style={{ fontSize: 11, color: accent, fontWeight: '500', flexShrink: 0, minWidth: 34 }}>{item.time}</span>
                    <span style={{ fontSize: 12, color: '#3A3230', flex: 1 }}>{item.text}</span>
                    <button onClick={() => deleteAgenda(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D0C0B8', padding: 0 }}>
                      <IconClose s={11} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="time" value={agendaInput.time}
                  onChange={e => setAgendaInput(a => ({ ...a, time: e.target.value }))}
                  style={{ width: 70, padding: '6px 8px', borderRadius: 8, border: `1px solid ${accent}25`, background: '#FAF7F3', fontSize: 12, color: '#3A3230', outline: 'none' }}
                />
                <input value={agendaInput.text}
                  onChange={e => setAgendaInput(a => ({ ...a, text: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addAgenda()}
                  placeholder="Evento..."
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: `1px solid ${accent}25`, background: '#FAF7F3', fontSize: 12, color: '#3A3230', outline: 'none' }}
                />
                <button onClick={addAgenda} style={{
                  background: accent, border: 'none', borderRadius: 8, width: 28, height: 28,
                  cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <IconPlus s={13} />
                </button>
              </div>
            </Card>

            {/* Menú */}
            <Card style={{ overflowY: 'auto' }}>
              <Pill color={accent}>menú</Pill>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['desayuno', 'snack', 'almuerzo', 'cena'].map(meal => (
                  <div key={meal} style={{ padding: '5px 8px', borderRadius: 9, background: `${accent}07` }}>
                    <div style={{ fontSize: 8, color: accent, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 1 }}>{meal}</div>
                    <div style={{ fontSize: 12, color: state.menu?.[meal] ? '#3A3230' : '#C0B0A8' }}>
                      {state.menu?.[meal] || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ── DERECHA: Estado + Lectura + Notas + Monomanía ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, overflowY: 'auto' }}>

          {/* Estado */}
          <Card style={{ flexShrink: 0 }}>
            <Pill color={accent}>estado</Pill>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ padding: '7px 11px', borderRadius: 11, background: `${accent}10`, border: `1px solid ${accent}20` }}>
                <div style={{ fontSize: 9, color: accent, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 2 }}>Peso</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: '#3A3230', lineHeight: 1 }}>
                  {latestWeight ? `${latestWeight} kg` : '—'}
                </div>
              </div>
              <div style={{
                padding: '7px 11px', borderRadius: 11,
                background: cyclePhase ? `${cyclePhase.color}14` : `${accent}10`,
                border: `1px solid ${cyclePhase ? cyclePhase.color + '28' : accent + '20'}`,
              }}>
                <div style={{ fontSize: 9, color: cyclePhase?.color ?? accent, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 2 }}>Ciclo</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, color: '#3A3230' }}>
                  {cycleDay ? `Día ${cycleDay} · ${cyclePhase?.label}` : '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: accent, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>Me siento</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {MOODS.map(m => (
                    <button key={m.id} onClick={() => setMood(m.id)} style={{
                      flex: 1, padding: '5px 2px', borderRadius: 7,
                      border: `1.5px solid ${currentMood === m.id ? m.color : m.color + '30'}`,
                      background: currentMood === m.id ? `${m.color}22` : 'transparent',
                      color: m.color, fontSize: 9, cursor: 'pointer', transition: 'all 0.15s',
                    }}>{m.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Lectura — vertical */}
          <Card style={{ flexShrink: 0 }}>
            <Pill color={accent}>lectura</Pill>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { slot: 'kindle', label: 'Kindle' },
                { slot: 'paper',  label: 'Libro' },
                { slot: 'audio',  label: 'Libro compartido' },
              ].map(({ slot, label }) => (
                <BookCard
                  key={slot} slot={slot} label={label}
                  book={state.reading?.[slot] ?? { title: '', author: '', currentPage: 0, totalPages: 0 }}
                  accent={accent}
                  onEdit={() => setBookModal(slot)}
                  onPageUp={() => bumpPage(slot)}
                />
              ))}
            </div>
          </Card>

          {/* Notas */}
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Pill color={accent}>notas</Pill>
            <textarea
              value={state.notes ?? ''}
              onChange={e => setState(s => ({ ...s, notes: e.target.value }))}
              placeholder="Ideas, recordatorios..."
              style={{
                flex: 1, resize: 'none', border: 'none', outline: 'none',
                background: 'transparent', fontSize: 12, color: '#3A3230',
                fontFamily: "'Inter', sans-serif", lineHeight: 1.65, minHeight: 60,
              }}
            />
          </Card>

          {/* Monomanía */}
          <Card style={{ flexShrink: 0 }}>
            <Pill color={accent}>monomanía</Pill>
            {activeMonomania ? (
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 14, color: '#3A3230', marginBottom: 4 }}>
                  {activeMonomania.title}
                </div>
                {activeMonomania.notes && (
                  <div style={{ fontSize: 12, color: '#7A6A62', lineHeight: 1.5 }}>
                    {activeMonomania.notes.slice(0, 100)}{activeMonomania.notes.length > 100 ? '…' : ''}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#C0B0A8' }}>Sin monomanía activa</div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      {taskModal && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          accent={accent} onSave={saveTask} onClose={() => setTaskModal(null)}
        />
      )}
      {bookModal && (
        <BookModal
          slot={bookModal}
          book={state.reading?.[bookModal] ?? { title: '', author: '', currentPage: 0, totalPages: 0 }}
          accent={accent}
          onSave={data => updateBook(bookModal, data)}
          onClose={() => setBookModal(null)}
        />
      )}
    </div>
  );
}