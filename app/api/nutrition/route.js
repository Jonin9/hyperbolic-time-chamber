import { NextResponse } from 'next/server';

const USDA_API='https://api.nal.usda.gov/fdc/v1/foods/search';

const item=(name,brand,cal,protein,carbs,fat,source,sourceUrl,confidence='High',extra={})=>({name,brand,cal,protein,carbs,fat,source,sourceUrl,confidence,...extra});

const MCD={
  mcgriddle:item('Sausage, Egg & Cheese McGriddles',"McDonald's",550,20,47,28,"McDonald's official nutrition",'https://www.mcdonalds.com/us/en-us/product/sausage-egg-cheese-mcgriddles.html'),
  refresher:item('Medium Strawberry Watermelon Refresher',"McDonald's",210,0,49,0,"McDonald's official nutrition",'https://www.mcdonalds.com/us/en-us/product/strawberry-watermelon-refresher-medium.html'),
};

const WINGSTOP_SOURCE='Wingstop official nutrition guide';
const WINGSTOP_URL='https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf';
const WS_SANDWICHES={
  plain:item('Chicken Sandwich - Plain','Wingstop',610,32,66,24,WINGSTOP_SOURCE,WINGSTOP_URL),
  atomic:item('Chicken Sandwich - Atomic','Wingstop',650,33,74,24,WINGSTOP_SOURCE,WINGSTOP_URL),
  cajun:item('Chicken Sandwich - Cajun','Wingstop',640,33,70,25,WINGSTOP_SOURCE,WINGSTOP_URL),
  'garlic parmesan':item('Chicken Sandwich - Garlic Parmesan','Wingstop',890,34,71,52,WINGSTOP_SOURCE,WINGSTOP_URL),
  hawaiian:item('Chicken Sandwich - Hawaiian','Wingstop',710,33,90,24,WINGSTOP_SOURCE,WINGSTOP_URL),
  'hickory smoked bbq':item('Chicken Sandwich - Hickory Smoked BBQ','Wingstop',730,34,96,24,WINGSTOP_SOURCE,WINGSTOP_URL),
  'lemon pepper':item('Chicken Sandwich - Lemon Pepper','Wingstop',850,32,67,50,WINGSTOP_SOURCE,WINGSTOP_URL),
  'louisiana rub':item('Chicken Sandwich - Louisiana Rub','Wingstop',790,32,67,43,WINGSTOP_SOURCE,WINGSTOP_URL),
  'mango habanero':item('Chicken Sandwich - Mango Habanero','Wingstop',740,32,94,24,WINGSTOP_SOURCE,WINGSTOP_URL),
  mild:item('Chicken Sandwich - Mild','Wingstop',870,32,67,52,WINGSTOP_SOURCE,WINGSTOP_URL),
  'original hot':item('Chicken Sandwich - Original Hot','Wingstop',630,32,68,25,WINGSTOP_SOURCE,WINGSTOP_URL),
  'spicy korean q':item('Chicken Sandwich - Spicy Korean Q','Wingstop',720,34,90,24,WINGSTOP_SOURCE,WINGSTOP_URL),
};
const WS_FRIES=item('Seasoned Fries - Regular','Wingstop',500,8,69,21,WINGSTOP_SOURCE,WINGSTOP_URL);
const WS_RANCH=item('Ranch Dip','Wingstop',320,1,2,34,WINGSTOP_SOURCE,WINGSTOP_URL);

function nutrient(food,names){for(const n of food.foodNutrients||[]){const name=String(n.nutrientName||'').toLowerCase();if(names.some(x=>name.includes(x)))return Number(n.value||0)}return 0}

