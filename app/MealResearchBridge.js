'use client';

import { useEffect } from 'react';

const dayKey=()=>new Date().toISOString().slice(0,10);

export default function MealResearchBridge(){
  useEffect(()=>{
    async function handler(e){
      const btn=e.target.closest('button');
      if(!btn || !/^(research\s*\+\s*log|log meal)$/i.test((btn.textContent||'').trim())) return;
      const box=btn.closest('.commandBox');
      const area=box?.querySelector('textarea') || document.querySelector('textarea');
      const query=area?.value?.trim();
      if(!query) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      const old=btn.textContent; btn.disabled=true; btn.textContent='UNDERSTANDING…';
      try{
        const res=await fetch('/api/nutrition',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query})});
        const data=await res.json();
        if(!res.ok) throw new Error(data.error||'Nutrition research failed');
        const items=Array.isArray(data.items)?data.items:[data];
        if(!items.length) throw new Error('No foods were identified in that sentence.');
        const current=JSON.parse(localStorage.getItem('htc-meals')||'[]');
        const now=Date.now();
        const entries=items.map((food,i)=>({
          ...food,
          id:now+i+Math.random(),
          day:dayKey(),
          loggedAt:new Date().toISOString(),
          raw:query,
          name:food.name||query,
          brand:food.brand||'Researched food',
          source:food.source||'Nutrition research',
          confidence:food.confidence||'Medium',
          cal:Number(food.cal)||0,
          protein:Number(food.protein)||0,
          carbs:Number(food.carbs)||0,
          fat:Number(food.fat)||0,
          kind:food.kind||'researched'
        }));
        localStorage.setItem('htc-meals',JSON.stringify([...current,...entries]));
        const cache=JSON.parse(localStorage.getItem('htc-researched-foods')||'[]');
        const merged=[...cache];
        entries.forEach(x=>{if(!merged.some(y=>y.name===x.name&&y.brand===x.brand))merged.push({...x,id:`cached-${x.brand}-${x.name}`})});
        localStorage.setItem('htc-researched-foods',JSON.stringify(merged.slice(-100)));
        area.value='';
        window.location.reload();
      }catch(err){
        alert(err.message);
        btn.disabled=false; btn.textContent=old;
      }
    }
    document.addEventListener('click',handler,true);
    return()=>document.removeEventListener('click',handler,true);
  },[]);
  return null;
}
