import React, { useState, useMemo, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────
// LIFE OS — FITNESS v2
// Una sola pantalla sin tabs · Dos columnas con scroll independiente
// Izq: Plan semanal + Ideas de comidas
// Der: Gráficas · Estado emocional · Gym · Ciclo
// ─────────────────────────────────────────────────────────────────

const A = '#D9A892';
const S = '#F6E7DD';

const MEAL_TYPES = ['desayuno', 'snack', 'almuerzo', 'cena'];
const GYM_TYPES  = ['Piernas', 'Empuje', 'Glúteos', 'Tracción'];
const GYM_COLORS = { Piernas:'#9DAE99', Empuje:'#9FB1B8', Glúteos:'#D9A892', Tracción:'#A89DB3' };
const WEEK_DAYS  = ['L','M','X','J','V','S','D'];
const WEEK_DAYS_FULL = ['lun','mar','mié','jue','vie','sáb','dom'];
// Mapeo JS getDay() (0=dom) → índice semana (0=lun)
const getDowIndex = () => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; };
const WEEK_FULL  = ['lun','mar','mié','jue','vie','sáb','dom'];
const MONTHS_L   = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MONTHS_S   = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

const MOODS = [
  { id:'mal',       label:'Mal',       color:'#B88A75' },
  { id:'normal',    label:'Normal',    color:'#A89B8C' },
  { id:'bien',      label:'Bien',      color:'#9FB1B8' },
  { id:'excelente', label:'Excelente', color:'#A89DB3' },
];

const getCyclePhase = d => {
  if (d>=1&&d<=4)   return 'Menstruación';
  if (d>=5&&d<=11)  return 'Folicular';
  if (d===12)       return 'Ovulación';
  if (d>=13&&d<=25) return 'Lútea';
  return '—';
};

const todayKey  = (d=new Date()) => d.toISOString().slice(0,10);
const getMonday = date => { const d=new Date(date); const day=d.getDay(); d.setDate(d.getDate()+((day===0)?-6:1-day)); d.setHours(0,0,0,0); return d; };
const addDays   = (date,n) => { const d=new Date(date); d.setDate(d.getDate()+n); return d; };
const fmt       = date => date.toISOString().slice(0,10);
const getMonthDays = (year,month) => {
  const first=new Date(year,month,1); const last=new Date(year,month+1,0);
  const pad=(first.getDay()===0)?6:first.getDay()-1;
  const days=[]; for(let i=0;i<pad;i++) days.push(null);
  for(let d=1;d<=last.getDate();d++) days.push(new Date(year,month,d));
  return days;
};

export const DEFAULT_FITNESS = {
  bodyLog: {},
  foodLibrary: {
    desayuno:[ {id:'f1',name:'Porridge con frutos rojos'},{id:'f2',name:'Yogur proteína'},{id:'f3',name:'Tostada aguacate + huevo'} ],
    snack:   [ {id:'f4',name:'Manzana + almendras'},{id:'f5',name:'Requesón + miel'} ],
    almuerzo:[ {id:'f6',name:'Salmón al horno + quinoa'},{id:'f7',name:'Pasta de lentejas + pollo'} ],
    cena:    [ {id:'f9',name:'Crema de calabacín'},{id:'f10',name:'Tortilla de verduras'} ],
  },
  weekMenu:   {},
  gymLog:     {},
  cycleStart: null,
};