async function usda(query){
  const url=`${USDA_API}?api_key=${process.env.USDA_API_KEY||'DEMO_KEY'}&query=${encodeURIComponent(query)}&pageSize=5`;
  const res=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
  if(!res.ok)return null;
  const data=await res.json(); const food=data.foods?.[0]; if(!food)return null;
  return item(food.description,food.brandOwner||food.brandName||'USDA',Math.round(nutrient(food,['energy'])),Math.round(nutrient(food,['protein'])),Math.round(nutrient(food,['carbohydrate'])),Math.round(nutrient(food,['total lipid','total fat'])),'USDA FoodData Central',`https://fdc.nal.usda.gov/fdc-app.html#/food-details/${food.fdcId}/nutrients`,'Medium',{fdcId:food.fdcId});
}

function cleanText(q){return q.toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim()}
function has(q,...terms){return terms.some(t=>q.includes(t))}
function wingstopFlavor(q){
  const aliases=[
    ['garlic parmesan',['garlic parmesan','garlic parm']],['hickory smoked bbq',['hickory smoked bbq','hickory bbq','bbq']],['lemon pepper',['lemon pepper']],['louisiana rub',['louisiana rub']],['mango habanero',['mango habanero']],['original hot',['original hot']],['spicy korean q',['spicy korean q','korean q']],['atomic',['atomic']],['cajun',['cajun']],['hawaiian',['hawaiian']],['mild',['mild']],['plain',['plain','no sauce','unseasoned']]
  ];
  for(const [key,words] of aliases) if(words.some(w=>q.includes(w))) return key;
  return null;
}

function parseKnown(q){
  const low=cleanText(q); const items=[]; const notes=[]; const clarifications=[];

  if(/sausage.*egg.*cheese.*mcgriddle|sausage egg and cheese mcgriddle|mcgriddle/.test(low))items.push(MCD.mcgriddle);
  if(/strawberry.*watermelon.*refresher/.test(low))items.push(MCD.refresher);

  if(low.includes('wingstop')){
    const sandwichMention=has(low,'chicken sandwich','sandwich');
    if(sandwichMention){
      const flavor=wingstopFlavor(low);
      if(flavor) items.push(WS_SANDWICHES[flavor]);
      else {
        items.push({...WS_SANDWICHES.plain,confidence:'Medium',assumption:'No Wingstop flavor was specified, so this was logged as Plain.'});
        notes.push('Wingstop sandwich flavor changes calories a lot. Logged Plain because no flavor was specified; edit/re-log with the flavor if needed.');
      }
    }
    if(has(low,'fries','seasoned fries','lemon pepper fries')) items.push(WS_FRIES);
    if(has(low,'ranch','ranch dip')) items.push(WS_RANCH);
    if(low.includes('combo') && !has(low,'fries','seasoned fries')){
      items.push(WS_FRIES);
      notes.push('Wingstop sandwich combo detected: regular seasoned fries added. Drink was not added because size/type was not specified.');
    }
  }

  return {items,notes,clarifications};
}

export async function POST(req){
  try{
    const {query}=await req.json(); const q=String(query||'').trim();
    if(!q)return NextResponse.json({error:'Missing meal description'},{status:400});

    const known=parseKnown(q);
    if(known.items.length){
      return NextResponse.json({items:known.items,notes:known.notes,clarifications:known.clarifications,parsedFrom:q,sourceStrategy:'Official restaurant nutrition first'});
    }

    const cleaned=q
      .replace(/^(i\s+(had|ate|got)|i just (had|ate|got)|for breakfast i had|for lunch i had|for dinner i had)\s+/i,'')
      .replace(/\s+(after|before)\s+(the\s+)?gym.*$/i,'')
      .replace(/\s+(for breakfast|for lunch|for dinner).*$/i,'')
      .trim();

    const food=await usda(cleaned);
    if(food)return NextResponse.json({items:[food],notes:['No verified restaurant-specific match was found, so USDA FoodData Central was used.'],parsedFrom:q,sourceStrategy:'USDA FoodData Central fallback'});

    return NextResponse.json({error:'I could not verify this meal yet. Include the restaurant/brand, exact item, size, and flavor when relevant.'},{status:404});
  }catch(e){
    return NextResponse.json({error:'Nutrition research failed. Please try again.'},{status:500});
  }
}
