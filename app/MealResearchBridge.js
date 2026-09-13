'use client';

import { useEffect } from 'react';

const dayKey=()=>new Date().toISOString().slice(0,10);

export default function MealResearchBridge(){
  useEffect(()=>{
    async function handler(e){
      const btn=e.target.closest('button');
      if(!btn || !/research\s*\+\s*log/i.test(btn.textContent||'')) return;
      const area=document.querySelector('textarea');
      const query=area?.value?.trim();
      if(!query) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      const old=btn.textContent; btn.disabled=true; btn.textContent='RESEARCHING…';
      try{
        const res=await fetch('/api/nutrition',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query})});
        const data=await res.json();
        if(!res.ok) throw new Error(data.error||'Nutrition research failed');
        const items=Array.isArray(data.items)?data.items:[data];
        const current=JSON.parse(localStorage.getItem('htc-meals')||'[]');
        const now=Date.now();
        const entries=items.map((food,i)=>({...food,id:now+i+Math.random(),day:dayKey(),loggedAt:new Date().toISOString(),raw:query,kind:food.kind||'researched'}));
        localStorage.setItem('htc-meals',JSON.stringify([...current,...entries]));
        area.value='';
        window.location.reload();
      }catch(err){
        const box=btn.parentElement?.querySelector('.systemMessage');
        if(box) box.textContent='SYSTEM // '+err.message;
        else alert(err.message);
        btn.disabled=false; btn.textContent=old;
      }
    }
    document.addEventListener('click',handler,true);
    return()=>document.removeEventListener('click',handler,true);
  },[]);
  return null;
}
