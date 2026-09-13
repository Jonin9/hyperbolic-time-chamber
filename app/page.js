'use client';

import { useEffect, useMemo, useState } from 'react';

const START_DATE = new Date('2026-09-07T00:00:00');
const JAPAN_DATE = new Date('2026-12-30T00:00:00');

const FOOD_LIBRARY = [
  {id:'mcd-meal',brand:'McDonald\'s',name:'McDouble + 4pc nuggets + small fries',aliases:['mcdonalds $6 deal','mcdouble plain cheese only 4 nuggets small fries','mc double nuggets fries'],cal:800,protein:35,carbs:86,fat:36,source:'McDonald\'s nutrition / saved meal',confidence:'Medium',kind:'restaurant'},
  {id:'cfa-sandwich',brand:'Chick-fil-A',name:'Chicken sandwich',aliases:['chick fil a sandwich','chick-fil-a chicken sandwich','cfa sandwich'],cal:420,protein:29,carbs:41,fat:18,source:'Chick-fil-A nutrition',confidence:'High',kind:'restaurant'},
  {id:'cfa-fries',brand:'Chick-fil-A',name:'Medium waffle fries',aliases:['chick fil a fries','cfa fries','medium waffle fries'],cal:420,protein:5,carbs:45,fat:24,source:'Chick-fil-A nutrition',confidence:'High',kind:'restaurant'},
  {id:'cfa-shake',brand:'Chick-fil-A',name:'Cookies & cream milkshake',aliases:['cookies and cream milkshake','cookies & cream milkshake','chick fil a milkshake'],cal:630,protein:13,carbs:90,fat:25,source:'Chick-fil-A nutrition / saved default',confidence:'Medium',kind:'restaurant'},
  {id:'cfa-yogurt',brand:'Chick-fil-A',name:'Greek yogurt parfait',aliases:['greek yogurt parfait','chick fil a yogurt'],cal:270,protein:13,carbs:36,fat:9,source:'Chick-fil-A nutrition',confidence:'High',kind:'restaurant'},
  {id:'wing-sandwich',brand:'Wingstop',name:'Chicken sandwich',aliases:['wingstop chicken sandwich','wingstop sandwich'],cal:690,protein:32,carbs:69,fat:31,source:'Wingstop nutrition / saved item',confidence:'Medium',kind:'restaurant'},
  {id:'wing-fries',brand:'Wingstop',name:'Seasoned fries',aliases:['wingstop fries','lemon pepper fries'],cal:500,protein:7,carbs:68,fat:22,source:'Wingstop nutrition / saved item',confidence:'Medium',kind:'restaurant'},
  {id:'wing-tenders',brand:'Wingstop',name:'3-piece tenders',aliases:['3 piece tenders','wingstop tenders'],cal:420,protein:34,carbs:24,fat:20,source:'Wingstop nutrition / saved item',confidence:'Medium',kind:'restaurant'},
  {id:'dominos-pan',brand:'Domino\'s',name:'Handmade pan pepperoni - 4 slices',aliases:['half a dominos pan pepperoni pizza','half domino\'s pan pepperoni pizza','dominos pan pepperoni'],cal:1160,protein:48,carbs:116,fat:56,source:'Domino\'s nutrition / saved portion',confidence:'Medium',kind:'restaurant'},
  {id:'braums-burger',brand:'Braum\'s',name:'Plain cheeseburger',aliases:['braums burger','braum\'s burger','plain burger'],cal:600,protein:32,carbs:44,fat:33,source:'Braum\'s nutrition / saved order',confidence:'Medium',kind:'restaurant'},
  {id:'eggs-toast',brand:'Home',name:'4 eggs + 2 toast',aliases:['4 eggs and two pieces of toast','4 eggs 2 toast','eggs and toast'],cal:500,protein:30,carbs:30,fat:28,source:'USDA-style estimate',confidence:'Medium',kind:'home'},
  {id:'steak-rice',brand:'Home',name:'6 oz steak + 1.5 cups rice',aliases:['steak and rice','steak + rice'],cal:670,protein:52,carbs:68,fat:20,source:'USDA-style estimate',confidence:'Medium',kind:'home'},
  {id:'chicken-rice',brand:'Home',name:'Chicken breast + rice',aliases:['chicken and rice','chicken breast rice'],cal:620,protein:58,carbs:70,fat:10,source:'USDA-style estimate',confidence:'Medium',kind:'home'},
  {id:'alfredo',brand:'H-E-B',name:'Chicken Alfredo',aliases:['heb chicken alfredo','h-e-b chicken alfredo','chicken alfredo'],cal:700,protein:30,carbs:74,fat:31,source:'Saved package estimate',confidence:'Medium',kind:'grocery'},
  {id:'yogurt',brand:'Home',name:'Greek yogurt + granola',aliases:['greek yogurt and granola','greek yogurt + granola'],cal:400,protein:25,carbs:48,fat:12,source:'USDA-style estimate',confidence:'Medium',kind:'home'},
  {id:'shake',brand:'Home',name:'Mass shake',aliases:['mass shake','protein shake','pb shake'],cal:750,protein:45,carbs:80,fat:28,source:'Saved recipe',confidence:'High',kind:'home'},
  {id:'ramen',brand:'Home',name:'Ramen + 2 eggs + chicken',aliases:['ramen with eggs and chicken','ramen'],cal:650,protein:38,carbs:72,fat:22,source:'Saved recipe estimate',confidence:'Medium',kind:'home'},
  {id:'donburi',brand:'Home',name:'Steak donburi',aliases:['steak donburi','donburi'],cal:850,protein:48,carbs:95,fat:28,source:'Saved recipe estimate',confidence:'Medium',kind:'home'},
];

