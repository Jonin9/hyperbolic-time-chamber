import { NextResponse } from 'next/server';

const API = 'https://api.nal.usda.gov/fdc/v1/foods/search';

function nutrient(food, names){
  const list = food.foodNutrients || [];
  for (const n of list) {
    const name = String(n.nutrientName || '').toLowerCase();
    if (names.some(x => name.includes(x))) return Number(n.value || 0);
  }
  return 0;
}

export async function POST(req){
  try {
    const { query } = await req.json();
    if (!query || !String(query).trim()) return NextResponse.json({ error:'Missing query' },{status:400});
    const url = `${API}?api_key=${process.env.USDA_API_KEY || 'DEMO_KEY'}&query=${encodeURIComponent(query)}&pageSize=5`;
    const res = await fetch(url,{headers:{'Accept':'application/json'},cache:'no-store'});
    if (!res.ok) return NextResponse.json({ error:'USDA lookup failed' },{status:502});
    const data = await res.json();
    const food = data.foods?.[0];
    if (!food) return NextResponse.json({ error:'No nutrition match found' },{status:404});
    const calories = nutrient(food,['energy']);
    const protein = nutrient(food,['protein']);
    const carbs = nutrient(food,['carbohydrate']);
    const fat = nutrient(food,['total lipid','total fat']);
    return NextResponse.json({
      name: food.description,
      brand: food.brandOwner || food.brandName || 'USDA',
      cal: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      source: 'USDA FoodData Central',
      confidence: 'Medium',
      fdcId: food.fdcId
    });
  } catch (e) {
    return NextResponse.json({ error:'Nutrition lookup error' },{status:500});
  }
}
