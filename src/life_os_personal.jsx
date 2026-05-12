import React, { useState, useCallback, useRef } from 'react';

const uid = () => Math.random().toString(36).slice(2, 9);
const ACCENT = '#C9A0A0';
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const CURRENT_YEAR = new Date().getFullYear();

// ─── Iconos ────────────────────────────────────────────────────────────────────
const IconPlus = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
);
const IconTrash = ({size=12}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const IconCheck = ({size=11}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const IconChevron = ({size=13, open}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);
const IconStar = ({size=13, filled}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IconLeft = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
);
const IconRight = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
);

// ─── Card base ─────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
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

const SectionLabel = ({ children, style = {} }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center',
    fontFamily: "'Fraunces', serif", fontStyle: 'italic',
    fontSize: 11, letterSpacing: '0.04em',
    color: '#fff',
    background: ACCENT,
    borderRadius: 20,
    padding: '3px 12px',
    marginBottom: 11,
    ...style,
  }}>
    {children}
  </div>
);

// ─── INSPIRACIÓN MENSUAL ────────────────────────────────────────────────────────
const InspirationCard = ({ gallery, onChange }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const key = `${new Date().getFullYear()}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const imgs = gallery[key] ?? [];

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        onChange(key, [...(gallery[key] ?? []), ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImg = (idx) => {
    const next = imgs.filter((_, i) => i !== idx);
    onChange(key, next);
  };

  return (
    <div>
      {/* Selector de mes */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {MONTHS_ES.map((m, i) => (
          <button
            key={i}
            onClick={() => setSelectedMonth(i)}
            style={{
              padding: '3px 8px', borderRadius: 6, fontSize: 10,
              border: `1px solid ${selectedMonth === i ? ACCENT : ACCENT + '30'}`,
              background: selectedMonth === i ? `${ACCENT}20` : 'transparent',
              color: selectedMonth === i ? ACCENT : '#9A8A80',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            }}
          >
            {m.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Grid imágenes */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {imgs.map((src, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <img src={src} alt="" style={{
              width: 64, height: 64, objectFit: 'cover', borderRadius: 10,
              border: `1px solid ${ACCENT}25`,
            }} />
            <button
              onClick={() => removeImg(i)}
              style={{
                position: 'absolute', top: 2, right: 2,
                width: 16, height: 16, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)', border: 'none',
                color: '#fff', cursor: 'pointer', fontSize: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
        ))}
        <label style={{
          width: 64, height: 64, borderRadius: 10,
          border: `1.5px dashed ${ACCENT}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: `${ACCENT}70`,
        }}>
          <IconPlus size={18} />
          <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>
      <div style={{ fontSize: 10, color: '#B0A098' }}>{imgs.length} imagen{imgs.length !== 1 ? 'es' : ''} en {MONTHS_ES[selectedMonth]}</div>
    </div>
  );
};

