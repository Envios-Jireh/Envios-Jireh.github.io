// ════════════════════════════════════════════
// DATOS DE PRODUCTOS Y COMBOS
// Modifica aquí para cambiar productos, precios y combos
// ════════════════════════════════════════════

const PRODUCTS = [
  /* ALIMENTOS */
  { id:0,  cat:"alimentos", name:"Aceite 900ml",             cost:2.60,  price:3.38,   img:"Images/Aceite.png" },
  { id:1,  cat:"alimentos", name:"Arroz 1kg",                cost:1.30,  price:1.69,   img:"Images/Arroz.png" },
  { id:2,  cat:"alimentos", name:"Frijoles 1kg",             cost:1.40,  price:1.82,   img:"Images/Frijoles.png" },
  { id:3,  cat:"alimentos", name:"Spaghetti 500gr",          cost:0.676, price:0.879,  img:"Images/Spaguetis.png" },
  { id:4,  cat:"alimentos", name:"Pasta condimental 170gr",  cost:0.40,  price:0.52,   img:"Images/PastaC.png" },
  { id:5,  cat:"alimentos", name:"Pasta de tomate 400gr",    cost:0.72,  price:0.936,  img:"Images/Pastatomate.png" },
  { id:6,  cat:"alimentos", name:"Pastillas de pollo (12u)", cost:0.72,  price:0.936,  img:"Images/Pastillita.png" },
  { id:7,  cat:"alimentos", name:"Vinagre 500ml",            cost:0.52,  price:0.676,  img:"Images/Vinagre.png" },
  /* PROTEÍNAS */
  { id:8,  cat:"proteinas", name:"Pollo 10lb",               cost:9.40,  price:12.22,  img:"Images/Pollo.png" },
  { id:9,  cat:"proteinas", name:"Filin de huevo",           cost:6.00,  price:7.80,   img:"Images/Huevos.png" },
  { id:10, cat:"otros",     name:"Helado de Chocolate",      cost:7.70,  price:10.00,  img:"Images/Helado.jpg" },
  /* HIGIENE */
  { id:11, cat:"higiene",   name:"Detergente líquido",       cost:1.60,  price:2.08,   img:"Images/Detergente.png" },
  { id:12, cat:"higiene",   name:"Jabón de baño 100gr",      cost:0.40,  price:0.52,   img:"Images/Jabonl.png" },
  { id:13, cat:"higiene",   name:"Jabón de lavar 150gr",     cost:0.50,  price:0.65,   img:"Images/Jabon.png" },
  { id:14, cat:"higiene",   name:"Pasta dental",             cost:0.80,  price:1.04,   img:"Images/Pastadental.png" },
  { id:15, cat:"higiene",   name:"Bolso Vima",               cost:0.40,  price:0.52,   img:"Images/Bolso.png" },
  /* BEBIDAS */
  { id:16, cat:"bebidas",   name:"Refresco de lata",         cost:0.50,  price:0.65,   img:"Images/Refrescos.png" },
  { id:17, cat:"bebidas",   name:"Cerveza Cristal",          cost:0.63,  price:0.819,  img:"Images/Cristal.png" },
  { id:18, cat:"bebidas",   name:"Cerveza Luxus",            cost:0.63,  price:0.819,  img:"Images/Luxus.png" },
  /* OTROS */
  { id:19, cat:"otros",     name:"Café Serrano",             cost:3.45,  price:4.485,  img:"Images/Cafe.png" },
];

const CATEGORIES = [
  { key:"todos",    label:"✦ Todos",       emoji:"" },
  { key:"alimentos",label:"🌾 Alimentos",  emoji:"🌾" },
  { key:"proteinas",label:"🍗 Proteínas",  emoji:"🍗" },
  { key:"higiene",  label:"🧼 Higiene",    emoji:"🧼" },
  { key:"bebidas",  label:"🥤 Bebidas",    emoji:"🥤" },
  { key:"otros",    label:"☕ Otros",      emoji:"☕" },
];

const CAT_META = {
  alimentos: { label:"🌾 Alimentos básicos",  desc:"Granos, pastas, condimentos y aceites" },
  proteinas: { label:"🍗 Proteínas y frescos", desc:"Carnes, huevos y más" },
  higiene:   { label:"🧼 Higiene y aseo",      desc:"Limpieza personal y del hogar" },
  bebidas:   { label:"🥤 Bebidas",             desc:"Refrescos y cervezas" },
  otros:     { label:"☕ Otros",               desc:"Café, helados y artículos especiales" },
};

const PRODUCT_BADGES = {
  8:  { text:"🔥 Popular",    cls:"badge-popular" },
  9:  { text:"⭐ Destacado",  cls:"badge-recomendado" },
  0:  { text:"🫙 Esencial",   cls:"badge-nuevo" },
  19: { text:"☕ Favorito",   cls:"badge-nuevo" },
  10: { text:"🍦 Nuevo",      cls:"badge-premium" },
};

const COMBOS = [
  {
    id:"mini", name:"Combo Mini", tier:"tier-mini",
    badge:{ text:"✨ Nuevo", cls:"badge-nuevo" },
    desc:"Lo esencial para empezar. Alimentos básicos, higiene y proteína para la familia.",
    img:"Images/ComboMini.png",
    items:[
      {id:8,qty:1},{id:1,qty:3},{id:2,qty:3},{id:0,qty:2},
      {id:3,qty:3},{id:12,qty:3},{id:14,qty:2},{id:5,qty:2},
      {id:6,qty:2},{id:13,qty:2},{id:11,qty:1},{id:19,qty:1},
    ]
  },
  {
    id:"basico", name:"Paquete Básico Familiar", tier:"tier-basico",
    badge:{ text:"⭐ Recomendado", cls:"badge-recomendado" },
    desc:"El clásico de Jireh. Completo para una familia, con todo lo que más se necesita.",
    img:"Images/ComboBasico.png",
    items:[
      {id:11,qty:1},{id:12,qty:6},{id:13,qty:5},{id:14,qty:2},
      {id:0,qty:3},{id:3,qty:3},{id:4,qty:2},{id:5,qty:2},
      {id:6,qty:12},{id:7,qty:3},{id:2,qty:3},{id:1,qty:3},
      {id:16,qty:6},{id:8,qty:2},{id:10,qty:1},
    ]
  },
  {
    id:"pro", name:"Combo Pro", tier:"tier-pro",
    badge:{ text:"💎 Premium", cls:"badge-premium" },
    desc:"Para quienes quieren mandarlo todo. Abundante, variado y muy completo.",
    img:"Images/ComboPro.png",
    items:[
      {id:8,qty:2},{id:9,qty:1},{id:10,qty:1},{id:19,qty:2},
      {id:0,qty:4},{id:1,qty:5},{id:2,qty:4},{id:3,qty:4},
      {id:5,qty:3},{id:6,qty:3},{id:11,qty:2},{id:13,qty:4},
      {id:12,qty:6},{id:14,qty:3},{id:7,qty:2},{id:4,qty:3},
      {id:16,qty:6},{id:17,qty:6},
    ]
  }
];
