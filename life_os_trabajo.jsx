import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────────
// LIFE OS — TRABAJO
// Color: eucalipto #8FA89E · Sin scroll · Tres tarjetas en fila
// ─────────────────────────────────────────────────────────────────

const A = '#8FA89E';
const S = '#DDE7E2';

export const DEFAULT_TRABAJO = {
  // Presupuestos: [{ id, client, project, price, done }]
  budgets: [],
  // Tareas pendientes: [{ id, text, done }]
  tasks: [],
  // Burocracia: [{ id, text, done }]
  buro: [],
};

const CSS = `
  .trab__wrap {
    --ta: ${A}; --ts: ${S};
    --bg: #FBF8F4; --bg2: #F4EFE8; --panel: #FFFFFF;
    --ink: #2C2A26; --inks: #6B6661; --inkf: #B5AFA8; --line: #ECE6DC;
    display: flex; flex-direction: column; height: 100%; overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif; color: var(--ink);
    -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(900px 600px at 0% 0%, color-mix(in srgb, var(--ts) 45%, transparent), transparent 60%),
      radial-gradient(700px 500px at 100% 100%, color-mix(in srgb, var(--ts) 30%, transparent), transparent 55%),
      var(--bg);
  }

  /* TOPBAR */
  .trab__top {
    background: linear-gradient(135deg, var(--ta), color-mix(in srgb, var(--ta) 70%, white));
    padding: 0 28px; height: 68px; flex-shrink: 0;
    display: flex; align-items: center;
    box-shadow: 0 8px 24px -16px color-mix(in srgb, var(--ta) 80%, black);
  }
  .trab__title {
    font-family: 'Fraunces', serif; font-style: italic; font-size: 26px; color: white;
  }

  /* MAIN — tres columnas iguales */
  .trab__main {
    flex: 1; min-height: 0;
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 14px; padding: 14px 18px 14px 14px; overflow: hidden;
  }

  /* CARD base */
  .trab__card {
    background: var(--panel); border-radius: 20px; border: 1px solid var(--line);
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 4px 20px -16px rgba(60,50,40,.12);
  }
  .trab__card-h {
    padding: 12px 16px 10px; border-bottom: 1px solid var(--line);
    flex-shrink: 0; display: flex; align-items: center;
  }
  .trab__pill {
    background: var(--ta); color: white;
    font-family: 'Fraunces', serif; font-style: italic; font-size: 13px;
    padding: 3px 12px 4px; border-radius: 999px;
    box-shadow: 0 3px 8px -5px color-mix(in srgb, var(--ta) 60%, transparent);
  }
  .trab__card-body {
    flex: 1; overflow-y: auto; padding: 12px 14px;
    display: flex; flex-direction: column;
  }
  .trab__card-body::-webkit-scrollbar { width: 3px; }
  .trab__card-body::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }

  /* ── TO DO LIST (tareas + burocracia) ── */
  .trab__tasks { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .trab__task {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 6px 6px; border-radius: 10px; cursor: pointer;
    transition: background .15s; border: none; background: transparent;
    text-align: left; width: 100%;
  }
  .trab__task:hover { background: var(--bg2); }
  .trab__check {
    width: 15px; height: 15px; border-radius: 5px; border: 1.5px solid var(--line);
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: all .18s; margin-top: 1px;
  }
  .trab__check--done { background: var(--ta); border-color: var(--ta); }
  .trab__task-txt { font-size: 12px; line-height: 1.5; flex: 1; color: var(--ink); }
  .trab__task-txt--done { text-decoration: line-through; color: var(--inkf); }
  .trab__task-del {
    background: none; border: none; cursor: pointer; color: var(--inkf);
    font-size: 14px; opacity: 0; transition: opacity .15s; padding: 0;
    flex-shrink: 0; line-height: 1; margin-top: 1px;
  }
  .trab__task:hover .trab__task-del { opacity: .5; }
  .trab__task-del:hover { opacity: 1 !important; }
  .trab__add {
    display: flex; gap: 6px; margin-top: 8px;
    padding-top: 8px; border-top: 1px solid var(--line); flex-shrink: 0;
  }
  .trab__add-in {
    flex: 1; border: 1.5px solid var(--line); border-radius: 10px;
    padding: 7px 10px; font: inherit; font-size: 12px; color: var(--ink);
    background: var(--bg2); outline: none;
    font-family: 'Fraunces', serif; font-style: italic;
  }
  .trab__add-in::placeholder { color: var(--inkf); }
  .trab__add-in:focus { border-color: var(--ta); }
  .trab__add-btn {
    background: var(--ta); border: none; border-radius: 10px;
    color: white; padding: 7px 12px; cursor: pointer; font-size: 16px;
    display: flex; align-items: center; transition: opacity .18s; line-height: 1;
  }
  .trab__add-btn:hover { opacity: .85; }

  /* ── PRESUPUESTOS ── */
  .trab__budgets { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .trab__budget-item {
    background: var(--bg2); border-radius: 12px; padding: 10px 12px;
    border: 1px solid transparent; transition: border-color .18s;
    display: flex; flex-direction: column; gap: 4px; position: relative;
  }
  .trab__budget-item:hover { border-color: var(--line); }
  .trab__budget-item--done { opacity: .55; }
  .trab__budget-top {
    display: flex; align-items: center; gap: 8px;
  }
  .trab__budget-check {
    width: 15px; height: 15px; border-radius: 50%; border: 1.5px solid var(--line);
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all .18s;
  }
  .trab__budget-check--done { background: var(--ta); border-color: var(--ta); }
  .trab__budget-client {
    font-family: 'Fraunces', serif; font-size: 14px; flex: 1;
    color: var(--ink); cursor: pointer;
  }
  .trab__budget-client--done { text-decoration: line-through; color: var(--inkf); }
  .trab__budget-del {
    background: none; border: none; cursor: pointer; color: var(--inkf);
    font-size: 14px; opacity: 0; transition: opacity .15s; padding: 0; line-height: 1;
  }
  .trab__budget-item:hover .trab__budget-del { opacity: .5; }
  .trab__budget-del:hover { opacity: 1 !important; }
  .trab__budget-meta {
    display: flex; align-items: center; gap: 8px; padding-left: 23px;
  }
  .trab__budget-project {
    font-size: 11px; color: var(--inks); flex: 1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .trab__budget-price {
    font-family: 'Fraunces', serif; font-size: 14px; color: var(--ta);
    white-space: nowrap;
  }

  /* Form nuevo presupuesto */
  .trab__budget-form {
    background: var(--bg2); border-radius: 12px; padding: 10px 12px;
    border: 1.5px dashed var(--line); display: flex; flex-direction: column; gap: 6px;
    margin-top: 4px;
  }
  .trab__budget-form-row { display: flex; gap: 6px; }
  .trab__fin {
    border: 1.5px solid var(--line); border-radius: 9px;
    padding: 6px 10px; font: inherit; font-size: 12px; color: var(--ink);
    background: white; outline: none; width: 100%;
  }
  .trab__fin::placeholder { color: var(--inkf); font-style: italic; font-family: 'Fraunces', serif; }
  .trab__fin:focus { border-color: var(--ta); }
  .trab__fin--price { width: 90px; flex-shrink: 0; }
  .trab__form-actions { display: flex; gap: 6px; }
  .trab__form-save {
    flex: 1; background: var(--ta); border: none; border-radius: 9px;
    color: white; padding: 7px; font: inherit; font-size: 12px;
    font-family: 'Fraunces', serif; font-style: italic;
    cursor: pointer; transition: opacity .18s;
  }
  .trab__form-save:hover { opacity: .88; }
  .trab__form-cancel {
    background: transparent; border: 1.5px solid var(--line); border-radius: 9px;
    padding: 7px 12px; font: inherit; font-size: 12px; color: var(--inks);
    cursor: pointer; transition: border-color .18s;
  }
  .trab__form-cancel:hover { border-color: var(--ta); }
  .trab__add-budget-btn {
    display: flex; align-items: center; gap: 6px; justify-content: center;
    width: 100%; padding: 8px; border-radius: 10px;
    border: 1.5px dashed var(--line); background: transparent;
    color: var(--inks); font: inherit; font-size: 12px; cursor: pointer;
    transition: all .18s; margin-top: 4px;
    font-family: 'Fraunces', serif; font-style: italic;
  }
  .trab__add-budget-btn:hover { border-color: var(--ta); color: var(--ta); background: var(--bg2); }

  /* Total */
  .trab__total {
    padding: 10px 0 2px; border-top: 1px solid var(--line);
    display: flex; justify-content: space-between; align-items: baseline;
    flex-shrink: 0;
  }
  .trab__total-lbl { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--inkf); }
  .trab__total-val { font-family: 'Fraunces', serif; font-size: 20px; color: var(--ta); }

  /* Empty state */
  .trab__empty {
    font-family: 'Fraunces', serif; font-style: italic;
    font-size: 12px; color: var(--inkf); padding: 8px 0;
  }
`;

const CheckIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────
export default function TrabajoSection({ state, setState }) {
  const [newTask,    setNewTask]    = useState('');
  const [newBuro,    setNewBuro]    = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [formData,   setFormData]   = useState({ client: '', project: '', price: '' });

  const trabajo    = state.trabajo || DEFAULT_TRABAJO;
  const setTrabajo = updater => setState(s => ({
    ...s,
    trabajo: typeof updater === 'function' ? updater(s.trabajo || DEFAULT_TRABAJO) : updater,
  }));

  // ── Tareas ────────────────────────────────────────────────────
  const addTask = () => {
    const text = newTask.trim();
    if (!text) return;
    setTrabajo(t => ({ ...t, tasks: [...(t.tasks || []), { id: `tk${Date.now()}`, text, done: false }] }));
    setNewTask('');
  };
  const toggleTask = id => setTrabajo(t => ({ ...t, tasks: t.tasks.map(x => x.id === id ? { ...x, done: !x.done } : x) }));
  const deleteTask = id => setTrabajo(t => ({ ...t, tasks: t.tasks.filter(x => x.id !== id) }));

  // ── Burocracia ────────────────────────────────────────────────
  const addBuro = () => {
    const text = newBuro.trim();
    if (!text) return;
    setTrabajo(t => ({ ...t, buro: [...(t.buro || []), { id: `bu${Date.now()}`, text, done: false }] }));
    setNewBuro('');
  };
  const toggleBuro = id => setTrabajo(t => ({ ...t, buro: t.buro.map(x => x.id === id ? { ...x, done: !x.done } : x) }));
  const deleteBuro = id => setTrabajo(t => ({ ...t, buro: t.buro.filter(x => x.id !== id) }));

  // ── Presupuestos ──────────────────────────────────────────────
  const saveBudget = () => {
    const client = formData.client.trim();
    if (!client) return;
    setTrabajo(t => ({
      ...t,
      budgets: [...(t.budgets || []), {
        id: `bg${Date.now()}`,
        client,
        project: formData.project.trim(),
        price:   formData.price.trim(),
        done:    false,
      }],
    }));
    setFormData({ client: '', project: '', price: '' });
    setShowForm(false);
  };
  const toggleBudget = id => setTrabajo(t => ({ ...t, budgets: t.budgets.map(x => x.id === id ? { ...x, done: !x.done } : x) }));
  const deleteBudget = id => setTrabajo(t => ({ ...t, budgets: t.budgets.filter(x => x.id !== id) }));

  const budgets = trabajo.budgets || [];
  const tasks   = trabajo.tasks   || [];
  const buro    = trabajo.buro    || [];

  // Total presupuestos pendientes
  const total = budgets
    .filter(b => !b.done)
    .reduce((sum, b) => {
      const n = parseFloat(b.price?.replace(/[^\d.,]/g, '').replace(',', '.'));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  const totalStr = total > 0 ? `${total.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €` : '—';

  return (
    <>
      <style>{CSS}</style>
      <div className="trab__wrap">

        {/* TOPBAR */}
        <div className="trab__top">
          <span className="trab__title">trabajo</span>
        </div>

        {/* MAIN — tres columnas */}
        <div className="trab__main">

          {/* ── PRESUPUESTOS ── */}
          <div className="trab__card">
            <div className="trab__card-h">
              <span className="trab__pill">presupuestos</span>
            </div>
            <div className="trab__card-body">
              <div className="trab__budgets">
                {budgets.length === 0 && !showForm && (
                  <div className="trab__empty">Ningún presupuesto todavía.</div>
                )}
                {budgets.map(b => (
                  <div key={b.id} className={`trab__budget-item${b.done ? ' trab__budget-item--done' : ''}`}>
                    <div className="trab__budget-top">
                      <div
                        className={`trab__budget-check${b.done ? ' trab__budget-check--done' : ''}`}
                        onClick={() => toggleBudget(b.id)}
                      >
                        {b.done && <CheckIcon/>}
                      </div>
                      <span
                        className={`trab__budget-client${b.done ? ' trab__budget-client--done' : ''}`}
                        onClick={() => toggleBudget(b.id)}
                      >{b.client}</span>
                      <button className="trab__budget-del" onClick={() => deleteBudget(b.id)}>×</button>
                    </div>
                    {(b.project || b.price) && (
                      <div className="trab__budget-meta">
                        {b.project && <span className="trab__budget-project">{b.project}</span>}
                        {b.price   && <span className="trab__budget-price">{b.price}</span>}
                      </div>
                    )}
                  </div>
                ))}

                {showForm && (
                  <div className="trab__budget-form">
                    <input
                      className="trab__fin" placeholder="Cliente"
                      value={formData.client}
                      onChange={e => setFormData(v => ({ ...v, client: e.target.value }))}
                      autoFocus
                    />
                    <div className="trab__budget-form-row">
                      <input
                        className="trab__fin" placeholder="Proyecto"
                        value={formData.project}
                        onChange={e => setFormData(v => ({ ...v, project: e.target.value }))}
                      />
                      <input
                        className="trab__fin trab__fin--price" placeholder="Precio"
                        value={formData.price}
                        onChange={e => setFormData(v => ({ ...v, price: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && saveBudget()}
                      />
                    </div>
                    <div className="trab__form-actions">
                      <button className="trab__form-save" onClick={saveBudget}>guardar</button>
                      <button className="trab__form-cancel" onClick={() => { setShowForm(false); setFormData({ client:'', project:'', price:'' }); }}>cancelar</button>
                    </div>
                  </div>
                )}

                {!showForm && (
                  <button className="trab__add-budget-btn" onClick={() => setShowForm(true)}>
                    + nuevo presupuesto
                  </button>
                )}
              </div>

              {/* Total */}
              <div className="trab__total">
                <span className="trab__total-lbl">pendiente</span>
                <span className="trab__total-val">{totalStr}</span>
              </div>
            </div>
          </div>

          {/* ── TAREAS PENDIENTES ── */}
          <div className="trab__card">
            <div className="trab__card-h">
              <span className="trab__pill">tareas pendientes</span>
            </div>
            <div className="trab__card-body">
              <div className="trab__tasks">
                {tasks.length === 0 && (
                  <div className="trab__empty">Sin tareas pendientes.</div>
                )}
                {tasks.map(task => (
                  <button key={task.id} className="trab__task" onClick={() => toggleTask(task.id)}>
                    <div className={`trab__check${task.done ? ' trab__check--done' : ''}`}>
                      {task.done && <CheckIcon/>}
                    </div>
                    <span className={`trab__task-txt${task.done ? ' trab__task-txt--done' : ''}`}>{task.text}</span>
                    <span className="trab__task-del" onClick={e => { e.stopPropagation(); deleteTask(task.id); }}>×</span>
                  </button>
                ))}
              </div>
              <div className="trab__add">
                <input
                  className="trab__add-in" placeholder="añadir tarea…"
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                />
                <button className="trab__add-btn" onClick={addTask}>+</button>
              </div>
            </div>
          </div>

          {/* ── BUROCRACIA ── */}
          <div className="trab__card">
            <div className="trab__card-h">
              <span className="trab__pill">burocracia</span>
            </div>
            <div className="trab__card-body">
              <div className="trab__tasks">
                {buro.length === 0 && (
                  <div className="trab__empty">Sin trámites pendientes.</div>
                )}
                {buro.map(item => (
                  <button key={item.id} className="trab__task" onClick={() => toggleBuro(item.id)}>
                    <div className={`trab__check${item.done ? ' trab__check--done' : ''}`}>
                      {item.done && <CheckIcon/>}
                    </div>
                    <span className={`trab__task-txt${item.done ? ' trab__task-txt--done' : ''}`}>{item.text}</span>
                    <span className="trab__task-del" onClick={e => { e.stopPropagation(); deleteBuro(item.id); }}>×</span>
                  </button>
                ))}
              </div>
              <div className="trab__add">
                <input
                  className="trab__add-in" placeholder="añadir trámite…"
                  value={newBuro}
                  onChange={e => setNewBuro(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addBuro()}
                />
                <button className="trab__add-btn" onClick={addBuro}>+</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
