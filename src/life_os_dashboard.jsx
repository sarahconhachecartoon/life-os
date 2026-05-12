import React, { useState, useRef } from 'react';

const today      = () => new Date().toISOString().split('T')[0];
const MONTHS_ES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES    = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DAYS_SHORT = ['D','L','M','X','J','V','S'];
const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Iconos ────────────────────────────────────────────────────────────────────
const IconPlus   = ({ s=13 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
const IconCheck  = ({ s=9  }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
const IconTrash  = ({ s=11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IconEdit   = ({ s=11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconClose  = ({ s=11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IconRepeat = ({ s=11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/></svg>;
const IconStar   = ({ s=12, filled }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?'currentColor':'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const IconDrag   = ({ s=11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="7" r="1" fill="currentColor"/><circle cx="15" cy="7" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="17" r="1" fill="currentColor"/><circle cx="15" cy="17" r="1" fill="currentColor"/></svg>;

// ─── Primitivos ────────────────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{
    background: '#FFFCF9', borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.035)',
    padding: '12px 14px', ...style,
  }}>{children}</div>
);

const Pill = ({ children, color }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center',
    fontFamily: "'Fraunces', serif", fontStyle: 'italic',
    fontSize: 10.5, letterSpacing: '0.04em', color: '#fff',
    background: color ?? '#9A8A80', borderRadius: 20,
    padding: '2px 10px', marginBottom: 8,
  }}>{children}</div>
);

const Bar = ({ value, accent }) => (
  <div style={{ width:'100%', height:3, borderRadius:3, background:`${accent}20`, overflow:'hidden' }}>
    <div style={{ width:`${Math.min(value,100)}%`, height:'100%', background:accent, borderRadius:3, transition:'width 0.5s' }}/>
  </div>
);

const MOODS = [
  { id:'bad',       label:'Mal',       color:'#B88A75' },
  { id:'normal',    label:'Normal',    color:'#A89B8C' },
  { id:'good',      label:'Bien',      color:'#9FB1B8' },
  { id:'excellent', label:'Excelente', color:'#A89DB3' },
];

// ─── BookRow ───────────────────────────────────────────────────────────────────
const BookRow = ({ label, book, accent, onEdit, onPageUp }) => {
  const pct = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
  return (
    <div style={{ padding:'7px 9px', borderRadius:9, border:`1px solid ${accent}15`, background:`${accent}06` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
        <span style={{ fontSize:8, letterSpacing:'0.09em', color:accent, textTransform:'uppercase', fontWeight:'500' }}>{label}</span>
        <button onClick={onEdit} style={{ background:'none', border:'none', cursor:'pointer', color:`${accent}60`, padding:0 }}><IconEdit s={10}/></button>
      </div>
      {book.title ? (
        <>
          <div style={{ fontFamily:"'Fraunces',serif", fontStyle:'italic', fontSize:11.5, color:'#3A3230', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{book.title}</div>
          <div style={{ fontSize:9.5, color:'#9A8A80', marginBottom:4, marginTop:1 }}>{book.author}</div>
          <Bar value={pct} accent={accent}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:3 }}>
            <span style={{ fontSize:9.5, color:'#9A8A80' }}>p.{book.currentPage}/{book.totalPages}</span>
            <button onClick={onPageUp} style={{ padding:'1px 6px', borderRadius:5, border:`1px solid ${accent}25`, background:'transparent', color:accent, fontSize:9.5, cursor:'pointer' }}>+1</button>
          </div>
        </>
      ) : (
        <button onClick={onEdit} style={{ background:'none', border:'none', cursor:'pointer', color:`${accent}45`, fontSize:11, padding:0 }}>Añadir libro...</button>
      )}
    </div>
  );
};

// ─── Modal tarea ───────────────────────────────────────────────────────────────
const TaskModal = ({ task, onSave, onClose, accent }) => {
  const [text, setText]         = useState(task?.text ?? '');
  const [priority, setPriority] = useState(task?.priority ?? false);
  const [recDays, setRecDays]   = useState(task?.recurrence?.days ?? []);
  const toggleDay = d => setRecDays(p => p.includes(d) ? p.filter(x=>x!==d) : [...p,d]);
  const save = () => {
    if (!text.trim()) return;
    onSave({ id:task?.id??uid(), text:text.trim(), done:task?.done??false, priority, recurrence:recDays.length>0?{days:recDays}:null });
    onClose();
  };
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.12)', zIndex:200, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#FDFAF7', borderRadius:20, border:`1px solid ${accent}30`, boxShadow:'0 20px 48px rgba(0,0,0,0.12)', padding:'24px 26px', width:370, zIndex:201 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontFamily:"'Fraunces',serif", fontStyle:'italic', fontSize:16, color:'#3A3230' }}>{task?'Editar tarea':'Nueva tarea'}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#9A8A80' }}><IconClose s={14}/></button>
        </div>
        <input autoFocus value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&save()} placeholder="Descripción..."
          style={{ width:'100%', boxSizing:'border-box', padding:'9px 13px', borderRadius:10, border:`1.5px solid ${accent}28`, background:'#FAF7F3', fontSize:13, color:'#3A3230', fontFamily:"'Inter',sans-serif", outline:'none', marginBottom:12 }}/>
        <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:14 }}>
          <div onClick={()=>setPriority(p=>!p)} style={{ width:17, height:17, borderRadius:5, border:`1.5px solid ${priority?accent:'#C0B0A8'}`, background:priority?accent:'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
            {priority && <IconCheck s={10}/>}
          </div>
          <span style={{ fontSize:13, color:'#5A4A42' }}>Prioritaria (sube arriba)</span>
        </label>
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:10, color:'#9A8A80', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }}>Repetir semanalmente</div>
          <div style={{ display:'flex', gap:4 }}>
            {DAYS_SHORT.map((d,i) => (
              <button key={i} onClick={()=>toggleDay(i)} style={{ width:30, height:30, borderRadius:8, border:`1.5px solid ${recDays.includes(i)?accent:'#D8CEC8'}`, background:recDays.includes(i)?`${accent}20`:'transparent', color:recDays.includes(i)?accent:'#9A8A80', fontSize:11, cursor:'pointer', transition:'all 0.15s' }}>{d}</button>
            ))}
          </div>
          {recDays.length>0 && <div style={{ fontSize:11, color:accent, marginTop:5 }}>Repite cada {recDays.map(d=>DAYS_ES[d]).join(', ')}</div>}
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 16px', borderRadius:10, border:'1px solid #D8CEC8', background:'transparent', color:'#9A8A80', fontSize:13, cursor:'pointer' }}>Cancelar</button>
          <button onClick={save} style={{ padding:'8px 16px', borderRadius:10, border:'none', background:accent, color:'#fff', fontSize:13, cursor:'pointer' }}>Guardar</button>
        </div>
      </div>
    </>
  );
};

// ─── Modal libro ───────────────────────────────────────────────────────────────
const BookModal = ({ slot, book, onSave, onClose, accent }) => {
  const LABELS = { kindle:'Kindle', paper:'Libro', audio:'Libro compartido' };
  const [form, setForm] = useState({...book});
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.12)', zIndex:200, backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#FDFAF7', borderRadius:20, border:`1px solid ${accent}30`, boxShadow:'0 20px 48px rgba(0,0,0,0.12)', padding:'24px 26px', width:350, zIndex:201 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontFamily:"'Fraunces',serif", fontStyle:'italic', fontSize:16, color:'#3A3230' }}>{LABELS[slot]}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#9A8A80' }}><IconClose s={14}/></button>
        </div>
        {['title','author'].map(k=>(
          <input key={k} value={form[k]} onChange={set(k)} placeholder={k==='title'?'Título...':'Autor/a...'}
            style={{ width:'100%', boxSizing:'border-box', padding:'8px 13px', borderRadius:10, border:`1.5px solid ${accent}25`, background:'#FAF7F3', fontSize:13, color:'#3A3230', fontFamily:"'Inter',sans-serif", outline:'none', marginBottom:8 }}/>
        ))}
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {['currentPage','totalPages'].map(k=>(
            <input key={k} type="number" min="0" value={form[k]} onChange={set(k)} placeholder={k==='currentPage'?'Pág. actual':'Total págs.'}
              style={{ flex:1, padding:'8px 10px', borderRadius:10, border:`1.5px solid ${accent}25`, background:'#FAF7F3', fontSize:13, color:'#3A3230', fontFamily:"'Inter',sans-serif", outline:'none' }}/>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 16px', borderRadius:10, border:'1px solid #D8CEC8', background:'transparent', color:'#9A8A80', fontSize:13, cursor:'pointer' }}>Cancelar</button>
          <button onClick={()=>{onSave(form);onClose();}} style={{ padding:'8px 16px', borderRadius:10, border:'none', background:accent, color:'#fff', fontSize:13, cursor:'pointer' }}>Guardar</button>
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

  const [taskModal, setTaskModal]     = useState(null);
  const [bookModal, setBookModal]     = useState(null);
  const [agendaInput, setAgendaInput] = useState({ time:'', text:'' });
  const dragIdx  = useRef(null);
  const dragOver = useRef(null);

  // ── Tareas — prioritarias siempre arriba ─────────────────────────────────────
  const tasks = state.tasks ?? [];
  const sortedTasks = [
    ...tasks.filter(t => t.priority && !t.done),
    ...tasks.filter(t => !t.priority && !t.done),
    ...tasks.filter(t => t.done),
  ];
  const priorityCount = tasks.filter(t => t.priority).length;

  const saveTask = task => setState(s => {
    const list = s.tasks ?? [];
    const exists = list.find(t => t.id === task.id);
    return { ...s, tasks: exists ? list.map(t => t.id===task.id ? task : t) : [...list, task] };
  });
  const toggleTask     = id => setState(s => ({ ...s, tasks:(s.tasks??[]).map(t => t.id===id ? {...t,done:!t.done} : t) }));
  const deleteTask     = id => setState(s => ({ ...s, tasks:(s.tasks??[]).filter(t => t.id!==id) }));
  const togglePriority = id => setState(s => {
    const list = s.tasks ?? [];
    const task = list.find(t => t.id===id);
    if (!task) return s;
    if (!task.priority && list.filter(t=>t.priority).length >= 3) return s;
    return { ...s, tasks: list.map(t => t.id===id ? {...t,priority:!t.priority} : t) };
  });
  const onDragStart = i => { dragIdx.current = i; };
  const onDragEnter = i => { dragOver.current = i; };
  const onDragEnd   = () => setState(s => {
    const list = [...(s.tasks??[])];
    const [moved] = list.splice(dragIdx.current, 1);
    list.splice(dragOver.current, 0, moved);
    dragIdx.current = null; dragOver.current = null;
    return { ...s, tasks:list };
  });

  // ── Hábitos ─────────────────────────────────────────────────────────────────
  const toggleHabit = (type, id) => setState(s => ({
    ...s,
    habits: { ...s.habits, [type]:(s.habits?.[type]??[]).map(h => h.id===id ? {...h, doneDate:h.doneDate?null:todayStr} : h) },
  }));

  // ── Agenda ──────────────────────────────────────────────────────────────────
  const addAgenda = () => {
    if (!agendaInput.text.trim()) return;
    setState(s => ({
      ...s,
      agenda: { today:[...(s.agenda?.today??[]), {id:uid(), time:agendaInput.time, text:agendaInput.text.trim()}].sort((a,b)=>a.time.localeCompare(b.time)) },
    }));
    setAgendaInput({ time:'', text:'' });
  };
  const deleteAgenda = id => setState(s => ({ ...s, agenda:{ today:(s.agenda?.today??[]).filter(i=>i.id!==id) } }));

  // ── Mood, ciclo, libros ──────────────────────────────────────────────────────
  const currentMood = state.moodHistory?.[todayStr];
  const setMood = id => setState(s => ({ ...s, moodHistory:{...s.moodHistory,[todayStr]:id} }));

  const cycleDay = state.cycleLog?.[todayStr];
  const getCyclePhase = d => {
    if (!d) return null;
    if (d<=5)  return { label:'Menstrual', color:'#B88A75' };
    if (d<=13) return { label:'Folicular', color:'#9FB1B8' };
    if (d<=16) return { label:'Ovulación', color:'#A89DB3' };
    return { label:'Lútea', color:'#A89B8C' };
  };
  const cyclePhase = getCyclePhase(cycleDay);

  const emptyBook = { title:'', author:'', currentPage:0, totalPages:0 };
  const updateBook = (slot, data) => setState(s => ({ ...s, reading:{...s.reading,[slot]:{...(s.reading?.[slot]??emptyBook),...data}} }));
  const bumpPage   = slot => setState(s => {
    const b = s.reading?.[slot] ?? emptyBook;
    if (b.currentPage < b.totalPages) return { ...s, reading:{...s.reading,[slot]:{...b,currentPage:b.currentPage+1}} };
    return s;
  });

  const latestWeight    = state.body?.weight?.slice(-1)?.[0]?.value ?? null;
  const activeMonomania = state.personal?.monomanias?.find(m => m.active);
  const currentMonth    = now.toISOString().slice(0,7);
  const monthImgs       = state.personal?.gallery?.[currentMonth] ?? [];
  const inspImg         = state.inspirationImage ?? monthImgs[0] ?? null;

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px 12px',
      gap: 8,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 24px',
        background: accent,
        borderRadius: 13,
        flexShrink: 0,
        height: 40,
      }}>
        <span style={{ fontFamily:"'Fraunces',serif", fontStyle:'italic', fontSize:12, letterSpacing:'0.14em', color:'rgba(255,255,255,0.82)', textTransform:'uppercase' }}>
          {MONTHS_ES[now.getMonth()]}
        </span>
        <span style={{ fontFamily:"'Fraunces',serif", fontStyle:'italic', fontSize:21, color:'#fff' }}>
          {DAYS_ES[now.getDay()]} {now.getDate()}
        </span>
        <span style={{ fontFamily:"'Fraunces',serif", fontStyle:'italic', fontSize:12, letterSpacing:'0.14em', color:'rgba(255,255,255,0.82)' }}>
          {now.getFullYear()}
        </span>
      </div>

      {/* ── BODY: 4 columnas según el sketch ── */}
      {/*
          Col 1 (imagen): ancho fijo, altura completa
          Col 2 (hábitos arriba + agenda abajo): flex
          Col 3 (to do arriba + menú abajo): flex
          Col 4 (estado + lectura + notas + monomanía): ancho fijo
      */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '210px 1fr 1fr 250px',
        gap: 8,
        minHeight: 0,
        overflow: 'hidden',
      }}>

        {/* ── COL 1: Imagen ── */}
        <Card style={{ padding:0, overflow:'hidden' }}>
          {inspImg ? (
            <img src={inspImg} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
          ) : (
            <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:`${accent}10`, color:`${accent}50`, fontSize:11, textAlign:'center', padding:16 }}>
              Añade imágenes en Personal
            </div>
          )}
        </Card>

        {/* ── COL 2: Hábitos (arriba) + Agenda (abajo) ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, minHeight:0, overflow:'hidden' }}>

          {/* Hábitos — ~55% */}
          <Card style={{ flex:'0 0 54%', overflowY:'auto' }}>
            <Pill color={accent}>hábitos</Pill>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[{key:'morning',label:'Mañana'},{key:'night',label:'Noche'}].map(({key,label}) => (
                <div key={key}>
                  <div style={{ fontSize:8.5, color:accent, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:6 }}>{label}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {(state.habits?.[key]??[]).map(h => {
                      const done = h.doneDate === todayStr;
                      return (
                        <label key={h.id} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                          <div onClick={()=>toggleHabit(key,h.id)} style={{
                            width:13, height:13, borderRadius:3, flexShrink:0,
                            border:`1.5px solid ${done?accent:'#C8B8B0'}`,
                            background:done?accent:'transparent',
                            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', transition:'all 0.15s',
                          }}>
                            {done && <IconCheck s={7}/>}
                          </div>
                          <span style={{ fontSize:11.5, color:done?`${accent}85`:'#5A4A42', textDecoration:done?'line-through':'none' }}>{h.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Agenda — resto */}
          <Card style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <Pill color={accent}>agenda</Pill>
            <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:3, marginBottom:8 }}>
              {(state.agenda?.today??[]).length===0 && <div style={{ fontSize:11.5, color:'#C0B0A8' }}>Sin eventos</div>}
              {(state.agenda?.today??[]).map(item => (
                <div key={item.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'3px 7px', borderRadius:7, background:`${accent}07` }}>
                  <span style={{ fontSize:10.5, color:accent, fontWeight:'500', flexShrink:0, minWidth:32 }}>{item.time}</span>
                  <span style={{ fontSize:11.5, color:'#3A3230', flex:1 }}>{item.text}</span>
                  <button onClick={()=>deleteAgenda(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#D0C0B8', padding:0 }}><IconClose/></button>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:5, flexShrink:0 }}>
              <input type="time" value={agendaInput.time} onChange={e=>setAgendaInput(a=>({...a,time:e.target.value}))}
                style={{ width:64, padding:'5px 7px', borderRadius:7, border:`1px solid ${accent}20`, background:'#FAF7F3', fontSize:11, color:'#3A3230', outline:'none' }}/>
              <input value={agendaInput.text} onChange={e=>setAgendaInput(a=>({...a,text:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&addAgenda()} placeholder="Evento..."
                style={{ flex:1, padding:'5px 9px', borderRadius:7, border:`1px solid ${accent}20`, background:'#FAF7F3', fontSize:11, color:'#3A3230', outline:'none' }}/>
              <button onClick={addAgenda} style={{ background:accent, border:'none', borderRadius:7, width:26, height:26, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <IconPlus s={12}/>
              </button>
            </div>
          </Card>
        </div>

        {/* ── COL 3: To Do (arriba) + Menú (abajo) ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, minHeight:0, overflow:'hidden' }}>

          {/* To Do — ~55% */}
          <Card style={{ flex:'0 0 54%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <Pill color={accent}>to do</Pill>
              <button onClick={()=>setTaskModal('new')} style={{
                background:`${accent}18`, border:'none', borderRadius:7,
                width:22, height:22, cursor:'pointer', color:accent,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <IconPlus s={12}/>
              </button>
            </div>

            <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>
              {sortedTasks.length===0 && <div style={{ fontSize:11.5, color:'#C0B0A8' }}>Sin tareas por hoy</div>}
              {sortedTasks.map((task,i) => (
                <div key={task.id} draggable
                  onDragStart={()=>onDragStart(i)}
                  onDragEnter={()=>onDragEnter(i)}
                  onDragEnd={onDragEnd}
                  style={{
                    display:'flex', alignItems:'center', gap:4,
                    padding:'4px 6px', borderRadius:8,
                    background:task.done?'transparent':(task.priority?`${accent}10`:'transparent'),
                    border:task.priority&&!task.done?`1px solid ${accent}20`:'1px solid transparent',
                    cursor:'grab', opacity:task.done?0.4:1, transition:'all 0.15s',
                  }}
                >
                  <span style={{ color:'#D0C0B8', flexShrink:0 }}><IconDrag/></span>
                  <div onClick={()=>toggleTask(task.id)} style={{
                    width:13, height:13, borderRadius:3, flexShrink:0,
                    border:`1.5px solid ${task.done?accent:'#C8B8B0'}`,
                    background:task.done?accent:'transparent',
                    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', transition:'all 0.15s',
                  }}>
                    {task.done && <IconCheck s={7}/>}
                  </div>
                  <span style={{ flex:1, fontSize:12, color:'#3A3230', textDecoration:task.done?'line-through':'none', wordBreak:'break-word' }}>
                    {task.text}
                  </span>
                  {task.recurrence && <span style={{ color:`${accent}60`, flexShrink:0 }} title="Recurrente"><IconRepeat s={10}/></span>}
                  <button onClick={()=>togglePriority(task.id)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:task.priority?accent:'#DDD0C8', flexShrink:0 }}>
                    <IconStar s={11} filled={task.priority}/>
                  </button>
                  <button onClick={()=>setTaskModal(task)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#DDD0C8', flexShrink:0 }}>
                    <IconEdit/>
                  </button>
                  <button onClick={()=>deleteTask(task.id)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#DDD0C8', flexShrink:0 }}>
                    <IconTrash/>
                  </button>
                </div>
              ))}
            </div>
            {priorityCount>0 && <div style={{ fontSize:9, color:`${accent}70`, marginTop:3 }}>{priorityCount}/3 prioritarias</div>}
          </Card>

          {/* Menú — resto */}
          <Card style={{ flex:1, overflowY:'auto' }}>
            <Pill color={accent}>menú</Pill>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {['desayuno','snack','almuerzo','cena'].map(meal => (
                <div key={meal} style={{ padding:'5px 8px', borderRadius:8, background:`${accent}07` }}>
                  <div style={{ fontSize:7.5, color:accent, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:1 }}>{meal}</div>
                  <div style={{ fontSize:12, color:state.menu?.[meal]?'#3A3230':'#C0B0A8' }}>{state.menu?.[meal]||'—'}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── COL 4: Estado + Lectura + Notas + Monomanía ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, overflowY:'auto' }}>

          {/* Estado */}
          <Card style={{ flexShrink:0 }}>
            <Pill color={accent}>estado</Pill>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ padding:'6px 9px', borderRadius:9, background:`${accent}10`, border:`1px solid ${accent}16` }}>
                <div style={{ fontSize:8, color:accent, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:1 }}>Peso</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:'#3A3230', lineHeight:1.1 }}>{latestWeight?`${latestWeight} kg`:'—'}</div>
              </div>
              <div style={{ padding:'6px 9px', borderRadius:9, background:cyclePhase?`${cyclePhase.color}12`:`${accent}10`, border:`1px solid ${cyclePhase?cyclePhase.color+'22':accent+'16'}` }}>
                <div style={{ fontSize:8, color:cyclePhase?.color??accent, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:1 }}>Ciclo</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:12.5, color:'#3A3230' }}>{cycleDay?`Día ${cycleDay} · ${cyclePhase?.label}`:'—'}</div>
              </div>
              <div>
                <div style={{ fontSize:8, color:accent, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:5 }}>Me siento</div>
                <div style={{ display:'flex', gap:3 }}>
                  {MOODS.map(m => (
                    <button key={m.id} onClick={()=>setMood(m.id)} style={{ flex:1, padding:'4px 1px', borderRadius:6, border:`1.5px solid ${currentMood===m.id?m.color:m.color+'25'}`, background:currentMood===m.id?`${m.color}20`:'transparent', color:m.color, fontSize:8.5, cursor:'pointer', transition:'all 0.15s' }}>{m.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Lectura */}
          <Card style={{ flexShrink:0 }}>
            <Pill color={accent}>lectura</Pill>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {[{slot:'kindle',label:'Kindle'},{slot:'paper',label:'Libro'},{slot:'audio',label:'Libro compartido'}].map(({slot,label}) => (
                <BookRow key={slot} label={label}
                  book={state.reading?.[slot]??emptyBook}
                  accent={accent}
                  onEdit={()=>setBookModal(slot)}
                  onPageUp={()=>bumpPage(slot)}
                />
              ))}
            </div>
          </Card>

          {/* Notas */}
          <Card style={{ flex:1, display:'flex', flexDirection:'column', minHeight:60 }}>
            <Pill color={accent}>notas</Pill>
            <textarea
              value={state.notes??''}
              onChange={e=>setState(s=>({...s,notes:e.target.value}))}
              placeholder="Ideas, recordatorios..."
              style={{ flex:1, resize:'none', border:'none', outline:'none', background:'transparent', fontSize:12, color:'#3A3230', fontFamily:"'Inter',sans-serif", lineHeight:1.6 }}
            />
          </Card>

          {/* Monomanía */}
          <Card style={{ flexShrink:0 }}>
            <Pill color={accent}>monomanía</Pill>
            {activeMonomania ? (
              <div>
                <div style={{ fontFamily:"'Fraunces',serif", fontStyle:'italic', fontSize:13, color:'#3A3230', marginBottom:3 }}>{activeMonomania.title}</div>
                {activeMonomania.notes && <div style={{ fontSize:11, color:'#7A6A62', lineHeight:1.5 }}>{activeMonomania.notes.slice(0,90)}{activeMonomania.notes.length>90?'…':''}</div>}
              </div>
            ) : (
              <div style={{ fontSize:11.5, color:'#C0B0A8' }}>Sin monomanía activa</div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      {taskModal && <TaskModal task={taskModal==='new'?null:taskModal} accent={accent} onSave={saveTask} onClose={()=>setTaskModal(null)}/>}
      {bookModal && <BookModal slot={bookModal} book={state.reading?.[bookModal]??emptyBook} accent={accent} onSave={data=>updateBook(bookModal,data)} onClose={()=>setBookModal(null)}/>}
    </div>
  );
}