const WORKOUTS = [
  {day:'PUSH',items:[['Incline DB Press','3 x 6-10'],['Flat / Machine Press','3 x 6-10'],['Cable Fly','2 x 10-15'],['Shoulder Press','3 x 6-10'],['Lateral Raise','4 x 12-20'],['Triceps Pushdown','3 x 10-15'],['Overhead Extension','2 x 10-15']]},
  {day:'PULL',items:[['Pull-up / Lat Pulldown','3 x 6-10'],['Chest-Supported Row','3 x 8-12'],['Seated Cable Row','2 x 8-12'],['Rear-Delt Fly','3 x 12-20'],['Curl','3 x 8-12'],['Hammer Curl','2 x 10-15']]},
  {day:'LEGS',items:[['Hack Squat / Squat','3 x 6-10'],['Romanian Deadlift','3 x 6-10'],['Leg Press','3 x 10-15'],['Leg Curl','3 x 10-15'],['Leg Extension','2 x 12-15'],['Calf Raise','4 x 10-15']]},
  {day:'UPPER',items:[['Incline DB Press','3 x 8-12'],['Lat Pulldown','3 x 8-12'],['Machine Press','2 x 8-12'],['Row','3 x 8-12'],['Lateral Raise','3 x 12-20'],['Biceps','2 x 10-15'],['Triceps','2 x 10-15']]},
  {day:'ARMS + DELTS',items:[['Lateral Raise','4 x 12-20'],['Rear Delt','3 x 12-20'],['Biceps Curl','3 x 8-12'],['Hammer Curl','2 x 10-15'],['Pushdown','3 x 8-12'],['Overhead Extension','2 x 10-15']]},
];

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const sum=(arr,key)=>arr.reduce((a,x)=>a+(Number(x[key])||0),0);
const dayKey=()=>new Date().toISOString().slice(0,10);
const daysBetween=(a,b)=>Math.max(0,Math.ceil((b-a)/86400000));

function Gauge({label,value,target,unit=''}){
  const pct=clamp((value/target)*100,0,100);
  return <div className="gauge"><div className="gaugeTop"><span>{label}</span><b>{Math.round(value)}<small> / {target}{unit}</small></b></div><div className="bar"><i style={{width:pct+'%'}}/></div></div>
}