// ─── LIBROS POR AÑO (NUEVO) ─────────────────────────────────────────────────────
const BooksByYearCard = ({ booksByYear, onChange }) => {
  const years = Object.keys(booksByYear).sort((a, b) => b - a);
  if (!years.includes(String(CURRENT_YEAR))) years.unshift(String(CURRENT_YEAR));
  const uniqueYears = [...new Set(years)];

  const [yearIdx, setYearIdx] = useState(0);
  const currentYearStr = uniqueYears[yearIdx] ?? String(CURRENT_YEAR);
  const books = booksByYear[currentYearStr] ?? [];

  // Input controlado con ref para evitar el bug de cursor
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addBook = useCallback(() => {
    if (!input.trim()) return;
    const next = [...books, { id: uid(), title: input.trim(), favorite: false }];
    onChange(currentYearStr, next);
    setInput('');
    // Mantener foco después de añadir
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [input, books, currentYearStr, onChange]);

  const toggleFav = (id) => {
    onChange(currentYearStr, books.map(b => b.id === id ? { ...b, favorite: !b.favorite } : b));
  };

  const removeBook = (id) => {
    onChange(currentYearStr, books.filter(b => b.id !== id));
  };

  const addYear = () => {
    const y = prompt('Año:');
    if (!y || isNaN(parseInt(y))) return;
    const ys = String(parseInt(y));
    if (!booksByYear[ys]) onChange(ys, []);
  };

  return (
    <div>
      {/* Navegación de año */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <button
          onClick={() => setYearIdx(i => Math.min(i + 1, uniqueYears.length - 1))}
          disabled={yearIdx >= uniqueYears.length - 1}
          style={{
            background: 'none', border: 'none', cursor: yearIdx >= uniqueYears.length - 1 ? 'default' : 'pointer',
            color: yearIdx >= uniqueYears.length - 1 ? '#D8CEC8' : ACCENT, padding: 2,
          }}
        >
          <IconLeft size={14} />
        </button>

        <span style={{
          fontFamily: "'Fraunces', serif", fontStyle: 'italic',
          fontSize: 18, color: '#3A3230', flex: 1, textAlign: 'center',
        }}>
          {currentYearStr}
        </span>

        <button
          onClick={() => setYearIdx(i => Math.max(i - 1, 0))}
          disabled={yearIdx <= 0}
          style={{
            background: 'none', border: 'none', cursor: yearIdx <= 0 ? 'default' : 'pointer',
            color: yearIdx <= 0 ? '#D8CEC8' : ACCENT, padding: 2,
          }}
        >
          <IconRight size={14} />
        </button>

        <button onClick={addYear} style={{
          background: `${ACCENT}15`, border: 'none', borderRadius: 7,
          width: 22, height: 22, cursor: 'pointer', color: ACCENT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconPlus size={11} />
        </button>
      </div>

      {/* Lista numerada */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10, maxHeight: 220, overflowY: 'auto' }}>
        {books.length === 0 && (
          <div style={{ fontSize: 12, color: '#C0B0A8' }}>Sin libros aún</div>
        )}
        {books.map((book, idx) => (
          <div key={book.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: ACCENT, minWidth: 18, textAlign: 'right', flexShrink: 0 }}>
              {idx + 1}.
            </span>
            <span style={{
              flex: 1, fontSize: 12, color: '#3A3230',
              fontStyle: book.favorite ? 'italic' : 'normal',
            }}>
              {book.title}
            </span>
            <button onClick={() => toggleFav(book.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              color: book.favorite ? ACCENT : '#D0C0B8',
            }}>
              <IconStar size={12} filled={book.favorite} />
            </button>
            <button onClick={() => removeBook(book.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              color: '#D0C0B8',
            }}>
              <IconTrash size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* Input añadir */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addBook()}
          placeholder="Título del libro..."
          style={{
            flex: 1, padding: '7px 12px', borderRadius: 10,
            border: `1px solid ${ACCENT}30`, background: '#FAF7F3',
            fontSize: 12, color: '#3A3230', outline: 'none',
            fontFamily: "'Inter', sans-serif",
          }}
        />
        <button onClick={addBook} style={{
          background: ACCENT, border: 'none', borderRadius: 10,
          width: 28, height: 28, cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <IconPlus size={12} />
        </button>
      </div>

      <div style={{ fontSize: 10, color: '#B0A098', marginTop: 8 }}>
        {books.length} libro{books.length !== 1 ? 's' : ''} · {books.filter(b => b.favorite).length} favorito{books.filter(b => b.favorite).length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

// ─── PROYECTOS BALLENA (con collapsable) ────────────────────────────────────────
const ESTADOS = ['activo','pausado','terminado'];
const ESTADO_COLORS = { activo: '#9FB1B8', pausado: '#C9A0A0', terminado: '#8FA888' };

const WhaleProjectCard = ({ project, onUpdate, onDelete }) => {
  const [subInput, setSubInput] = useState('');
  const subInputRef = useRef(null);
  const isCollapsed = project.collapsed ?? false;

  const toggleCollapsed = () => onUpdate({ ...project, collapsed: !isCollapsed });

  const addSubtask = () => {
    if (!subInput.trim()) return;
    onUpdate({
      ...project,
      subtasks: [...(project.subtasks ?? []), { id: uid(), text: subInput.trim(), done: false }],
    });
    setSubInput('');
    requestAnimationFrame(() => subInputRef.current?.focus());
  };

  const toggleSub = (id) => onUpdate({
    ...project,
    subtasks: project.subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s),
  });

  const removeSub = (id) => onUpdate({
    ...project,
    subtasks: project.subtasks.filter(s => s.id !== id),
  });

  const setEstado = (estado) => onUpdate({ ...project, estado });
  const estadoColor = ESTADO_COLORS[project.estado] ?? ACCENT;
  const doneCount = (project.subtasks ?? []).filter(s => s.done).length;
  const total = (project.subtasks ?? []).length;

  return (
    <div style={{
      borderRadius: 14,
      border: `1px solid ${estadoColor}25`,
      background: `${estadoColor}06`,
      marginBottom: 8,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px',
        cursor: 'pointer',
      }} onClick={toggleCollapsed}>
        <IconChevron size={12} open={!isCollapsed} />
        <span style={{
          flex: 1, fontFamily: "'Fraunces', serif", fontStyle: 'italic',
          fontSize: 13, color: '#3A3230',
        }}>
          {project.title}
        </span>
        {total > 0 && (
          <span style={{ fontSize: 10, color: estadoColor }}>
            {doneCount}/{total}
          </span>
        )}
        {/* Estado pill */}
        <div style={{ display: 'flex', gap: 3 }}>
          {ESTADOS.map(e => (
            <button
              key={e}
              onClick={ev => { ev.stopPropagation(); setEstado(e); }}
              style={{
                padding: '2px 6px', borderRadius: 5, fontSize: 9,
                border: `1px solid ${ESTADO_COLORS[e] + (project.estado === e ? 'FF' : '40')}`,
                background: project.estado === e ? `${ESTADO_COLORS[e]}25` : 'transparent',
                color: ESTADO_COLORS[e], cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {e}
            </button>
          ))}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(project.id); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D0C0B8', padding: 0 }}
        >
          <IconTrash size={11} />
        </button>
      </div>

      {/* Subtareas desplegables */}
      {!isCollapsed && (
        <div style={{ padding: '0 12px 10px', borderTop: `1px solid ${estadoColor}15` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, marginBottom: 8 }}>
            {(project.subtasks ?? []).map(sub => (
              <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  onClick={() => toggleSub(sub.id)}
                  style={{
                    width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${sub.done ? estadoColor : '#C8B8B0'}`,
                    background: sub.done ? estadoColor : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', transition: 'all 0.15s',
                  }}
                >
                  {sub.done && <IconCheck size={8} />}
                </div>
                <span style={{
                  flex: 1, fontSize: 12, color: '#3A3230',
                  textDecoration: sub.done ? 'line-through' : 'none',
                  opacity: sub.done ? 0.5 : 1,
                }}>
                  {sub.text}
                </span>
                <button onClick={() => removeSub(sub.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#D0C0B8', padding: 0,
                }}>
                  <IconTrash size={10} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <input
              ref={subInputRef}
              value={subInput}
              onChange={e => setSubInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSubtask()}
              placeholder="Subtarea..."
              style={{
                flex: 1, padding: '5px 10px', borderRadius: 8,
                border: `1px solid ${estadoColor}25`, background: '#FAF7F3',
                fontSize: 12, color: '#3A3230', outline: 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <button onClick={addSubtask} style={{
              background: estadoColor, border: 'none', borderRadius: 8,
              width: 24, height: 24, cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <IconPlus size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── INTERESES (con fix del bug de cursor) ─────────────────────────────────────
// El bug ocurría porque los inputs recibían una key dinámica o el estado se
// re-montaba. Aquí se usan inputs controlados estables con useCallback.
const InterestsList = ({ items, onChange, label }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const add = useCallback(() => {
    if (!input.trim()) return;
    onChange([...items, { id: uid(), text: input.trim(), done: false }]);
    setInput('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [input, items, onChange]);

  const toggle = useCallback((id) => {
    onChange(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  }, [items, onChange]);

  const remove = useCallback((id) => {
    onChange(items.filter(i => i.id !== id));
  }, [items, onChange]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 6 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              onClick={() => toggle(item.id)}
              style={{
                width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                border: `1.5px solid ${item.done ? ACCENT : '#C8B8B0'}`,
                background: item.done ? ACCENT : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', transition: 'all 0.15s',
              }}
            >
              {item.done && <IconCheck size={8} />}
            </div>
            <span style={{
              flex: 1, fontSize: 12, color: '#3A3230',
              textDecoration: item.done ? 'line-through' : 'none',
              opacity: item.done ? 0.5 : 1,
            }}>
              {item.text}
            </span>
            <button onClick={() => remove(item.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#D0C0B8', padding: 0,
            }}>
              <IconTrash size={10} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={`Añadir ${label.toLowerCase()}...`}
          style={{
            flex: 1, padding: '6px 10px', borderRadius: 8,
            border: `1px solid ${ACCENT}25`, background: '#FAF7F3',
            fontSize: 12, color: '#3A3230', outline: 'none',
            fontFamily: "'Inter', sans-serif",
          }}
        />
        <button onClick={add} style={{
          background: ACCENT, border: 'none', borderRadius: 8,
          width: 24, height: 24, cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <IconPlus size={11} />
        </button>
      </div>
    </div>
  );
};

// ─── MONOMANÍAS ────────────────────────────────────────────────────────────────
const MonomaniasSection = ({ monomanias, onChange }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const add = () => {
    if (!input.trim()) return;
    onChange([...monomanias, { id: uid(), title: input.trim(), notes: '', active: false }]);
    setInput('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const toggle = (id) => onChange(
    monomanias.map(m => ({ ...m, active: m.id === id ? !m.active : false }))
  );

  const remove = (id) => onChange(monomanias.filter(m => m.id !== id));

  const updateNotes = (id, notes) => onChange(monomanias.map(m => m.id === id ? { ...m, notes } : m));

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {monomanias.map(m => (
          <div key={m.id} style={{
            borderRadius: 12, border: `1px solid ${m.active ? ACCENT : ACCENT + '25'}`,
            background: m.active ? `${ACCENT}10` : 'transparent',
            padding: '8px 10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: m.active ? 6 : 0 }}>
              <button
                onClick={() => toggle(m.id)}
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: m.active ? ACCENT : 'transparent',
                  border: `1.5px solid ${m.active ? ACCENT : '#C8B8B0'}`,
                  cursor: 'pointer', flexShrink: 0, padding: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: 12, color: '#3A3230', fontWeight: m.active ? '500' : '400' }}>
                {m.title}
              </span>
              <button onClick={() => remove(m.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#D0C0B8', padding: 0,
              }}>
                <IconTrash size={10} />
              </button>
            </div>
            {m.active && (
              <textarea
                value={m.notes}
                onChange={e => updateNotes(m.id, e.target.value)}
                placeholder="Notas..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  resize: 'none', border: 'none', outline: 'none',
                  background: 'transparent', fontSize: 11,
                  color: '#5A4A42', fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.5, minHeight: 50,
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Nueva monomanía..."
          style={{
            flex: 1, padding: '6px 10px', borderRadius: 8,
            border: `1px solid ${ACCENT}25`, background: '#FAF7F3',
            fontSize: 12, color: '#3A3230', outline: 'none',
            fontFamily: "'Inter', sans-serif",
          }}
        />
        <button onClick={add} style={{
          background: ACCENT, border: 'none', borderRadius: 8,
          width: 24, height: 24, cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <IconPlus size={11} />
        </button>
      </div>
    </div>
  );
};

// ─── PERSONAL principal ────────────────────────────────────────────────────────
export default function Personal({ state, setState }) {
  const setPersonal = (updater) => {
    setState(s => ({
      ...s,
      personal: typeof updater === 'function' ? updater(s.personal) : updater,
    }));
  };

  const updateGallery = (key, imgs) => {
    setPersonal(p => ({ ...p, gallery: { ...p.gallery, [key]: imgs } }));
    // Actualizar imagen de inspiración si es el mes actual
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    if (key === currentMonthKey && imgs.length > 0) {
      setState(s => ({ ...s, inspirationImage: imgs[0] }));
    }
  };

  const updateBooksByYear = (year, books) => {
    setPersonal(p => ({ ...p, booksByYear: { ...p.booksByYear, [year]: books } }));
  };

  const updateProjects = (projects) => setPersonal(p => ({ ...p, projects }));
  const updateMonomanias = (m) => setPersonal(p => ({ ...p, monomanias: m }));

  const updateWhalProject = (proj) => updateProjects(
    (state.personal.projects ?? []).map(p => p.id === proj.id ? proj : p)
  );
  const deleteWhaleProject = (id) => updateProjects(
    (state.personal.projects ?? []).filter(p => p.id !== id)
  );

  const addWhaleProject = () => {
    const title = prompt('Título del proyecto:');
    if (!title?.trim()) return;
    updateProjects([
      ...(state.personal.projects ?? []),
      { id: uid(), title: title.trim(), estado: 'activo', collapsed: false, subtasks: [] },
    ]);
  };

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
      {/* Topbar */}
      <div style={{
        padding: '10px 20px',
        background: '#FFFCF9',
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.05)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 18, color: '#3A3230' }}>
          Personal
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, marginRight: 6 }} />
        <span style={{ fontSize: 11, color: ACCENT, letterSpacing: '0.07em' }}>rosa empolvado</span>
      </div>

      {/* Grid 4 columnas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr 1fr 1fr',
        gap: 10,
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
      }}>

        {/* COL 1: Inspiración + Libros por año */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
          <Card>
            <SectionLabel>Inspiración mensual</SectionLabel>
            <InspirationCard
              gallery={state.personal.gallery ?? {}}
              onChange={updateGallery}
            />
          </Card>

          {/* NUEVO: Libros por año */}
          <Card>
            <SectionLabel>Libros por año</SectionLabel>
            <BooksByYearCard
              booksByYear={state.personal.booksByYear ?? {}}
              onChange={updateBooksByYear}
            />
          </Card>
        </div>

        {/* COL 2: Proyectos Ballena */}
        <Card style={{ overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Proyectos Ballena</SectionLabel>
            <button onClick={addWhaleProject} style={{
              background: `${ACCENT}18`, border: 'none', borderRadius: 7,
              width: 24, height: 24, cursor: 'pointer', color: ACCENT,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconPlus size={12} />
            </button>
          </div>
          {(state.personal.projects ?? []).length === 0 ? (
            <div style={{ fontSize: 12, color: '#C0B0A8' }}>Sin proyectos</div>
          ) : (
            (state.personal.projects ?? []).map(p => (
              <WhaleProjectCard
                key={p.id}
                project={p}
                onUpdate={updateWhalProject}
                onDelete={deleteWhaleProject}
              />
            ))
          )}
        </Card>

        {/* COL 3: Intereses */}
        <Card style={{ overflowY: 'auto' }}>
          <SectionLabel>Intereses</SectionLabel>
          <InterestsList
            label="Libros"
            items={state.personal.books ?? []}
            onChange={b => setPersonal(p => ({ ...p, books: b }))}
          />
          <InterestsList
            label="Películas"
            items={state.personal.films ?? []}
            onChange={f => setPersonal(p => ({ ...p, films: f }))}
          />
          <InterestsList
            label="Otros"
            items={state.personal.others ?? []}
            onChange={o => setPersonal(p => ({ ...p, others: o }))}
          />
        </Card>

        {/* COL 4: Wishlist + Ideas + Monomanías */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
          <Card>
            <SectionLabel>Wishlist</SectionLabel>
            <InterestsList
              label=""
              items={state.personal.wishlist ?? []}
              onChange={w => setPersonal(p => ({ ...p, wishlist: w }))}
            />
          </Card>

          <Card>
            <SectionLabel>Ideas</SectionLabel>
            <textarea
              value={state.personal.ideas ?? ''}
              onChange={e => setPersonal(p => ({ ...p, ideas: e.target.value }))}
              placeholder="Ideas libres..."
              style={{
                width: '100%', boxSizing: 'border-box',
                resize: 'none', border: 'none', outline: 'none',
                background: 'transparent', fontSize: 12,
                color: '#3A3230', fontFamily: "'Inter', sans-serif",
                lineHeight: 1.6, minHeight: 80,
              }}
            />
          </Card>

          <Card style={{ flex: 1 }}>
            <SectionLabel>Monomanías</SectionLabel>
            <MonomaniasSection
              monomanias={state.personal.monomanias ?? []}
              onChange={updateMonomanias}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}