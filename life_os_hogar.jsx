import React, { useState, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────
// LIFE OS — HOGAR
// Color: beige cálido #BFAE93 · Sin scroll · Todo en pantalla
// ─────────────────────────────────────────────────────────────────

const A = '#BFAE93';
const S = '#EFE7D7';

const ROOMS = ['salón', 'entrada', 'cocina', 'estudio', 'dormitorio', 'baño'];

export const DEFAULT_HOGAR = {
  // { salón: [{id, text, done}], ... }
  rooms: Object.fromEntries(ROOMS.map(r => [r, []])),
  // Lista de compra
  shop: [],
  // Ideas (texto libre)
  ideas: '',
  // Imágenes inspiración: [base64, base64, base64]
  inspImages: [null, null, null],
};

const CSS = `
  .hog__wrap {
    --ha: ${A}; --hs: ${S};
    --bg: #FBF8F4; --bg2: #F4EFE8; --panel: #FFFFFF;
    --ink: #2C2A26; --inks: #6B6661; --inkf: #B5AFA8; --line: #ECE6DC;
    display: flex; flex-direction: column; height: 100%; overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif; color: var(--ink);
    -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(900px 600px at 0% 0%, color-mix(in srgb, var(--hs) 45%, transparent), transparent 60%),
      radial-gradient(700px 500px at 100% 100%, color-mix(in srgb, var(--hs) 30%, transparent), transparent 55%),
      var(--bg);
  }

  /* TOPBAR */
  .hog__top {
    background: linear-gradient(135deg, var(--ha), color-mix(in srgb, var(--ha) 70%, white));
    padding: 0 28px; height: 68px; flex-shrink: 0;
    display: flex; align-items: center;
    box-shadow: 0 8px 24px -16px color-mix(in srgb, var(--ha) 80%, black);
  }
  .hog__title {
    font-family: 'Fraunces', serif; font-style: italic; font-size: 26px; color: white;
  }

  /* MAIN GRID */
  .hog__main {
    flex: 1; min-height: 0;
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 14px;
    padding: 14px 18px 14px 14px;
    overflow: hidden;
  }

  /* LEFT — To Do por habitación */
  .hog__left {
    display: flex; flex-direction: column; overflow: hidden;
  }
  .hog__card {
    background: var(--panel); border-radius: 20px; border: 1px solid var(--line);
    flex: 1; overflow: hidden; display: flex; flex-direction: column;
    box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 4px 20px -16px rgba(60,50,40,.12);
  }
  .hog__card-h {
    padding: 11px 16px 9px; border-bottom: 1px solid var(--line);
    display: flex; align-items: center; flex-shrink: 0;
  }
  .hog__pill {
    background: var(--ha); color: white;
    font-family: 'Fraunces', serif; font-style: italic; font-size: 13px;
    padding: 3px 12px 4px; border-radius: 999px;
    box-shadow: 0 3px 8px -5px color-mix(in srgb, var(--ha) 60%, transparent);
  }
  .hog__rooms-grid {
    flex: 1; min-height: 0;
    display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr);
    gap: 0;
  }
  .hog__room {
    border-right: 1px solid var(--line); border-bottom: 1px solid var(--line);
    padding: 10px 12px; display: flex; flex-direction: column; overflow: hidden;
  }
  .hog__room:nth-child(3), .hog__room:nth-child(6) { border-right: none; }
  .hog__room:nth-child(4), .hog__room:nth-child(5), .hog__room:nth-child(6) { border-bottom: none; }
  .hog__room-name {
    font-family: 'Fraunces', serif; font-style: italic; font-size: 13px;
    color: var(--ha); margin-bottom: 7px; flex-shrink: 0; letter-spacing: .02em;
  }
  .hog__room-tasks { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1px; }
  .hog__room-tasks::-webkit-scrollbar { width: 2px; }
  .hog__room-tasks::-webkit-scrollbar-thumb { background: var(--line); border-radius: 1px; }
  .hog__task {
    display: flex; align-items: center; gap: 7px;
    padding: 4px 5px; border-radius: 8px; cursor: pointer;
    transition: background .15s; border: none; background: transparent;
    text-align: left; width: 100%;
  }
  .hog__task:hover { background: var(--bg2); }
  .hog__check {
    width: 14px; height: 14px; border-radius: 4px; border: 1.5px solid var(--line);
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    transition: all .18s; pointer-events: none;
  }
  .hog__check.hog__done { background: var(--ha); border-color: var(--ha); }
  .hog__task-txt { font-size: 11px; line-height: 1.4; flex: 1; color: var(--ink); }
  .hog__task-txt.hog__done-txt { text-decoration: line-through; color: var(--inkf); }
  .hog__task-del {
    background: none; border: none; cursor: pointer; color: var(--inkf);
    font-size: 13px; opacity: 0; transition: opacity .15s; padding: 0 2px; line-height: 1;
    flex-shrink: 0;
  }
  .hog__task:hover .hog__task-del { opacity: .5; }
  .hog__task-del:hover { opacity: 1 !important; }
  .hog__add-row {
    display: flex; gap: 4px; margin-top: 5px; flex-shrink: 0;
  }
  .hog__add-in {
    flex: 1; border: 1px solid var(--line); border-radius: 7px;
    padding: 4px 7px; font: inherit; font-size: 11px; color: var(--ink);
    background: var(--bg2); outline: none;
    font-family: 'Fraunces', serif; font-style: italic;
  }
  .hog__add-in::placeholder { color: var(--inkf); }
  .hog__add-in:focus { border-color: var(--ha); }
  .hog__add-btn {
    background: var(--ha); border: none; border-radius: 7px;
    color: white; width: 22px; height: 22px; cursor: pointer;
    font-size: 15px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: opacity .18s; line-height: 1;
  }
  .hog__add-btn:hover { opacity: .85; }

  /* RIGHT COLUMN */
  .hog__right {
    display: flex; flex-direction: column; gap: 14px; overflow: hidden;
  }

  /* COMPRAS */
  .hog__side-card {
    background: var(--panel); border-radius: 20px; border: 1px solid var(--line);
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 4px 20px -16px rgba(60,50,40,.12);
  }
  .hog__side-card-h {
    padding: 10px 14px 8px; border-bottom: 1px solid var(--line); flex-shrink: 0;
  }
  .hog__shop { flex: 1; overflow-y: auto; padding: 8px 12px; display: flex; flex-direction: column; gap: 1px; }
  .hog__shop::-webkit-scrollbar { width: 2px; }
  .hog__shop::-webkit-scrollbar-thumb { background: var(--line); border-radius: 1px; }
  .hog__shop-item {
    display: flex; align-items: center; gap: 7px; padding: 4px 4px;
    border-radius: 8px; cursor: pointer; transition: background .15s; width: 100%;
    border: none; background: transparent; text-align: left;
  }
  .hog__shop-item:hover { background: var(--bg2); }
  .hog__shop-del {
    background: none; border: none; cursor: pointer; color: var(--inkf);
    font-size: 13px; opacity: 0; transition: opacity .15s; padding: 0;
    flex-shrink: 0; line-height: 1;
  }
  .hog__shop-item:hover .hog__shop-del { opacity: .5; }
  .hog__shop-del:hover { opacity: 1 !important; }
  .hog__shop-txt { font-size: 12px; flex: 1; color: var(--ink); }
  .hog__shop-txt.hog__done-txt { text-decoration: line-through; color: var(--inkf); }
  .hog__shop-add {
    display: flex; gap: 4px; padding: 6px 12px 10px; flex-shrink: 0;
  }
  .hog__shop-in {
    flex: 1; border: 1px solid var(--line); border-radius: 8px;
    padding: 5px 9px; font: inherit; font-size: 12px; color: var(--ink);
    background: var(--bg2); outline: none;
  }
  .hog__shop-in::placeholder { color: var(--inkf); font-style: italic; font-family: 'Fraunces', serif; }
  .hog__shop-in:focus { border-color: var(--ha); }
  .hog__shop-btn {
    background: var(--ha); border: none; border-radius: 8px;
    color: white; padding: 5px 9px; cursor: pointer; font-size: 14px;
    display: flex; align-items: center; transition: opacity .18s;
  }
  .hog__shop-btn:hover { opacity: .85; }

  /* IDEAS */
  .hog__ideas-card {
    background: var(--panel); border-radius: 20px; border: 1px solid var(--line);
    flex: 1; display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 4px 20px -16px rgba(60,50,40,.12);
  }
  .hog__ideas-body { flex: 1; padding: 10px 14px; overflow: hidden; }
  .hog__ideas-ta {
    width: 100%; height: 100%; resize: none; border: none; outline: none;
    font: inherit; font-size: 12px; color: var(--ink); background: transparent;
    line-height: 1.7;
  }
  .hog__ideas-ta::placeholder { color: var(--inkf); font-style: italic; font-family: 'Fraunces', serif; }

  /* IMÁGENES INSPIRACIÓN */
  .hog__insp-row {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; flex-shrink: 0;
  }
  .hog__insp-slot {
    aspect-ratio: 1; border-radius: 14px; border: 1.5px dashed var(--line);
    overflow: hidden; cursor: pointer; position: relative;
    background: var(--bg2); transition: border-color .2s;
    display: flex; align-items: center; justify-content: center;
  }
  .hog__insp-slot:hover { border-color: var(--ha); }
  .hog__insp-slot input { display: none; }
  .hog__insp-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hog__insp-empty {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    color: var(--inkf);
  }
  .hog__insp-plus { font-size: 20px; line-height: 1; }
  .hog__insp-lbl { font-size: 9px; letter-spacing: .15em; text-transform: uppercase; }
  .hog__insp-del {
    position: absolute; top: 4px; right: 4px;
    background: rgba(44,42,38,.5); border: none; border-radius: 50%;
    color: white; width: 20px; height: 20px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 11px;
    opacity: 0; transition: opacity .18s;
  }
  .hog__insp-slot:hover .hog__insp-del { opacity: 1; }
`;

// ─────────────────────────────────────────────────────────────────
export default function HogarSection({ state, setState }) {
  const [newTaskInputs, setNewTaskInputs] = useState(Object.fromEntries(ROOMS.map(r => [r, ''])));
  const [newShop, setNewShop] = useState('');
  const fileRefs = [useRef(null), useRef(null), useRef(null)];

  const hogar    = state.hogar || DEFAULT_HOGAR;
  const setHogar = updater => setState(s => ({
    ...s,
    hogar: typeof updater === 'function' ? updater(s.hogar || DEFAULT_HOGAR) : updater,
  }));

  // ── Rooms ─────────────────────────────────────────────────────
  const addTask = (room) => {
    const text = newTaskInputs[room]?.trim();
    if (!text) return;
    setHogar(h => ({
      ...h,
      rooms: {
        ...h.rooms,
        [room]: [...(h.rooms[room] || []), { id: `r${Date.now()}`, text, done: false }],
      },
    }));
    setNewTaskInputs(v => ({ ...v, [room]: '' }));
  };

  const toggleTask = (room, id) => setHogar(h => ({
    ...h,
    rooms: {
      ...h.rooms,
      [room]: h.rooms[room].map(t => t.id === id ? { ...t, done: !t.done } : t),
    },
  }));

  const deleteTask = (room, id) => setHogar(h => ({
    ...h,
    rooms: { ...h.rooms, [room]: h.rooms[room].filter(t => t.id !== id) },
  }));

  // ── Shop ──────────────────────────────────────────────────────
  const addShop = () => {
    const text = newShop.trim();
    if (!text) return;
    setHogar(h => ({ ...h, shop: [...(h.shop || []), { id: `s${Date.now()}`, text, done: false }] }));
    setNewShop('');
  };
  const toggleShop = id => setHogar(h => ({ ...h, shop: h.shop.map(x => x.id === id ? { ...x, done: !x.done } : x) }));
  const deleteShop = id => setHogar(h => ({ ...h, shop: h.shop.filter(x => x.id !== id) }));

  // ── Ideas ─────────────────────────────────────────────────────
  const updateIdeas = v => setHogar(h => ({ ...h, ideas: v }));

  // ── Imágenes ──────────────────────────────────────────────────
  const handleImg = (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setHogar(h => {
      const imgs = [...(h.inspImages || [null, null, null])];
      imgs[idx] = ev.target.result;
      return { ...h, inspImages: imgs };
    });
    reader.readAsDataURL(file);
  };
  const removeImg = (idx, e) => {
    e.stopPropagation();
    setHogar(h => {
      const imgs = [...(h.inspImages || [null, null, null])];
      imgs[idx] = null;
      return { ...h, inspImages: imgs };
    });
  };

  const shop       = hogar.shop       || [];
  const ideas      = hogar.ideas      || '';
  const inspImages = hogar.inspImages || [null, null, null];
  const rooms      = hogar.rooms      || Object.fromEntries(ROOMS.map(r => [r, []]));

  return (
    <>
      <style>{CSS}</style>
      <div className="hog__wrap">

        {/* TOPBAR */}
        <div className="hog__top">
          <span className="hog__title">hogar</span>
        </div>

        {/* MAIN */}
        <div className="hog__main">

          {/* ── IZQUIERDA: To Do por habitaciones ── */}
          <div className="hog__left">
            <div className="hog__card">
              <div className="hog__card-h">
                <span className="hog__pill">to do</span>
              </div>
              <div className="hog__rooms-grid">
                {ROOMS.map(room => (
                  <div className="hog__room" key={room}>
                    <div className="hog__room-name">{room}</div>
                    <div className="hog__room-tasks">
                      {(rooms[room] || []).map(task => (
                        <button
                          key={task.id}
                          className="hog__task"
                          onClick={() => toggleTask(room, task.id)}
                        >
                          <div className={`hog__check${task.done ? ' hog__done' : ''}`}>
                            {task.done && (
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12l5 5L20 7"/>
                              </svg>
                            )}
                          </div>
                          <span className={`hog__task-txt${task.done ? ' hog__done-txt' : ''}`}>{task.text}</span>
                          <span
                            className="hog__task-del"
                            onClick={e => { e.stopPropagation(); deleteTask(room, task.id); }}
                          >×</span>
                        </button>
                      ))}
                    </div>
                    <div className="hog__add-row">
                      <input
                        className="hog__add-in"
                        placeholder="añadir…"
                        value={newTaskInputs[room] || ''}
                        onChange={e => setNewTaskInputs(v => ({ ...v, [room]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addTask(room)}
                      />
                      <button className="hog__add-btn" onClick={() => addTask(room)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── DERECHA ── */}
          <div className="hog__right">

            {/* COMPRAS */}
            <div className="hog__side-card" style={{ flex: '0 0 auto', maxHeight: '38%' }}>
              <div className="hog__side-card-h">
                <span className="hog__pill">compras</span>
              </div>
              <div className="hog__shop">
                {shop.map(item => (
                  <button key={item.id} className="hog__shop-item" onClick={() => toggleShop(item.id)}>
                    <div className={`hog__check${item.done ? ' hog__done' : ''}`} style={{width:14,height:14,borderRadius:4,border:'1.5px solid #ECE6DC',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .18s',...(item.done?{background:A,borderColor:A}:{})}}>
                      {item.done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>}
                    </div>
                    <span className={`hog__shop-txt${item.done ? ' hog__done-txt' : ''}`}>{item.text}</span>
                    <span className="hog__shop-del" onClick={e => { e.stopPropagation(); deleteShop(item.id); }}>×</span>
                  </button>
                ))}
                {shop.length === 0 && (
                  <div style={{fontFamily:'Fraunces,serif',fontStyle:'italic',fontSize:12,color:'#B5AFA8',padding:'6px 0'}}>
                    Lista vacía
                  </div>
                )}
              </div>
              <div className="hog__shop-add">
                <input
                  className="hog__shop-in"
                  placeholder="añadir artículo…"
                  value={newShop}
                  onChange={e => setNewShop(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addShop()}
                />
                <button className="hog__shop-btn" onClick={addShop}>+</button>
              </div>
            </div>

            {/* IDEAS */}
            <div className="hog__ideas-card">
              <div className="hog__side-card-h">
                <span className="hog__pill">ideas</span>
              </div>
              <div className="hog__ideas-body">
                <textarea
                  className="hog__ideas-ta"
                  placeholder="Ideas para el hogar, proyectos, wishlist…"
                  value={ideas}
                  onChange={e => updateIdeas(e.target.value)}
                />
              </div>
            </div>

            {/* IMÁGENES INSPIRACIÓN */}
            <div className="hog__insp-row">
              {[0, 1, 2].map(idx => (
                <div
                  key={idx}
                  className="hog__insp-slot"
                  onClick={() => fileRefs[idx].current?.click()}
                >
                  <input
                    ref={fileRefs[idx]}
                    type="file"
                    accept="image/*"
                    onChange={e => handleImg(idx, e)}
                  />
                  {inspImages[idx] ? (
                    <>
                      <img className="hog__insp-img" src={inspImages[idx]} alt="inspiración"/>
                      <button className="hog__insp-del" onClick={e => removeImg(idx, e)}>×</button>
                    </>
                  ) : (
                    <div className="hog__insp-empty">
                      <span className="hog__insp-plus">+</span>
                      <span className="hog__insp-lbl">inspiración</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