export default function Home(){
  const [tab,setTab]=useState('chamber');
  const [meals,setMeals]=useState([]);
  const [weights,setWeights]=useState([]);
  const [sets,setSets]=useState([]);
  const [favorites,setFavorites]=useState(['mcd-meal','shake']);
  const [targets,setTargets]=useState({cal:3000,protein:150,carbs:375,fat:100});
  const [mealText,setMealText]=useState('');
  const [weightInput,setWeightInput]=useState('');
  const [exercise,setExercise]=useState('Machine Shoulder Press');
  const [setInput,setSetInput]=useState('50 lb - 12 / 8 / 7');
  const [message,setMessage]=useState('');
  const [hydrated,setHydrated]=useState(false);

  useEffect(()=>{
    const get=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)) ?? f}catch{return f}};
    setMeals(get('htc-meals',[])); setWeights(get('htc-weights',[])); setSets(get('htc-sets',[])); setFavorites(get('htc-favorites',['mcd-meal','shake'])); setTargets(get('htc-targets',{cal:3000,protein:150,carbs:375,fat:100})); setHydrated(true);
  },[]);
  useEffect(()=>{if(!hydrated)return; localStorage.setItem('htc-meals',JSON.stringify(meals));localStorage.setItem('htc-weights',JSON.stringify(weights));localStorage.setItem('htc-sets',JSON.stringify(sets));localStorage.setItem('htc-favorites',JSON.stringify(favorites));localStorage.setItem('htc-targets',JSON.stringify(targets));},[meals,weights,sets,favorites,targets,hydrated]);

  const todayMeals=useMemo(()=>meals.filter(m=>m.day===dayKey()),[meals]);
  const totals=useMemo(()=>({cal:sum(todayMeals,'cal'),protein:sum(todayMeals,'protein'),carbs:sum(todayMeals,'carbs'),fat:sum(todayMeals,'fat')}),[todayMeals]);
  const remaining={cal:Math.max(0,targets.cal-totals.cal),protein:Math.max(0,targets.protein-totals.protein),carbs:Math.max(0,targets.carbs-totals.carbs),fat:Math.max(0,targets.fat-totals.fat)};
  const latestWeight=weights.at(-1)?.value;
  const firstWeight=weights[0]?.value;
  const gained=latestWeight&&firstWeight ? latestWeight-firstWeight : 0;
  const countdown=daysBetween(new Date(),JAPAN_DATE);
  const elapsed=Math.max(1,daysBetween(START_DATE,new Date())+1);
  const totalDays=daysBetween(START_DATE,JAPAN_DATE)+1;

  const last7=weights.slice(-7);
  const avg7=last7.length ? sum(last7,'value')/last7.length : null;
  const prev7=weights.slice(-14,-7);
  const prevAvg=prev7.length ? sum(prev7,'value')/prev7.length : null;
  const weeklyGain=avg7&&prevAvg ? avg7-prevAvg : null;

  const recommendation=useMemo(()=>{
    const highFat=totals.fat >= targets.fat*.85;
    const proteinShort=remaining.protein>30;
    const caloriesShort=remaining.cal>700;
    if(highFat && proteinShort) return {title:'LEAN PROTEIN + CARBS',foods:['Chicken breast + rice','Greek yogurt parfait','Whole milk if calories still short'],cal:900,protein:75,note:'Fat is already high. Finish the day with protein and carbs instead of another greasy meal.'};
    if(proteinShort) return {title:'PROTEIN CATCH-UP',foods:['6 oz steak + rice','Greek yogurt + granola'],cal:950,protein:77,note:'Protein is the limiting target. Close that gap first.'};
    if(caloriesShort) return {title:'CALORIE CLOSEOUT',foods:['Mass shake','Domino\'s pan pepperoni or McDonald\'s saved meal'],cal:900,protein:40,note:'Protein is in a decent spot. Get the remaining energy in efficiently.'};
    if(remaining.cal>0) return {title:'FINAL TOP-OFF',foods:['Whole milk','Greek yogurt','PB toast'],cal:remaining.cal,protein:Math.min(remaining.protein,25),note:'You are close. Use a small easy food instead of forcing a full meal.'};
    return {title:'GOAL COMPLETED',foods:['Stop chasing calories for today','Hydrate and recover'],cal:0,protein:0,note:'Daily target reached. Recovery is the next move.'};
  },[totals,remaining,targets]);

  const projected=useMemo(()=>{
    if(!latestWeight) return null;
    const rate=weeklyGain ?? .75;
    return latestWeight + rate*(countdown/7);
  },[latestWeight,weeklyGain,countdown]);

  function addMeal(food,qty=1,raw=''){
    const entry={...food,id:Date.now()+Math.random(),day:dayKey(),loggedAt:new Date().toISOString(),raw,cal:Math.round(food.cal*qty),protein:Math.round(food.protein*qty),carbs:Math.round(food.carbs*qty),fat:Math.round(food.fat*qty)};
    setMeals(v=>[...v,entry]);
    setMessage(`Logged ${entry.name}: ${entry.cal} kcal / ${entry.protein}g protein`);
  }

  function parseMeal(){
    const q=mealText.trim().toLowerCase(); if(!q)return;
    if(q.includes('same') && q.includes('yesterday')){
      const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
      const previous=meals.filter(m=>m.day===yesterday);
      if(previous.length){setMeals(v=>[...v,...previous.map(m=>({...m,id:Date.now()+Math.random(),day:dayKey(),loggedAt:new Date().toISOString(),raw:'same as yesterday'}))]);setMealText('');setMessage(`Copied ${previous.length} meal item${previous.length>1?'s':''} from yesterday.`);return;}
    }
    const found=FOOD_LIBRARY.filter(f=>[f.name,...f.aliases].some(a=>q.includes(a.toLowerCase())));
    if(found.length){found.forEach(f=>addMeal(f,1,mealText));setMealText('');return;}
    const manual=q.match(/(.+?)[,\-]\s*(\d+)\s*(?:cal|kcal).*?(\d+)\s*g(?:\s*protein)?/i);
    if(manual){addMeal({id:'manual',brand:'Custom',name:manual[1].trim(),cal:+manual[2],protein:+manual[3],carbs:0,fat:0,source:'User-entered macros',confidence:'High',kind:'custom'},1,mealText);setMealText('');return;}
    setMessage('I could not confidently match that meal yet. Pick a library item or enter it like “steak bowl - 850 cal, 55g protein.”');
  }

  function addWeight(){const v=parseFloat(weightInput);if(!v)return;setWeights(x=>[...x,{id:Date.now(),value:v,date:new Date().toLocaleDateString(),day:dayKey()}]);setWeightInput('');}
  function adjustTarget(){if(weeklyGain!==null && weeklyGain<.5 && targets.cal<3400)setTargets(t=>({...t,cal:t.cal===3000?3200:3400,carbs:t.cal===3000?400:425}));}
  function logSet(){const m=setInput.match(/([\d.]+)\s*lb.*?([\d\s/]+)/i);if(!m)return;const reps=m[2].split('/').map(x=>parseInt(x.trim())).filter(Boolean);setSets(v=>[...v,{id:Date.now(),exercise,weight:+m[1],reps,date:new Date().toLocaleDateString(),day:dayKey()}]);}

  const exerciseHistory=sets.filter(s=>s.exercise===exercise);
  const lastSet=exerciseHistory.at(-1);
  const nextTarget=lastSet?lastSet.reps.map((r,i)=>i===0?r: r+1).join(' / '):'Log your first session';
  const readyToLevel=lastSet?.reps?.every(r=>r>=10);

  const weekMeals=meals.filter(m=>Date.now()-new Date(m.loggedAt||0).getTime()<=7*86400000);
  const mealDays=[...new Set(weekMeals.map(m=>m.day))].length||1;
  const avgCal=Math.round(sum(weekMeals,'cal')/mealDays);
  const avgProtein=Math.round(sum(weekMeals,'protein')/mealDays);
  const workoutDays=[...new Set(sets.filter(s=>Date.now()-new Date(s.day+'T00:00:00').getTime()<=7*86400000).map(s=>s.day))].length;

  return <div className="appShell">
    <aside className="sideRail">
      <div className="brandMark"><span>KZN</span><small>JAPAN BULK PROTOCOL</small></div>
      {['chamber','log','library','training','report','settings'].map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x==='chamber'?'CHAMBER':x.toUpperCase()}</button>)}
      <div className="railFooter"><b>{countdown}</b><span>DAYS TO JAPAN</span></div>
    </aside>

    <main className="workspace">
      <header className="topHud"><div><p>精神と時の部屋</p><h1>HYPERBOLIC TIME CHAMBER</h1><span>せいしんとときのへや · seishin to toki no heya</span></div><div className="countdown"><b>{countdown}</b><small>DAYS</small></div></header>

      {tab==='chamber' && <>
        <section className="heroGrid">
          <div className="panel mission"><span className="eyebrow">DAY {Math.min(elapsed,totalDays)} / {totalDays}</span><h2>BUILD THE BODY<br/><em>BEFORE JAPAN.</em></h2><p>Eat enough. Hit protein. Progress the lifts. Make the scale move.</p><div className="weightHero"><b>{latestWeight?latestWeight.toFixed(1):'--.-'}<small> lb</small></b><span>{gained>=0?'+':''}{gained.toFixed(1)} lb gained</span></div></div>
          <div className="panel projection"><span className="eyebrow">DEC 30 PROJECTION</span><b className="projected">{projected?projected.toFixed(1):'--.-'}<small> lb</small></b><p>Target: <strong>140+ lb</strong></p><div className="japanLine">🇯🇵 {countdown} DAYS REMAINING</div></div>
        </section>
        <section className="panel macroPanel"><div className="sectionTitle"><div><span className="eyebrow">TODAY'S FUEL</span><h3>DAILY TARGETS</h3></div><span className="targetBadge">{targets.cal} KCAL</span></div><div className="gauges"><Gauge label="CALORIES" value={totals.cal} target={targets.cal}/><Gauge label="PROTEIN" value={totals.protein} target={targets.protein} unit="g"/><Gauge label="CARBS" value={totals.carbs} target={targets.carbs} unit="g"/><Gauge label="FAT" value={totals.fat} target={targets.fat} unit="g"/></div></section>
        <section className="split">
          <div className="panel needPanel"><span className="eyebrow">YOU STILL NEED</span><div className="needNums"><b>{Math.round(remaining.cal)}<small> kcal</small></b><b>{Math.round(remaining.protein)}<small>g protein</small></b></div><p>{remaining.carbs}g carbs · {remaining.fat}g fat remaining</p></div>
          <div className="panel movePanel"><span className="eyebrow">BEST MOVE RIGHT NOW</span><h3>{recommendation.title}</h3>{recommendation.foods.map(x=><div className="moveFood" key={x}>→ {x}</div>)}<p>{recommendation.note}</p><div className="moveMacros">≈ {Math.round(recommendation.cal)} kcal / {Math.round(recommendation.protein)}g protein</div></div>
        </section>
        <section className="panel quickLog"><div className="sectionTitle"><div><span className="eyebrow">NATURAL LANGUAGE</span><h3>LOG A MEAL</h3></div></div><div className="commandBox"><textarea value={mealText} onChange={e=>setMealText(e.target.value)} placeholder="I had a Chick-fil-A chicken sandwich, medium fries, cookies & cream milkshake."/><button onClick={parseMeal}>RESEARCH + LOG</button></div>{message&&<div className="systemMsg">SYSTEM // {message}</div>}</section>
      </>}

      {tab==='log' && <section className="panel pagePanel"><span className="eyebrow">TODAY // {dayKey()}</span><h2>MEAL LOG</h2><div className="commandBox"><textarea value={mealText} onChange={e=>setMealText(e.target.value)} placeholder="Type naturally: half a Domino's pan pepperoni pizza"/><button onClick={parseMeal}>LOG MEAL</button></div><div className="mealList">{todayMeals.length===0?<p className="empty">No fuel logged yet.</p>:todayMeals.map(m=><article key={m.id}><div><b>{m.name}</b><span>{m.brand} · {m.source} · {m.confidence} confidence</span></div><div className="mealMacros"><strong>{m.cal}</strong><small>kcal</small><strong>{m.protein}g</strong><small>protein</small></div><button onClick={()=>setMeals(v=>v.filter(x=>x.id!==m.id))}>×</button></article>)}</div></section>}

      {tab==='library' && <section className="panel pagePanel"><span className="eyebrow">PERSONAL FOOD DATABASE</span><h2>FOOD LIBRARY</h2><p className="subcopy">Saved restaurant orders, home meals, source confidence and one-tap logging.</p><div className="foodGrid">{FOOD_LIBRARY.map(f=><article key={f.id} className="foodCard"><div><span>{f.brand}</span><h3>{f.name}</h3></div><div className="miniMacros"><b>{f.cal}<small> kcal</small></b><b>{f.protein}<small>g protein</small></b></div><p>{f.source}<br/>Confidence: {f.confidence}</p><div className="cardActions"><button onClick={()=>addMeal(f)}>LOG</button><button className={favorites.includes(f.id)?'starred':''} onClick={()=>setFavorites(v=>v.includes(f.id)?v.filter(x=>x!==f.id):[...v,f.id])}>★</button></div></article>)}</div></section>}

      {tab==='training' && <section className="pageStack"><div className="panel pagePanel"><span className="eyebrow">PROGRESSIVE OVERLOAD</span><h2>TRAINING LOG</h2><div className="trainingEntry"><input value={exercise} onChange={e=>setExercise(e.target.value)}/><input value={setInput} onChange={e=>setSetInput(e.target.value)} placeholder="50 lb - 12 / 8 / 7"/><button onClick={logSet}>LOG SETS</button></div>{lastSet&&<div className="nextMission"><span>LAST</span><b>{lastSet.weight} lb · {lastSet.reps.join(' / ')}</b><span>NEXT TARGET</span><b>{readyToLevel?`LEVEL UP → ${lastSet.weight+5} lb`:`BEAT → ${nextTarget}`}</b></div>}</div><div className="workoutGrid">{WORKOUTS.map(w=><div className="panel workout" key={w.day}><span className="eyebrow">{w.day}</span>{w.items.map(([a,b])=><div key={a}><strong>{a}</strong><small>{b}</small></div>)}</div>)}</div></section>}

      {tab==='report' && <section className="panel pagePanel"><span className="eyebrow">HYPERBOLIC TIME CHAMBER</span><h2>WEEKLY REPORT</h2><div className="reportHero"><div><small>WEIGHT TREND</small><b>{weeklyGain===null?'NEED 14 DAYS':`${weeklyGain>=0?'+':''}${weeklyGain.toFixed(2)} LB/WK`}</b></div><div><small>AVG CALORIES</small><b>{avgCal}</b></div><div><small>AVG PROTEIN</small><b>{avgProtein}g</b></div><div><small>WORKOUT DAYS</small><b>{workoutDays}</b></div></div><div className="directive"><span>NEXT WEEK'S ORDER</span><h3>{weeklyGain!==null&&weeklyGain<.5?`Increase calories. Current target ${targets.cal} → ${targets.cal===3000?3200:3400}.`:`Hold ${targets.cal} kcal and keep progressing lifts.`}</h3>{weeklyGain!==null&&weeklyGain<.5&&targets.cal<3400&&<button onClick={adjustTarget}>APPLY NEW TARGET</button>}</div><div className="weightHistory"><h3>BODYWEIGHT // 7-DAY WINDOW</h3>{last7.map(w=><div key={w.id}><span>{w.date}</span><b>{w.value.toFixed(1)} lb</b></div>)}</div></section>}

      {tab==='settings' && <section className="panel pagePanel"><span className="eyebrow">SYSTEM CONFIG</span><h2>TARGETS + BODYWEIGHT</h2><div className="targetInputs">{[['cal','Calories'],['protein','Protein g'],['carbs','Carbs g'],['fat','Fat g']].map(([k,l])=><label key={k}>{l}<input type="number" value={targets[k]} onChange={e=>setTargets(t=>({...t,[k]:+e.target.value}))}/></label>)}</div><div className="weightEntry"><input inputMode="decimal" value={weightInput} onChange={e=>setWeightInput(e.target.value)} placeholder="Today's bodyweight (lb)"/><button onClick={addWeight}>LOG WEIGHT</button></div><div className="settingsNote"><b>WEIGHT LEARNING</b><p>Once two full 7-day windows exist, the app compares averages. If gain is under 0.5 lb/week, it can move the calorie target from 3,000 → 3,200 → 3,400.</p></div></section>}

      <footer><b>かいぜん — KAIZEN</b><span>SMALL IMPROVEMENTS. EVERY DAY.</span></footer>
    </main>

    <nav className="mobileNav">{[['chamber','HOME'],['log','LOG'],['training','TRAIN'],['report','REPORT']].map(([k,l])=><button key={k} className={tab===k?'active':''} onClick={()=>setTab(k)}>{l}</button>)}</nav>
  </div>
}