// ─── Icons ────────────────────────────────────────────────────────
const Ico = ({ n, size=16 }) => {
  const p={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round'};
  switch(n) {
    case 'chevL': return <svg {...p}><path d="M15 18l-6-6 6-6"/></svg>;
    case 'chevR': return <svg {...p}><path d="M9 18l6-6-6-6"/></svg>;
    case 'plus':  return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'trash': return <svg {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>;
    default: return null;
  }
};

const CSS = `
  .f2__wrap {
    --fa:${A}; --fs:${S};
    --bg:#FBF8F4; --bg2:#F4EFE8; --panel:#FFFFFF;
    --ink:#2C2A26; --inks:#6B6661; --inkf:#B5AFA8; --line:#ECE6DC;
    display:flex; flex-direction:column; height:100%; overflow:hidden;
    font-family:'Inter',system-ui,sans-serif; color:var(--ink); -webkit-font-smoothing:antialiased;
    background:
      radial-gradient(900px 600px at 0% 0%,color-mix(in srgb,var(--fs) 40%,transparent),transparent 60%),
      radial-gradient(700px 500px at 100% 100%,color-mix(in srgb,var(--fs) 28%,transparent),transparent 55%),
      var(--bg);
  }
  /* TOPBAR */
  .f2__top { background:linear-gradient(135deg,var(--fa),color-mix(in srgb,var(--fa) 72%,white)); padding:0 28px; height:68px; flex-shrink:0; display:flex; align-items:center; justify-content:space-between; color:white; box-shadow:0 8px 24px -16px color-mix(in srgb,var(--fa) 80%,black); }
  .f2__title { font-family:'Fraunces',serif; font-style:italic; font-size:26px; }
  .f2__week-nav { display:flex; align-items:center; gap:10px; }
  .f2__nav-btn { background:rgba(255,255,255,.2); border:1.5px solid rgba(255,255,255,.35); border-radius:8px; padding:5px 9px; cursor:pointer; color:white; display:flex; align-items:center; transition:background .2s; }
  .f2__nav-btn:hover { background:rgba(255,255,255,.35); }
  .f2__week-lbl { font-family:'Fraunces',serif; font-style:italic; font-size:14px; }
  /* MAIN */
  .f2__main { flex:1; min-height:0; overflow:hidden; display:grid; grid-template-columns:1fr 1fr; gap:14px; padding:14px 18px 14px 14px; }
  .f2__col { overflow-y:auto; display:flex; flex-direction:column; gap:14px; padding-bottom:4px; }
  .f2__col::-webkit-scrollbar { width:3px; }
  .f2__col::-webkit-scrollbar-thumb { background:var(--line); border-radius:2px; }
  /* CARD */
  .f2__card { background:var(--panel); border-radius:20px; border:1px solid var(--line); overflow:hidden; flex-shrink:0; box-shadow:0 1px 0 rgba(255,255,255,.7) inset,0 4px 20px -16px rgba(60,50,40,.12); }
  .f2__card-h { padding:11px 16px 9px; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; }
  .f2__pill { background:var(--fa); color:white; font-family:'Fraunces',serif; font-style:italic; font-size:14px; padding:3px 13px 4px; border-radius:999px; box-shadow:0 3px 8px -5px color-mix(in srgb,var(--fa) 60%,transparent); }
  .f2__card-b { padding:12px 14px; }
  .f2__slbl { font-size:9px; letter-spacing:.24em; text-transform:uppercase; color:var(--inkf); margin-bottom:8px; margin-top:2px; }

  /* PLAN SEMANAL VERTICAL */
  .f2__vplan { display:flex; flex-direction:column; gap:0; }
  .f2__vplan-header { display:grid; grid-template-columns:44px repeat(4,1fr); padding:0 0 6px; border-bottom:1.5px solid var(--line); margin-bottom:3px; }
  .f2__vmeal-head { font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:var(--inkf); text-align:center; padding:2px 4px; font-family:'Fraunces',serif; font-style:italic; }
  .f2__vplan-row { display:grid; grid-template-columns:44px repeat(4,1fr); border-bottom:1px solid color-mix(in srgb,var(--line) 50%,transparent); transition:background .15s; }
  .f2__vplan-row:last-child { border-bottom:none; }
  .f2__vplan-today { background:color-mix(in srgb,var(--fs) 45%,transparent); border-radius:8px; }
  .f2__vday-lbl { font-family:'Fraunces',serif; font-style:italic; font-size:13px; color:var(--inks); display:flex; align-items:center; padding:6px 4px; }
  .f2__vplan-today .f2__vday-lbl { color:var(--fa); font-weight:500; }
  .f2__vcell { padding:4px 3px; display:flex; align-items:center; min-height:34px; }
  .f2__vsel { width:100%; border:none; outline:none; background:transparent; font:inherit; font-size:10px; color:var(--ink); cursor:pointer; line-height:1.3; }

  /* IDEAS DE COMIDAS */
  .f2__ideas-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  .f2__ic-h { font-family:'Fraunces',serif; font-style:italic; font-size:13px; color:var(--fa); margin-bottom:5px; }
  .f2__ic-item { display:flex; align-items:center; justify-content:space-between; padding:4px 8px; background:var(--bg2); border-radius:7px; font-size:11px; margin-bottom:3px; }
  .f2__ic-del { background:none; border:none; cursor:pointer; color:var(--inkf); font-size:12px; opacity:0; transition:opacity .15s; padding:0; }
  .f2__ic-item:hover .f2__ic-del { opacity:.6; }
  .f2__ic-add { display:flex; gap:5px; margin-top:8px; padding:6px; background:var(--bg2); border-radius:9px; align-items:center; }
  .f2__ic-sel { border:1.5px solid var(--line); border-radius:6px; padding:4px 6px; font-family:'Fraunces',serif; font-style:italic; font-size:11px; background:white; color:var(--ink); outline:none; }
  .f2__ic-in  { flex:1; border:1.5px solid var(--line); border-radius:6px; padding:4px 7px; font:inherit; font-size:11px; color:var(--ink); background:white; outline:none; }
  .f2__ic-in::placeholder { color:var(--inkf); font-style:italic; font-family:'Fraunces',serif; }
  .f2__ic-in:focus,.f2__ic-sel:focus { border-color:var(--fa); }
  .f2__ic-btn { background:var(--fa); border:none; border-radius:6px; color:white; padding:4px 8px; cursor:pointer; display:flex; align-items:center; }

  /* GRÁFICA CUERPO */
  .f2__mtabs { display:flex; gap:5px; margin-bottom:10px; }
  .f2__mtab { flex:1; padding:6px 0; border:1.5px solid var(--line); border-radius:9px; background:transparent; color:var(--inks); font-family:'Fraunces',serif; font-style:italic; font-size:12px; cursor:pointer; transition:all .2s; }
  .f2__mtab.f2__on { background:var(--fa); border-color:var(--fa); color:white; }
  .f2__bigval { font-family:'Fraunces',serif; font-size:44px; line-height:1; display:flex; align-items:baseline; gap:5px; margin-bottom:8px; }
  .f2__bigunit { font-size:15px; color:var(--inkf); font-family:'Inter',sans-serif; }
  .f2__chart-box { background:var(--bg2); border-radius:12px; padding:10px 12px; }
  .f2__no-data { font-family:'Fraunces',serif; font-style:italic; font-size:12px; color:var(--inkf); padding:8px 0; }
  .f2__quick { display:flex; gap:6px; margin-top:10px; }
  .f2__quick-in { flex:1; border:1.5px solid var(--line); border-radius:9px; padding:6px 10px; font:inherit; font-size:13px; font-family:'Fraunces',serif; color:var(--ink); background:var(--bg2); outline:none; }
  .f2__quick-in:focus { border-color:var(--fa); }
  .f2__quick-btn { background:var(--fa); border:none; border-radius:9px; color:white; padding:6px 14px; font-family:'Fraunces',serif; font-style:italic; font-size:13px; cursor:pointer; box-shadow:0 4px 10px -5px color-mix(in srgb,var(--fa) 70%,transparent); }

  /* ESTADO EMOCIONAL */
  .f2__mood-nav { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .f2__mood-m { font-family:'Fraunces',serif; font-style:italic; font-size:15px; }
  .f2__mood-nbtn { background:var(--bg2); border:1.5px solid var(--line); border-radius:7px; padding:4px 8px; cursor:pointer; color:var(--inks); display:flex; align-items:center; transition:border-color .2s; }
  .f2__mood-nbtn:hover { border-color:var(--fa); }
  .f2__mood-leg { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
  .f2__mood-li { display:flex; align-items:center; gap:5px; font-size:10px; color:var(--inks); }
  .f2__mood-ld { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
  .f2__cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
  .f2__cal-head { font-size:9px; letter-spacing:.13em; text-transform:uppercase; color:var(--inkf); text-align:center; padding-bottom:3px; }
  .f2__mood-cell { aspect-ratio:1; border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; cursor:pointer; border:1.5px solid transparent; }
  .f2__mood-cell.f2__td { border-color:var(--fa); }
  .f2__mood-cell.f2__empty { cursor:default; }
  .f2__cdn { font-size:8px; color:var(--inkf); line-height:1; }
  .f2__cdn.f2__td-n { color:var(--fa); font-weight:600; }
  /* Mood picker popup */
  .f2__mpop { position:fixed; z-index:40; background:var(--panel); border-radius:14px; border:1px solid var(--line); padding:10px 12px; display:flex; gap:8px; box-shadow:0 14px 36px -18px rgba(60,50,40,.2); }
  .f2__mopt { display:flex; flex-direction:column; align-items:center; gap:5px; padding:8px 10px; border-radius:10px; cursor:pointer; border:2px solid transparent; background:transparent; transition:all .18s; }
  .f2__mopt:hover { background:var(--bg2); }
  .f2__mopt.f2__mopt-sel { border-color:var(--ink); }
  .f2__mopt-dot { width:22px; height:22px; border-radius:50%; flex-shrink:0; }
  .f2__mopt-lbl { font-size:9px; font-family:'Fraunces',serif; font-style:italic; color:var(--inks); }

  /* GYM CALENDARIO */
  .f2__gym-leg { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
  .f2__gym-li { display:flex; align-items:center; gap:3px; font-size:9px; color:var(--inks); }
  .f2__gym-ld { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .f2__gym-cell { aspect-ratio:1; border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; cursor:pointer; border:1.5px solid transparent; background:var(--bg2); transition:all .15s; }
  .f2__gym-cell.f2__td { border-color:var(--fa); }
  .f2__gym-cell.f2__empty { background:transparent; cursor:default; }
  /* Gym popup */
  .f2__gpop { position:fixed; z-index:40; background:var(--panel); border-radius:11px; border:1px solid var(--line); padding:6px; display:flex; flex-direction:column; gap:3px; box-shadow:0 12px 30px -16px rgba(60,50,40,.2); min-width:100px; }
  .f2__gpopt { padding:5px 10px; border-radius:7px; border:none; background:transparent; font:inherit; font-size:11px; color:var(--ink); cursor:pointer; text-align:left; }
  .f2__gpopt:hover { background:var(--bg2); }
  .f2__gpopt-clear { color:var(--inkf); font-style:italic; font-family:'Fraunces',serif; }

  /* CICLO */
  .f2__ciclo-info { display:flex; align-items:baseline; gap:10px; margin-bottom:8px; }
  .f2__ciclo-big { font-family:'Fraunces',serif; font-size:40px; line-height:1; color:var(--fa); }
  .f2__fase { display:inline-block; padding:2px 10px; border-radius:20px; font-family:'Fraunces',serif; font-style:italic; font-size:12px; color:white; background:var(--fa); }
  .f2__ciclo-cell { aspect-ratio:1; border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; border:1.5px solid transparent; }
  .f2__ciclo-cell.f2__td { border-color:var(--fa); }
  .f2__ciclo-leg { display:flex; gap:5px; flex-wrap:wrap; margin-top:8px; margin-bottom:10px; }
  .f2__ciclo-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:8px; }
  .f2__ciclo-lbl { font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--inkf); }
  .f2__ciclo-val { font-family:'Fraunces',serif; font-style:italic; font-size:12px; color:var(--inks); flex:1; }
  .f2__ciclo-btn { background:transparent; border:1.5px solid var(--fa); border-radius:8px; padding:4px 10px; cursor:pointer; font-family:'Fraunces',serif; font-style:italic; font-size:12px; color:var(--fa); transition:all .2s; }
  .f2__ciclo-btn:hover { background:var(--fa); color:white; }
  .f2__ciclo-din { border:1.5px solid var(--fa); border-radius:8px; padding:4px 9px; font:inherit; font-size:12px; color:var(--ink); outline:none; background:white; }
  .f2__ciclo-save { background:var(--fa); color:white; border:none; border-radius:8px; padding:4px 12px; font-family:'Fraunces',serif; font-style:italic; font-size:12px; cursor:pointer; }
`;

export default function FitnessSection({ state, setState }) {
  const today = todayKey();
  const now   = new Date();
  const todayDowIndex = getDowIndex();

  const [calYear,       setCalYear]       = useState(now.getFullYear());
  const [calMonth,      setCalMonth]      = useState(now.getMonth());
  const [bodyMetric,    setBodyMetric]    = useState('weight');
  const [quickVal,      setQuickVal]      = useState('');
  const [newIdea,       setNewIdea]       = useState({ type:'desayuno', name:'' });
  const [cycleOpen,     setCycleOpen]     = useState(false);
  const [cycleDateIn,   setCycleDateIn]   = useState('');
  const [moodPopup,     setMoodPopup]     = useState(null);
  const [gymPopup,      setGymPopup]      = useState(null);

  const fitness    = state.fitness || DEFAULT_FITNESS;
  const setFitness = upd => setState(s => ({ ...s, fitness: typeof upd==='function' ? upd(s.fitness||DEFAULT_FITNESS) : upd }));

  const foodLib  = fitness.foodLibrary || DEFAULT_FITNESS.foodLibrary;
  const weekMenu = fitness.weekMenu    || {};
  const setMeal  = (dayKey, meal, val) => {
    setFitness(f=>({...f,weekMenu:{...f.weekMenu,[dayKey]:{...(f.weekMenu[dayKey]||{}),[meal]:val}}}));
    // Sync dashboard menu if this is today's day
    const todayDow = WEEK_DAYS_FULL[getDowIndex()];
    if (dayKey === todayDow) setState(s=>({...s,menu:{...s.menu,[meal]:val}}));
  };

  // Ideas
  const addIdea    = () => { const n=newIdea.name.trim(); if(!n) return; setFitness(f=>({...f,foodLibrary:{...f.foodLibrary,[newIdea.type]:[...(f.foodLibrary[newIdea.type]||[]),{id:`f${Date.now()}`,name:n}]}})); setNewIdea(v=>({...v,name:''})); };
  const removeIdea = (type,id) => setFitness(f=>({...f,foodLibrary:{...f.foodLibrary,[type]:f.foodLibrary[type].filter(x=>x.id!==id)}}));

  // Cuerpo
  const bodyLog = fitness.bodyLog || {};
  const bodySeries = useMemo(() => Object.entries(bodyLog).filter(([,v])=>v[bodyMetric]!==undefined).sort(([a],[b])=>a.localeCompare(b)).slice(-12).map(([date,v])=>({date,value:v[bodyMetric]})), [bodyLog,bodyMetric]);
  const chartPath  = useMemo(() => {
    if (bodySeries.length<2) return '';
    const vals=bodySeries.map(p=>p.value); const mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1;
    const w=420,h=80,step=w/(bodySeries.length-1);
    return bodySeries.map((p,i)=>{ const x=i*step,y=h-((p.value-mn)/rng)*h; return `${i===0?'M':'L'} ${x.toFixed(1)} ${(y+4).toFixed(1)}`; }).join(' ');
  }, [bodySeries]);

  const saveQuick = () => {
    const val=parseFloat(quickVal); if(isNaN(val)) return;
    setFitness(f=>({...f,bodyLog:{...f.bodyLog,[today]:{...(f.bodyLog[today]||{}),[bodyMetric]:val}}}));
    if (bodyMetric==='weight') setState(s=>{ const newW=[...(s.body?.weight?.filter(p=>p.date!==today)||[]),{date:today,value:val}].sort((a,b)=>a.date.localeCompare(b.date)); return{...s,body:{...(s.body||{}),weight:newW}}; });
    setQuickVal('');
  };

  // Ánimos
  const moodHistory = state.moodHistory || {};
  const monthDays   = useMemo(()=>getMonthDays(calYear,calMonth),[calYear,calMonth]);
  const prevMo = () => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); };
  const nextMo = () => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); };

  const openMoodPop = (e,ds) => { const r=e.currentTarget.getBoundingClientRect(); setMoodPopup({ds,x:r.left,y:r.bottom+4}); setGymPopup(null); };
  const setMoodDay  = (ds,id) => { setState(s=>({...s,moodHistory:{...s.moodHistory,[ds]:id}})); setMoodPopup(null); };

  // Gym
  const gymLog = fitness.gymLog || {};
  const openGymPop = (e,ds) => { const r=e.currentTarget.getBoundingClientRect(); setGymPopup({ds,x:r.left,y:r.bottom+4}); setMoodPopup(null); };
  const setGymDay  = (ds,type) => { setFitness(f=>({...f,gymLog:{...f.gymLog,[ds]:type?{went:true,type}:{went:false,type:null}}})); setGymPopup(null); };

  // Ciclo
  const cycleStart = fitness.cycleStart;
  const cycleDay   = useMemo(()=>{ if(!cycleStart) return null; const d=Math.floor((new Date(today)-new Date(cycleStart))/86400000)+1; return d>0?d:null; },[cycleStart,today]);
  const cyclePhase = cycleDay?getCyclePhase(cycleDay):null;

  const getCicloCol = d => {
    if (!cycleStart||!d) return null;
    const diff=Math.floor((new Date(fmt(d))-new Date(cycleStart))/86400000)+1;
    if (diff<1||diff>25) return null;
    const ph=getCyclePhase(diff);
    return ph==='Menstruación'?'#E8A0A0':ph==='Folicular'?'#B5CBB7':ph==='Ovulación'?'#D9A892':ph==='Lútea'?'#C9B8D4':null;
  };

  const metricUnit = bodyMetric==='weight'?'kg':'cm';
  const metricLbl  = bodyMetric==='weight'?'Peso':bodyMetric==='waist'?'Cintura':'Cadera';

  return (
    <>
      <style>{CSS}</style>

      {/* Popup ánimos */}
      {moodPopup && (
        <div style={{position:'fixed',inset:0,zIndex:39}} onClick={()=>setMoodPopup(null)}>
          <div className="f2__mpop" style={{top:moodPopup.y,left:moodPopup.x}} onClick={e=>e.stopPropagation()}>
            {MOODS.map(m=>(
              <button key={m.id} className={`f2__mopt${moodHistory[moodPopup.ds]===m.id?' f2__mopt-sel':''}`} onClick={()=>setMoodDay(moodPopup.ds,m.id)}>
                <div className="f2__mopt-dot" style={{background:m.color}}/>
                <span className="f2__mopt-lbl">{m.label.toLowerCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popup gym */}
      {gymPopup && (
        <div style={{position:'fixed',inset:0,zIndex:39}} onClick={()=>setGymPopup(null)}>
          <div className="f2__gpop" style={{top:gymPopup.y,left:gymPopup.x}} onClick={e=>e.stopPropagation()}>
            {GYM_TYPES.map(t=>(
              <button key={t} className="f2__gpopt"
                style={gymLog[gymPopup.ds]?.type===t?{background:GYM_COLORS[t],color:'white',borderRadius:7}:{}}
                onClick={()=>setGymDay(gymPopup.ds,t)}>{t}</button>
            ))}
            <button className="f2__gpopt f2__gpopt-clear" onClick={()=>setGymDay(gymPopup.ds,null)}>no fui</button>
          </div>
        </div>
      )}

      <div className="f2__wrap">
        {/* TOPBAR */}
        <div className="f2__top">
          <span className="f2__title">fitness</span>

        </div>

        <div className="f2__main">
          {/* ── COL IZQ: Plan semanal + Ideas ── */}
          <div className="f2__col">

            {/* PLAN SEMANAL — plantilla fija, vertical, sin fechas */}
            <div className="f2__card">
              <div className="f2__card-h"><span className="f2__pill">plan semanal</span></div>
              <div className="f2__card-b" style={{padding:'8px 12px'}}>
                <div className="f2__vplan">
                  {/* Cabecera de comidas */}
                  <div className="f2__vplan-header">
                    <div className="f2__vday-lbl"/>
                    {MEAL_TYPES.map(meal => (
                      <div key={meal} className="f2__vmeal-head">{meal}</div>
                    ))}
                  </div>
                  {/* Filas por día */}
                  {WEEK_DAYS_FULL.map((day, i) => {
                    const isToday = i === todayDowIndex;
                    return (
                      <div key={day} className={`f2__vplan-row${isToday ? ' f2__vplan-today' : ''}`}>
                        <div className="f2__vday-lbl">{day}</div>
                        {MEAL_TYPES.map(meal => (
                          <div key={meal} className="f2__vcell">
                            <select className="f2__vsel"
                              value={weekMenu[day]?.[meal] || ''}
                              onChange={e => setMeal(day, meal, e.target.value)}>
                              <option value="">—</option>
                              {(foodLib[meal] || []).map(o => (
                                <option key={o.id} value={o.name}>{o.name}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* IDEAS DE COMIDAS */}
            <div className="f2__card">
              <div className="f2__card-h"><span className="f2__pill">ideas de comidas</span></div>
              <div className="f2__card-b">
                <div className="f2__ideas-grid">
                  {MEAL_TYPES.map(type=>(
                    <div key={type}>
                      <div className="f2__ic-h">{type}</div>
                      {(foodLib[type]||[]).map(item=>(
                        <div key={item.id} className="f2__ic-item">
                          <span>{item.name}</span>
                          <button className="f2__ic-del" onClick={()=>removeIdea(type,item.id)}><Ico n="trash" size={11}/></button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="f2__ic-add">
                  <select className="f2__ic-sel" value={newIdea.type} onChange={e=>setNewIdea(v=>({...v,type:e.target.value}))}>
                    {MEAL_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                  <input className="f2__ic-in" placeholder="añadir…" value={newIdea.name}
                    onChange={e=>setNewIdea(v=>({...v,name:e.target.value}))}
                    onKeyDown={e=>e.key==='Enter'&&addIdea()}/>
                  <button className="f2__ic-btn" onClick={addIdea}><Ico n="plus" size={14}/></button>
                </div>
              </div>
            </div>
          </div>

          {/* ── COL DER: Gráficas · Ánimos · Gym · Ciclo ── */}
          <div className="f2__col">

            {/* GRÁFICAS CUERPO */}
            <div className="f2__card">
              <div className="f2__card-h"><span className="f2__pill">gráficas</span></div>
              <div className="f2__card-b">
                <div className="f2__mtabs">
                  {[['weight','Peso'],['waist','Cintura'],['hip','Cadera']].map(([k,lbl])=>(
                    <button key={k} className={`f2__mtab${bodyMetric===k?' f2__on':''}`} onClick={()=>setBodyMetric(k)}>{lbl}</button>
                  ))}
                </div>
                {bodySeries.length>0 ? (
                  <>
                    <div className="f2__bigval">{bodySeries[bodySeries.length-1].value}<span className="f2__bigunit">{metricUnit}</span></div>
                    <div className="f2__chart-box">
                      <svg width="100%" height="84" viewBox="0 0 420 84" preserveAspectRatio="none">
                        <defs><linearGradient id="f2g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A} stopOpacity=".2"/><stop offset="100%" stopColor={A} stopOpacity="0"/></linearGradient></defs>
                        <path d={`${chartPath} L 420 88 L 0 88 Z`} fill="url(#f2g)"/>
                        <path d={chartPath} fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        {bodySeries.map((p,i)=>{ const vals=bodySeries.map(x=>x.value); const mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1; const step=420/(bodySeries.length-1); const x=i*step,y=80-((p.value-mn)/rng)*80+4; return <circle key={i} cx={x} cy={y} r="3" fill={A} stroke="white" strokeWidth="1.5"/>; })}
                      </svg>
                    </div>
                  </>
                ) : <div className="f2__no-data">Sin registros todavía.</div>}
                <div className="f2__quick">
                  <input className="f2__quick-in" type="number" step="0.1" placeholder={`${metricLbl} de hoy (${metricUnit})…`} value={quickVal} onChange={e=>setQuickVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveQuick()}/>
                  <button className="f2__quick-btn" onClick={saveQuick}>guardar</button>
                </div>
              </div>
            </div>

            {/* ESTADO EMOCIONAL */}
            <div className="f2__card">
              <div className="f2__card-h"><span className="f2__pill">estado emocional</span></div>
              <div className="f2__card-b">
                <div className="f2__mood-nav">
                  <button className="f2__mood-nbtn" onClick={prevMo}><Ico n="chevL" size={13}/></button>
                  <span className="f2__mood-m">{MONTHS_L[calMonth]} {calYear}</span>
                  <button className="f2__mood-nbtn" onClick={nextMo}><Ico n="chevR" size={13}/></button>
                </div>
                <div className="f2__mood-leg">
                  {MOODS.map(m=><div key={m.id} className="f2__mood-li"><div className="f2__mood-ld" style={{background:m.color}}/>{m.label.toLowerCase()}</div>)}
                </div>
                <div className="f2__cal-grid">
                  {WEEK_FULL.map(d=><div key={d} className="f2__cal-head">{d}</div>)}
                  {monthDays.map((d,i)=>{
                    if (!d) return <div key={`e${i}`} className="f2__mood-cell f2__empty"/>;
                    const ds=fmt(d), moodId=moodHistory[ds], isT=ds===today;
                    const moodObj = MOODS.find(m=>m.id===moodId);
                    return (
                      <div key={ds} className={`f2__mood-cell${isT?' f2__td':''}`}
                        style={{background: moodObj ? moodObj.color : '#F4EFE8'}}
                        onClick={e=>openMoodPop(e,ds)}>
                        <span className={`f2__cdn${isT?' f2__td-n':''}`}
                          style={{color: moodObj ? 'white' : undefined}}>
                          {d.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* GYM */}
            <div className="f2__card">
              <div className="f2__card-h"><span className="f2__pill">gym</span></div>
              <div className="f2__card-b">
                <div className="f2__gym-leg">
                  {GYM_TYPES.map(t=><div key={t} className="f2__gym-li"><div className="f2__gym-ld" style={{background:GYM_COLORS[t]}}/>{t}</div>)}
                </div>
                <div className="f2__cal-grid">
                  {WEEK_FULL.map(d=><div key={d} className="f2__cal-head">{d}</div>)}
                  {monthDays.map((d,i)=>{
                    if (!d) return <div key={`e${i}`} className="f2__gym-cell f2__empty"/>;
                    const ds=fmt(d),entry=gymLog[ds]||{},isT=ds===today;
                    const bg=entry.went&&entry.type?GYM_COLORS[entry.type]:undefined;
                    return (
                      <div key={ds} className={`f2__gym-cell${isT?' f2__td':''}`}
                        style={bg?{background:bg}:{}} onClick={e=>openGymPop(e,ds)}>
                        <span className="f2__cdn" style={bg?{color:'white'}:{}}>{d.getDate()}</span>
                        {entry.went&&!entry.type&&<div style={{width:5,height:5,borderRadius:'50%',background:A,marginTop:1}}/>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CICLO */}
            <div className="f2__card">
              <div className="f2__card-h"><span className="f2__pill">ciclo</span></div>
              <div className="f2__card-b">
                {cycleDay && (
                  <div className="f2__ciclo-info">
                    <span className="f2__ciclo-big">{cycleDay}</span>
                    <div>
                      <div style={{fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--inkf)',marginBottom:3}}>día de ciclo</div>
                      {cyclePhase&&<span className="f2__fase">{cyclePhase.toLowerCase()}</span>}
                    </div>
                  </div>
                )}
                <div className="f2__cal-grid">
                  {WEEK_FULL.map(d=><div key={d} className="f2__cal-head">{d}</div>)}
                  {monthDays.map((d,i)=>{
                    if (!d) return <div key={`e${i}`} className="f2__ciclo-cell"/>;
                    const ds=fmt(d),isT=ds===today,col=getCicloCol(d);
                    return (
                      <div key={ds} className={`f2__ciclo-cell${isT?' f2__td':''}`} style={{background:col||'#F4EFE8'}}>
                        <span className="f2__cdn" style={{color:col?'white':'var(--inkf)'}}>{d.getDate()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="f2__ciclo-leg">
                  {[['Menstruación','#E8A0A0'],['Folicular','#B5CBB7'],['Ovulación','#D9A892'],['Lútea','#C9B8D4']].map(([n,c])=>(
                    <div key={n} style={{display:'flex',alignItems:'center',gap:3,fontSize:9,color:'var(--inks)'}}>
                      <div style={{width:7,height:7,borderRadius:'50%',background:c,flexShrink:0}}/>{n}
                    </div>
                  ))}
                </div>
                <div className="f2__ciclo-row">
                  <span className="f2__ciclo-lbl">inicio periodo</span>
                  <span className="f2__ciclo-val">{cycleStart||'no registrado'}</span>
                  {cycleOpen ? (
                    <>
                      <input type="date" className="f2__ciclo-din" value={cycleDateIn} onChange={e=>setCycleDateIn(e.target.value)}/>
                      <button className="f2__ciclo-save" onClick={()=>{ if(cycleDateIn) setFitness(f=>({...f,cycleStart:cycleDateIn})); setCycleOpen(false); }}>ok</button>
                    </>
                  ) : (
                    <button className="f2__ciclo-btn" onClick={()=>{ setCycleDateIn(cycleStart||''); setCycleOpen(true); }}>{cycleStart?'cambiar':'registrar'}</button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}