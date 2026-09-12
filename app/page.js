'use client';

import { useEffect, useMemo, useState } from 'react';

const TARGET_CAL = 3000;
const TARGET_PROTEIN = 140;
const presets = [
  {name:'McDouble + nuggets + small fries', cal:800, protein:35},
  {name:'Wingstop chicken sandwich + fries', cal:1000, protein:40},
  {name:'Steak + rice', cal:750, protein:55},
  {name:'Greek yogurt + granola', cal:400, protein:25},
  {name:'Mass shake', cal:750, protein:45},
  {name:'3 eggs + toast', cal:450, protein:25},
  {name:'Chicken Alfredo', cal:700, protein:30},
];

export default function Home(){
  const [meals,setMeals]=useState([]);
  const [weights,setWeights]=useState([]);
  const [text,setText]=useState('');
  const [weight,setWeight]=useState('');
  useEffect(()=>{
    try { setMeals(JSON.parse(localStorage.getItem('htc-meals'))||[]); setWeights(JSON.parse(localStorage.getItem('htc-weights'))||[]); } catch {}
  },[]);
  useEffect(()=>{localStorage.setItem('htc-meals',JSON.stringify(meals))},[meals]);
  useEffect(()=>{localStorage.setItem('htc-weights',JSON.stringify(weights))},[weights]);
  const totals=useMemo(()=>meals.reduce((a,m)=>({cal:a.cal+m.cal,protein:a.protein+m.protein}),{cal:0,protein:0}),[meals]);
  function addPreset(p){setMeals(v=>[...v,{...p,id:Date.now()}])}
  function addCustom(){
    const match=text.match(/(.+?)[,\-]\s*(\d+)\s*(?:cal|kcal).*?(\d+)\s*g/i);
    if(!match)return alert('Try: Steak bowl - 850 cal, 55g protein');
    setMeals(v=>[...v,{id:Date.now(),name:match[1].trim(),cal:+match[2],protein:+match[3]}]); setText('');
  }
  function addWeight(){if(!weight)return; setWeights(v=>[...v,{id:Date.now(),value:+weight,date:new Date().toLocaleDateString()}]);setWeight('')}
  const lastWeight=weights.at(-1)?.value;
  return <main>
    <header><div className="jp">せいしんと ときの へや</div><h1>HYPERBOLIC<br/><span>TIME CHAMBER</span></h1><p>JAPAN BULK // DEC 30</p></header>
    <section className="stats">
      <div><b>{totals.cal}</b><small>/ {TARGET_CAL} kcal</small><progress value={totals.cal} max={TARGET_CAL}/></div>
      <div><b>{totals.protein}g</b><small>/ {TARGET_PROTEIN}g protein</small><progress value={totals.protein} max={TARGET_PROTEIN}/></div>
      <div><b>{lastWeight ? lastWeight+' lb' : '--'}</b><small>latest bodyweight</small></div>
    </section>
    <section><h2>今日の食事 <span>Today's food</span></h2><div className="presets">{presets.map(p=><button key={p.name} onClick={()=>addPreset(p)}><strong>{p.name}</strong><em>{p.cal} kcal · {p.protein}g</em></button>)}</div>
      <div className="input"><input value={text} onChange={e=>setText(e.target.value)} placeholder="Steak bowl - 850 cal, 55g protein"/><button onClick={addCustom}>LOG</button></div>
      <div className="log">{meals.map(m=><article key={m.id}><div><strong>{m.name}</strong><small>{m.cal} kcal · {m.protein}g protein</small></div><button onClick={()=>setMeals(v=>v.filter(x=>x.id!==m.id))}>×</button></article>)}</div>
    </section>
    <section><h2>体重 <span>Weight log</span></h2><div className="input"><input inputMode="decimal" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="Today's weight (lb)"/><button onClick={addWeight}>ADD</button></div><div className="weights">{weights.slice(-7).map(w=><span key={w.id}>{w.date}<b>{w.value}</b></span>)}</div></section>
    <footer><b>もっと おおきく。もっと つよく。</b><span>BIGGER. STRONGER. EVERY DAY.</span></footer>
  </main>
}
