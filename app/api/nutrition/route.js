import { NextResponse } from 'next/server';

const API='https://api.nal.usda.gov/fdc/v1/foods/search';
const OFFICIAL={
  mcgriddle:{name:'Sausage, Egg & Cheese McGriddles',brand:"McDonald's",cal:550,protein:20,carbs:47,fat:28,source:"McDonald's official nutrition",sourceUrl:'https://www.mcdonalds.com/us/en-us/product/sausage-egg-cheese-mcgriddles.html',confidence:'High'},
  refresher:{name:'Medium Strawberry Watermelon Refresher',brand:"McDonald's",cal:210,protein:0,carbs:49,fat:0,source:"McDonald's official nutrition",sourceUrl:'https://www.mcdonalds.com/us/en-us/product/strawberry-watermelon-refresher-medium.html',confidence:'High'}
};
function nutrient(food,names){for(const n of food.foodNutrients||[]){const name=String(n.nutrientName||'').toLowerCase();if(names.some(x=>name.includes(x)))return Number(n.value||0)}return 0}
async function usda(query){
 const url=`${API}?api_key=${process.env.USDA_API_KEY||'DEMO_KEY'}&query=${encodeURIComponent(query)}&pageSize=5`;
 const res=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'}); if(!res.ok)return null;
 const data=await res.json(); const food=data.foods?.[0]; if(!food)return null;
 return {name:food.description,brand:food.brandOwner||food.brandName||'USDA',cal:Math.round(nutrient(food,['energy'])),protein:Math.round(nutrient(food,['protein'])),carbs:Math.round(nutrient(food,['carbohydrate'])),fat:Math.round(nutrient(food,['total lipid','total fat'])),source:'USDA FoodData Central',sourceUrl:`https://fdc.nal.usda.gov/fdc-app.html#/food-details/${food.fdcId}/nutrients`,confidence:'Medium',fdcId:food.fdcId};
}
export async function POST(req){
 try{
  const {query}=await req.json(); const q=String(query||'').trim(); if(!q)return NextResponse.json({error:'Missing meal description'},{status:400});
  const low=q.toLowerCase(); const items=[];
  if(/sausage.*egg.*cheese.*mcgriddle|sausage egg and cheese mcgriddle|mcgriddle/.test(low))items.push(OFFICIAL.mcgriddle);
  if(/strawberry.*watermelon.*refresher/.test(low))items.push(OFFICIAL.refresher);
  if(items.length)return NextResponse.json({items,parsedFrom:q,sourceStrategy:'Official restaurant nutrition first'});
  const cleaned=q.replace(/^(i\s+(had|ate|got)|for breakfast i had|for lunch i had|for dinner i had)\s+/i,'').replace(/\s+(after|before)\s+(the\s+)?gym.*$/i,'');
  const food=await usda(cleaned); if(food)return NextResponse.json({items:[food],parsedFrom:q,sourceStrategy:'USDA FoodData Central'});
  return NextResponse.json({error:'No reliable nutrition match found yet. Try naming the restaurant/brand and item size.'},{status:404});
 }catch(e){return NextResponse.json({error:'Nutrition research failed. Please try again.'},{status:500})}
}
