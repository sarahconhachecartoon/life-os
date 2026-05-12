import React, { useState } from 'react';

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Iconos ────────────────────────────────────────────────────────────────────
const IconPlus = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
);
const IconTrash = ({size=13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const IconChevron = ({size=13, open}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);
const IconCheck = ({size=11}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const IconClose = ({size=13}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
);

const ACCENT = '#8FA89E';
const LIGHT  = '#E2EDEA';

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

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: "'Fraunces', serif",
    fontStyle: 'italic',
    fontSize: 11,
    letterSpacing: '0.07em',
    color: ACCENT,
    textTransform: 'uppercase',
    marginBottom: 12,
  }}>
    {children}
  </div>
);

// ─── Checklist simple ──────────────────────────────────────────────────────────
const SimpleChecklist = ({ items, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    onChange([...items, { id: uid(), text: input.trim(), done: false }]);
    setInput('');
  };

  const toggle = (id) => onChange(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id) => onChange(items.filter(i => i.id !== id));

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              onClick={() => toggle(item.id)}
              style={{
                width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                border: `1.5px solid ${item.done ? ACCENT : '#C8B8B0'}`,
                background: item.done ? ACCENT : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', transition: 'all 0.15s',
              }}
            >
              {item.done && <IconCheck size={9} />}
            </div>
            <span style={{
              flex: 1, fontSize: 13, color: '#3A3230',
              textDecoration: item.done ? 'line-through' : 'none',
              opacity: item.done ? 0.5 : 1,
            }}>
              {item.text}
            </span>
            <button onClick={() => remove(item.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#D0C0B8', padding: 0,
            }}>
              <IconTrash size={11} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder ?? 'Añadir...'}
          style={{
            flex: 1, padding: '7px 12px', borderRadius: 10,
            border: `1px solid ${ACCENT}30`, background: '#FAF7F3',
            fontSize: 13, color: '#3A3230', outline: 'none',
            fontFamily: "'Inter', sans-serif",
          }}
        />
        <button onClick={add} style={{
          background: ACCENT, border: 'none', borderRadius: 10,
          width: 30, height: 30, cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <IconPlus size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Presupuesto row ───────────────────────────────────────────────────────────
const BudgetList = ({ budgets, onChange }) => {
  const [form, setForm] = useState({ cliente: '', proyecto: '', precio: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const add = () => {
    if (!form.cliente.trim()) return;
    onChange([...budgets, {
      id: uid(),
      cliente: form.cliente,
      proyecto: form.proyecto,
      precio: parseFloat(form.precio) || 0,
      cobrado: false,
    }]);
    setForm({ cliente: '', proyecto: '', precio: '' });
  };

  const toggle = (id) => onChange(budgets.map(b => b.id === id ? { ...b, cobrado: !b.cobrado } : b));
  const remove = (id) => onChange(budgets.filter(b => b.id !== id));

  const total = budgets.filter(b => !b.cobrado).reduce((s, b) => s + b.precio, 0);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
        {budgets.map(b => (
          <div key={b.id} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 10,
            background: b.cobrado ? `${ACCENT}08` : `${ACCENT}12`,
            opacity: b.cobrado ? 0.5 : 1,
          }}>
            <div
              onClick={() => toggle(b.id)}
              style={{
                width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                border: `1.5px solid ${b.cobrado ? ACCENT : '#C8B8B0'}`,
                background: b.cobrado ? ACCENT : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}
            >
              {b.cobrado && <IconCheck size={9} />}
            </div>
            <span style={{ flex: 1, fontSize: 12, color: '#3A3230' }}>{b.cliente}</span>
            <span style={{ fontSize: 11, color: '#9A8A80', flex: 1 }}>{b.proyecto}</span>
            <span style={{ fontSize: 13, color: ACCENT, fontWeight: '500', minWidth: 60, textAlign: 'right' }}>
              {b.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
            <button onClick={() => remove(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D0C0B8', padding: 0 }}>
              <IconTrash size={11} />
            </button>
          </div>
        ))}
      </div>
      {budgets.some(b => !b.cobrado) && (
        <div style={{
          padding: '6px 10px', borderRadius: 10,
          background: `${ACCENT}15`,
          fontSize: 13, color: ACCENT, fontWeight: '500',
          marginBottom: 10, textAlign: 'right',
        }}>
          Pendiente: {total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { k: 'cliente',  p: 'Cliente' },
          { k: 'proyecto', p: 'Proyecto' },
          { k: 'precio',   p: '€' },
        ].map(({ k, p }) => (
          <input
            key={k}
            value={form[k]}
            onChange={set(k)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder={p}
            type={k === 'precio' ? 'number' : 'text'}
            style={{
              flex: k === 'precio' ? '0 0 70px' : 1,
              padding: '7px 10px', borderRadius: 10,
              border: `1px solid ${ACCENT}30`, background: '#FAF7F3',
              fontSize: 12, color: '#3A3230', outline: 'none',
              fontFamily: "'Inter', sans-serif",
            }}
          />
        ))}
        <button onClick={add} style={{
          background: ACCENT, border: 'none', borderRadius: 10,
          width: 30, height: 30, cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <IconPlus size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── PROYECTOS DE CÓMIC ────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = ['Boceto', 'Tinta', 'Color', 'Maquetación'];

// Modal de nuevo proyecto
const NewComicModal = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState('');
  const [cats, setCats] = useState(DEFAULT_CATEGORIES.join(', '));

  const save = () => {
    const totalPages = parseInt(pages) || 0;
    if (!title.trim() || totalPages < 1) return;
    const catNames = cats.split(',').map(c => c.trim()).filter(Boolean);
    const categories = catNames.map(name => ({
      id: uid(),
      name,
      collapsed: true,
      pages: Array(totalPages).fill(false),
    }));
    onSave({ id: uid(), title: title.trim(), totalPages, categories });
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)',
        zIndex: 300, backdropFilter: 'blur(2px)',
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        background: '#FDFAF7', borderRadius: 20,
        border: `1px solid ${ACCENT}30`,
        boxShadow: '0 20px 48px rgba(0,0,0,0.12)',
        padding: '28px 30px', width: 400, zIndex: 301,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 17, color: '#3A3230' }}>
            Nuevo proyecto
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A80' }}>
            <IconClose />
          </button>
        </div>

        {[
          { label: 'Título', value: title, set: setTitle, placeholder: 'Cómic Sasi...' },
          { label: 'Número de páginas', value: pages, set: setPages, placeholder: '46', type: 'number' },
          { label: 'Fases (separadas por coma)', value: cats, set: setCats, placeholder: 'Boceto, Tinta, Color, Maquetación' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#9A8A80', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>
              {f.label}
            </div>
            <input
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder}
              type={f.type ?? 'text'}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 14px', borderRadius: 10,
                border: `1.5px solid ${ACCENT}30`, background: '#FAF7F3',
                fontSize: 13, color: '#3A3230',
                fontFamily: "'Inter', sans-serif", outline: 'none',
              }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 10,
            border: '1px solid #D8CEC8', background: 'transparent',
            color: '#9A8A80', fontSize: 13, cursor: 'pointer',
          }}>Cancelar</button>
          <button onClick={save} style={{
            padding: '9px 18px', borderRadius: 10,
            border: 'none', background: ACCENT,
            color: '#fff', fontSize: 13, cursor: 'pointer',
          }}>Crear proyecto</button>
        </div>
      </div>
    </>
  );
};

// Cuadrícula de páginas para una categoría
const PageGrid = ({ pages, totalPages, onChange, accent }) => {
  const done = pages.filter(Boolean).length;
  const pct  = totalPages > 0 ? Math.round((done / totalPages) * 100) : 0;

  return (
    <div style={{ paddingTop: 12 }}>
      {/* Barra de progreso */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          flex: 1, height: 4, borderRadius: 4,
          background: `${accent}20`, overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: accent, borderRadius: 4,
            transition: 'width 0.3s ease',
          }} />
        </div>
        <span style={{ fontSize: 11, color: accent, minWidth: 50, textAlign: 'right' }}>
          {done}/{totalPages} · {pct}%
        </span>
      </div>

      {/* Grid de páginas */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4,
      }}>
        {pages.map((done, idx) => (
          <button
            key={idx}
            onClick={() => {
              const next = [...pages]; next[idx] = !next[idx]; onChange(next);
            }}
            title={`Página ${idx + 1}`}
            style={{
              width: 28, height: 28,
              borderRadius: 6,
              border: `1.5px solid ${done ? accent : accent + '30'}`,
              background: done ? accent : 'transparent',
              color: done ? '#fff' : `${accent}80`,
              fontSize: 9, fontWeight: done ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

// Tarjeta de un proyecto de cómic
const ComicProjectCard = ({ project, onUpdate, onDelete }) => {
  const totalDone = project.categories.reduce((s, c) => s + c.pages.filter(Boolean).length, 0);
  const totalAll  = project.categories.reduce((s, c) => s + c.pages.length, 0);
  const globalPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  const toggleCat = (catId) => {
    onUpdate({
      ...project,
      categories: project.categories.map(c =>
        c.id === catId ? { ...c, collapsed: !c.collapsed } : c
      ),
    });
  };

  const updatePages = (catId, pages) => {
    onUpdate({
      ...project,
      categories: project.categories.map(c =>
        c.id === catId ? { ...c, pages } : c
      ),
    });
  };

  const addCategory = () => {
    const name = prompt('Nombre de la fase:');
    if (!name?.trim()) return;
    onUpdate({
      ...project,
      categories: [
        ...project.categories,
        { id: uid(), name: name.trim(), collapsed: true, pages: Array(project.totalPages).fill(false) },
      ],
    });
  };

  const deleteCategory = (catId) => {
    onUpdate({ ...project, categories: project.categories.filter(c => c.id !== catId) });
  };

  return (
    <div style={{
      borderRadius: 16,
      border: `1.5px solid ${ACCENT}25`,
      background: `${ACCENT}06`,
      overflow: 'hidden',
      marginBottom: 10,
    }}>
      {/* Header del proyecto */}
      <div style={{
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${ACCENT}15`,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Fraunces', serif", fontStyle: 'italic',
            fontSize: 15, color: '#3A3230', marginBottom: 2,
          }}>
            {project.title}
          </div>
          <div style={{ fontSize: 11, color: '#9A8A80' }}>
            {project.totalPages} páginas · {globalPct}% completado
          </div>
        </div>

        {/* Barra global */}
        <div style={{
          width: 80, height: 4, borderRadius: 4,
          background: `${ACCENT}20`, overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{
            width: `${globalPct}%`, height: '100%',
            background: ACCENT, borderRadius: 4,
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Botones */}
        <button onClick={addCategory} style={{
          background: `${ACCENT}18`, border: 'none', borderRadius: 7,
          width: 26, height: 26, cursor: 'pointer', color: ACCENT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconPlus size={12} />
        </button>
        <button onClick={() => {
          if (window.confirm(`¿Eliminar "${project.title}"?`)) onDelete(project.id);
        }} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#D0C0B8', padding: 0,
        }}>
          <IconTrash size={13} />
        </button>
      </div>

      {/* Categorías */}
      <div style={{ padding: '8px 16px 12px' }}>
        {project.categories.map(cat => {
          const catDone = cat.pages.filter(Boolean).length;
          const catPct  = cat.pages.length > 0 ? Math.round((catDone / cat.pages.length) * 100) : 0;

          return (
            <div key={cat.id} style={{ marginBottom: 4 }}>
              {/* Header categoría */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 10,
                background: cat.collapsed ? 'transparent' : `${ACCENT}10`,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
                onClick={() => toggleCat(cat.id)}
              >
                <IconChevron size={12} open={!cat.collapsed} />
                <span style={{ flex: 1, fontSize: 13, color: '#3A3230', fontWeight: '500' }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: 11, color: `${ACCENT}90` }}>
                  {catDone}/{cat.pages.length}
                </span>
                {/* Mini barra */}
                <div style={{
                  width: 48, height: 3, borderRadius: 3,
                  background: `${ACCENT}20`, overflow: 'hidden', flexShrink: 0,
                }}>
                  <div style={{
                    width: `${catPct}%`, height: '100%',
                    background: ACCENT, borderRadius: 3,
                  }} />
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteCategory(cat.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D0C0B8', padding: 0, marginLeft: 2 }}
                >
                  <IconClose size={11} />
                </button>
              </div>

              {/* Grid desplegable */}
              {!cat.collapsed && (
                <div style={{ paddingLeft: 20 }}>
                  <PageGrid
                    pages={cat.pages}
                    totalPages={project.totalPages}
                    onChange={pages => updatePages(cat.id, pages)}
                    accent={ACCENT}
                  />
                </div>
              )}
            </div>
          );
        })}

        {project.categories.length === 0 && (
          <div style={{ fontSize: 12, color: '#C0B0A8', padding: '8px 0' }}>
            Sin fases — usa + para añadir
          </div>
        )}
      </div>
    </div>
  );
};

// ─── TRABAJO principal ─────────────────────────────────────────────────────────
export default function Trabajo({ state, setState }) {
  const [newComicModal, setNewComicModal] = useState(false);

  const setTrabajo = (updater) => {
    setState(s => ({ ...s, trabajo: typeof updater === 'function' ? updater(s.trabajo) : updater }));
  };

  const updateComicProject = (project) => {
    setTrabajo(t => ({
      ...t,
      comicProjects: t.comicProjects.map(p => p.id === project.id ? project : p),
    }));
  };

  const deleteComicProject = (id) => {
    setTrabajo(t => ({ ...t, comicProjects: t.comicProjects.filter(p => p.id !== id) }));
  };

  const addComicProject = (project) => {
    setTrabajo(t => ({ ...t, comicProjects: [...(t.comicProjects ?? []), project] }));
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
      {/* Topbar sección */}
      <div style={{
        padding: '10px 20px',
        background: '#FFFCF9',
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.05)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'Fraunces', serif", fontStyle: 'italic',
          fontSize: 18, color: '#3A3230',
        }}>
          Trabajo
        </span>
        <div style={{ flex: 1 }} />
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: ACCENT, marginRight: 6,
        }} />
        <span style={{ fontSize: 11, color: ACCENT, letterSpacing: '0.07em' }}>eucalipto</span>
      </div>

      {/* Grid: 4 columnas en pantalla */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1.3fr',
        gap: 10,
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
      }}>

        {/* Presupuestos */}
        <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <SectionLabel>Presupuestos</SectionLabel>
          <BudgetList
            budgets={state.trabajo.budgets ?? []}
            onChange={b => setTrabajo(t => ({ ...t, budgets: b }))}
          />
        </Card>

        {/* Tareas */}
        <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <SectionLabel>Tareas pendientes</SectionLabel>
          <SimpleChecklist
            items={state.trabajo.tasks ?? []}
            onChange={t => setTrabajo(tr => ({ ...tr, tasks: t }))}
            placeholder="Nueva tarea..."
          />
        </Card>

        {/* Burocracia */}
        <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <SectionLabel>Burocracia</SectionLabel>
          <SimpleChecklist
            items={state.trabajo.buro ?? []}
            onChange={b => setTrabajo(t => ({ ...t, buro: b }))}
            placeholder="Gestión pendiente..."
          />
        </Card>

        {/* Proyectos de cómic */}
        <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionLabel>Proyectos</SectionLabel>
            <button
              onClick={() => setNewComicModal(true)}
              style={{
                background: `${ACCENT}18`, border: 'none', borderRadius: 8,
                padding: '5px 10px', cursor: 'pointer', color: ACCENT,
                fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <IconPlus size={11} /> Nuevo
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {(state.trabajo.comicProjects ?? []).length === 0 ? (
              <div style={{ fontSize: 12, color: '#C0B0A8', padding: '8px 0' }}>
                Sin proyectos todavía
              </div>
            ) : (
              (state.trabajo.comicProjects ?? []).map(p => (
                <ComicProjectCard
                  key={p.id}
                  project={p}
                  onUpdate={updateComicProject}
                  onDelete={deleteComicProject}
                />
              ))
            )}
          </div>
        </Card>
      </div>

      {newComicModal && (
        <NewComicModal
          onSave={addComicProject}
          onClose={() => setNewComicModal(false)}
        />
      )}
    </div>
  );
}
