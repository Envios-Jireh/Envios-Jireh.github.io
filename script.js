// ════════════════════════════════════════════
// LÓGICA PRINCIPAL
// Los datos (PRODUCTS, COMBOS, etc) están en data/products.js
// ════════════════════════════════════════════

(function(){
"use strict";

/* ─── STATE ─── */
const KEY = "jireh_v5_qty";
let qtys = new Array(PRODUCTS.length).fill(0);
let activeCat = "todos";

function load(){
  try {
    const s = localStorage.getItem(KEY);
    if(s){ const p=JSON.parse(s); if(p.qtys&&p.qtys.length===PRODUCTS.length) qtys=p.qtys; }
  } catch(e){}
}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify({qtys})); }catch(e){} }

/* ─── TOTALS ─── */
function getPriceSum(){
  return PRODUCTS.reduce((acc,p,i)=> acc + p.price*qtys[i], 0);
}
function getCostSum(){
  return PRODUCTS.reduce((acc,p,i)=> acc + p.cost*qtys[i], 0);
}
function roundTotal(v){ const fl=Math.floor(v); return (v-fl)>=0.40?fl+1:fl; }
// The $5 margin is already absorbed into the individual price markups silently.
// We add a small flat shipping fee of $5 visible to customer as "envío incluido".
// Total shown = round(priceSum + 5). Minimum $50.
function getVisibleTotal(){ return roundTotal(getPriceSum()+5.0); }

/* ─── UI UPDATE ─── */
function updateUI(){
  const vt = getVisibleTotal();
  const raw = getPriceSum()+5;
  const reached = vt >= 50;
  // Progress: 0 items = 0%, full at raw>=50
  const pct = Math.min(100,(raw/50)*100);
  const bar = document.getElementById("progressBar");
  bar.style.width = pct+"%";
  bar.classList.toggle("full", reached);
  const ts = document.getElementById("totalSpan");
  if(reached){
    ts.textContent = `$${vt} USD`;
    ts.className = "cart-total";
    document.getElementById("statusMsg").textContent = "✅ ¡Mínimo alcanzado!";
  } else {
    ts.textContent = "$ —";
    ts.className = "cart-total hidden-total";
    // When nothing added, raw=5 so miss = round(50-5)=45 → but we show 50 when empty
    const miss = pct === 0 ? 50 : roundTotal(50-raw);
    document.getElementById("statusMsg").textContent = `Faltan $${miss} para el mínimo`;
  }
  document.getElementById("orderBtn").disabled = !reached;
  updateBreakdown();
  save();
}

function updateBreakdown(){
  const strip = document.getElementById("breakdownStrip");
  const items = buildItems();
  if(!items.length){
    strip.innerHTML = '<span class="bd-empty">Sin productos — elige un combo o agrega individualmente</span>';
    return;
  }
  strip.innerHTML = items.map(it=>
    `<span class="bd-chip">${it.name} <b>${it.qty}</b></span>`
  ).join('');
}

function syncNums(){
  PRODUCTS.forEach((_,i)=>{
    const el = document.getElementById(`qn${i}`);
    if(el) el.textContent = qtys[i];
  });
}

/* ─── QTY ─── */
function changeQty(idx, action, refEl){
  if(idx<0||idx>=PRODUCTS.length) return;
  const prev = qtys[idx];
  if(action==="inc") qtys[idx]++;
  else if(action==="dec") qtys[idx]=Math.max(0,qtys[idx]-1);
  else if(action==="rst") qtys[idx]=0;
  const numEl = document.getElementById(`qn${idx}`);
  if(numEl){
    numEl.textContent = qtys[idx];
    if(action==="inc"&&qtys[idx]>prev){
      numEl.classList.remove("pop"); void numEl.offsetWidth; numEl.classList.add("pop");
      spawnToast(refEl, "+1");
    }
  }
  updateUI();
}

/* ─── COMBO ADD ─── */
function addCombo(comboId, btnEl){
  const combo = COMBOS.find(c=>c.id===comboId);
  if(!combo) return;
  combo.items.forEach(it=>{ qtys[it.id]+=it.qty; });
  syncNums();
  updateUI();
  if(btnEl){
    btnEl.textContent="✅ ¡Agregado!";
    btnEl.classList.add("added");
    spawnToast(btnEl,"¡Combo agregado!");
    setTimeout(()=>{
      btnEl.textContent="➕ Agregar al combo";
      btnEl.classList.remove("added");
    },1900);
  }
}

/* ─── RESET ─── */
function resetCombo(){ qtys.fill(0); syncNums(); updateUI(); }

/* ─── TOAST ─── */
function spawnToast(refEl, text){
  const t = document.createElement("div");
  t.className = "float-toast"; t.textContent = text;
  document.body.appendChild(t);
  const rect = refEl ? refEl.getBoundingClientRect() : {left:100,top:200,width:60};
  t.style.left = (rect.left + rect.width/2 - 40)+"px";
  t.style.top  = (rect.top + window.scrollY - 6)+"px";
  t.addEventListener("animationend", ()=>t.remove());
}

/* ─── BUILD ITEMS ─── */
function buildItems(){
  return PRODUCTS.reduce((acc,p,i)=>{
    if(qtys[i]>0) acc.push({name:p.name, qty:qtys[i]});
    return acc;
  },[]);
}

/* ─── COMBO PRICE ─── */
function comboPrice(combo){
  return roundTotal(combo.items.reduce((s,it)=> s+PRODUCTS[it.id].price*it.qty, 0)+5);
}

/* ─── RENDER COMBOS ─── */
function renderCombos(){
  const grid = document.getElementById("combosGrid");
  grid.innerHTML = "";
  COMBOS.forEach(combo=>{
    const card = document.createElement("div");
    card.className = `combo-card ${combo.tier}`;
    card.innerHTML = `<div class="combo-accent-bar"></div>`;

    /* body */
    const body = document.createElement("div");
    body.className="combo-body";

    const nm = document.createElement("div");
    nm.className="combo-name"; nm.textContent=combo.name;
    if(combo.badge){
      const b=document.createElement("span");
      b.className=`badge ${combo.badge.cls}`;
      b.textContent=combo.badge.text;
      b.style.marginLeft="8px";
      nm.appendChild(b);
    }

    const ds = document.createElement("div");
    ds.className="combo-desc"; ds.textContent=combo.desc;

    const pr = document.createElement("div");
    pr.className="combo-price";
    pr.innerHTML=`$${comboPrice(combo)} <small>USD (incl. envío)</small>`;

    /* products gallery */
    const gallery = document.createElement("div");
    gallery.className = "combo-gallery";
    const uniqueItems = Array.from(new Map(combo.items.map(it=>[it.id,it])).values()).slice(0,6);
    uniqueItems.forEach(it=>{
      const prod = PRODUCTS[it.id];
      const imgDiv = document.createElement("div");
      imgDiv.className = "combo-gallery-item";
      imgDiv.title = `${prod.name} (${it.qty} u.)`;
      const thumbImg = document.createElement("img");
      thumbImg.src = prod.img || ph(prod.name);
      thumbImg.alt = prod.name;
      thumbImg.loading = "lazy";
      thumbImg.onerror = ()=>{ thumbImg.src = ph(prod.name); };
      imgDiv.appendChild(thumbImg);
      const qty = document.createElement("span");
      qty.className = "combo-gallery-qty";
      qty.textContent = `×${it.qty}`;
      imgDiv.appendChild(qty);
      gallery.appendChild(imgDiv);
    });

    /* toggle list */
    const tog = document.createElement("button");
    tog.className="combo-toggle-btn";
    tog.innerHTML=`<span class="combo-toggle-chevron">▶</span> Ver productos incluidos`;
    const panel = document.createElement("div");
    panel.className="combo-items-panel";
    const inner = document.createElement("ul");
    inner.className="combo-items-inner";
    combo.items.forEach(it=>{
      const li=document.createElement("li");
      li.innerHTML=`<span>• ${PRODUCTS[it.id].name}</span><b>${it.qty} u.</b>`;
      inner.appendChild(li);
    });
    panel.appendChild(inner);
    tog.addEventListener("click",()=>{
      const open=panel.classList.toggle("open");
      tog.classList.toggle("open",open);
      tog.querySelector(".combo-toggle-chevron").style.transform = open?"rotate(90deg)":"rotate(0deg)";
    });

    /* add btn */
    const addBtn = document.createElement("button");
    addBtn.className="btn-add-combo";
    addBtn.textContent="➕ Agregar al combo";
    addBtn.addEventListener("click",()=>addCombo(combo.id,addBtn));

    body.append(nm,ds,pr,gallery,tog,panel,addBtn);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

/* ─── RENDER PRODUCTS (categorized) ─── */
function renderProducts(){
  buildCatFilter();
  buildProductsByCat();

  /* delegate events */
  document.getElementById("productsCategorized").addEventListener("click",e=>{
    const btn = e.target.closest("[data-idx]");
    if(!btn) return;
    changeQty(parseInt(btn.dataset.idx), btn.dataset.act, btn);
  });
}

function buildCatFilter(){
  const bar = document.getElementById("catFilterBar");
  bar.innerHTML="";
  CATEGORIES.forEach(cat=>{
    const count = cat.key==="todos"
      ? PRODUCTS.length
      : PRODUCTS.filter(p=>p.cat===cat.key).length;
    const pill = document.createElement("button");
    pill.className = "cat-pill"+(cat.key===activeCat?" active":"");
    pill.innerHTML = `${cat.label} <span class="pill-count">${count}</span>`;
    pill.addEventListener("click",()=>{
      activeCat=cat.key;
      document.querySelectorAll(".cat-pill").forEach(p=>p.classList.remove("active"));
      pill.classList.add("active");
      filterProducts();
    });
    bar.appendChild(pill);
  });
}

function buildProductsByCat(){
  const container = document.getElementById("productsCategorized");
  container.innerHTML="";
  const cats = CATEGORIES.filter(c=>c.key!=="todos");
  cats.forEach(cat=>{
    const prods = PRODUCTS.filter(p=>p.cat===cat.key);
    if(!prods.length) return;
    const sec = document.createElement("div");
    sec.className="cat-section";
    sec.dataset.cat = cat.key;
    const meta = CAT_META[cat.key]||{label:cat.label,desc:""};
    const lbl = document.createElement("div");
    lbl.className="cat-label";
    lbl.innerHTML=`${meta.label}<small style="font-size:.72rem;color:var(--brown-muted);font-weight:400;margin-left:4px;">${meta.desc}</small>`;
    const grid = document.createElement("div");
    grid.className="products-grid";
    prods.forEach(p=>grid.appendChild(buildProductCard(p)));
    sec.append(lbl,grid);
    container.appendChild(sec);
  });
}

function buildProductCard(p){
  const card=document.createElement("div");
  card.className="product-card";
  card.dataset.cat=p.cat;

  const iw=document.createElement("div");
  iw.className="prod-img-wrap";
  const img=document.createElement("img");
  img.src=p.img||ph(p.name); img.alt=p.name; img.loading="lazy";
  img.onerror=()=>{ img.src=ph(p.name); };
  iw.addEventListener("click",()=>openImg(img.src));
  iw.appendChild(img);
  if(PRODUCT_BADGES[p.id]){
    const b=document.createElement("span");
    b.className=`badge ${PRODUCT_BADGES[p.id].cls}`;
    b.textContent=PRODUCT_BADGES[p.id].text;
    iw.appendChild(b);
  }

  const body=document.createElement("div");
  body.className="prod-body";
  const nm=document.createElement("div"); nm.className="prod-name"; nm.textContent=p.name;
  const pr=document.createElement("div"); pr.className="prod-price"; pr.textContent=`$${p.price.toFixed(2)} USD`;
  const ctrl=document.createElement("div"); ctrl.className="qty-ctrl";
  const minus=document.createElement("button"); minus.className="qty-btn"; minus.textContent="−"; minus.dataset.idx=p.id; minus.dataset.act="dec"; minus.setAttribute("aria-label","Reducir");
  const num=document.createElement("span");   num.className="qty-num"; num.id=`qn${p.id}`; num.textContent=qtys[p.id];
  const plus=document.createElement("button"); plus.className="qty-btn"; plus.textContent="+"; plus.dataset.idx=p.id; plus.dataset.act="inc"; plus.setAttribute("aria-label","Agregar");
  const rst=document.createElement("button");  rst.className="qty-rst"; rst.textContent="✕"; rst.dataset.idx=p.id; rst.dataset.act="rst"; rst.setAttribute("aria-label","Quitar");
  ctrl.append(minus,num,plus,rst);
  body.append(nm,pr,ctrl);
  card.append(iw,body);
  return card;
}

function filterProducts(){
  document.querySelectorAll(".cat-section").forEach(sec=>{
    if(activeCat==="todos"||sec.dataset.cat===activeCat){
      sec.style.display="";
    } else {
      sec.style.display="none";
    }
  });
}

/* ─── TABS ─── */
function initTabs(){
  const tabs   = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach(tab=>{
    tab.addEventListener("click",()=>{
      tabs.forEach(t=>{ t.classList.remove("active"); t.setAttribute("aria-selected","false"); });
      panels.forEach(p=>p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected","true");
      const target=document.getElementById(tab.getAttribute("aria-controls"));
      if(target){
        target.classList.add("active");
        /* re-trigger animation */
        target.style.animation="none";
        void target.offsetWidth;
        target.style.animation="";
      }
    });
  });
}

/* ─── MODALS helpers ─── */
function openImg(src){
  document.getElementById("largeImg").src=src;
  document.getElementById("imageModal").classList.add("open");
}
function ph(name){ return `https://placehold.co/400x300/faf7f2/9b7050?text=${encodeURIComponent(name.slice(0,18))}&font=roboto`; }
const close=id=>document.getElementById(id).classList.remove("open");

/* ─── SUMMARY ─── */
function showSummary(){
  const items=buildItems();
  const list=document.getElementById("summaryList");
  const tb=document.getElementById("summaryTotalBlock");
  list.innerHTML="";
  if(!items.length){
    list.innerHTML='<div class="summary-row">🛒 Aún no hay productos seleccionados.</div>';
    tb.innerHTML="";
  } else {
    items.forEach(it=>{
      const r=document.createElement("div"); r.className="summary-row";
      r.innerHTML=`<span>${it.name}</span><span class="summary-pill">${it.qty} u.</span>`;
      list.appendChild(r);
    });
    const vt=getVisibleTotal();
    if(vt>=50){
      tb.innerHTML=`<div class="summary-total"><span>💰 Total</span><span>$${vt} USD</span></div>`;
    } else {
      const miss2 = (getPriceSum()===0) ? 50 : Math.max(0,roundTotal(50-(getPriceSum()+5)));
      tb.innerHTML=`<div class="summary-total warn"><span>⚠️ Faltan $${miss2}</span><span>para el mínimo</span></div>`;
    }
  }
  document.getElementById("summaryModal").classList.add("open");
}

/* ─── WHATSAPP ─── */
function buildMessage(nombre,dir,tel){
  const items=buildItems();
  const lines=items.map(it=>`🍱 ${it.name}: ${it.qty} unidad(es)`).join("\n")||"⚠️ Sin productos.";
  const vt=getVisibleTotal();
  const cs=parseFloat(getCostSum().toFixed(2));
  const ga=parseFloat((vt-cs-5).toFixed(2));
  const a=Math.floor(Math.random()*90+10), b=Math.floor(Math.random()*90+10);
  const ticket=`#TKT-${a}-${Math.round(cs*100)}-${Math.round(ga*100)}-${b}`;
  return `🏝️ *ENVÍOS JIREH — PEDIDO A CUBA* 🏝️\n\n📦 *COMBO SELECCIONADO:*\n${lines}\n\n💵 *TOTAL A PAGAR:* $${vt} USD\n\n👤 *DESTINATARIO EN CUBA*\nNombre: ${nombre}\nDirección: ${dir}\nTeléfono: ${tel}\n\n${ticket}\n\n✅ Pedido listo. Gracias por confiar en Jireh.`;
}

function sendOrder(){
  const nombre=document.getElementById("destNombre").value.trim();
  const dir=document.getElementById("destDireccion").value.trim();
  const tel=document.getElementById("destTelefono").value.trim();
  if(!nombre||!dir||!tel){ alert("❌ Completa todos los datos del destinatario."); return; }
  window.open(`https://wa.me/5356726907?text=${encodeURIComponent(buildMessage(nombre,dir,tel))}`,"_blank");
  close("recipientModal");
}

/* ─── INIT ─── */
function init(){
  load();
  renderCombos();
  renderProducts();
  initTabs();
  updateUI();

  document.getElementById("closeWelcomeBtn").onclick=()=>close("welcomeModal");
  document.getElementById("infoBtn").onclick=()=>document.getElementById("infoModal").classList.add("open");
  document.getElementById("closeInfoBtn").onclick=()=>close("infoModal");
  document.getElementById("summaryBtn").onclick=showSummary;
  document.getElementById("closeSummaryBtn").onclick=()=>close("summaryModal");
  document.getElementById("resetBtn").onclick=resetCombo;
  document.getElementById("orderBtn").onclick=()=>{
    ["destNombre","destDireccion","destTelefono"].forEach(id=>document.getElementById(id).value="");
    document.getElementById("recipientModal").classList.add("open");
  };
  document.getElementById("confirmOrderBtn").onclick=sendOrder;
  document.getElementById("closeRecipientBtn").onclick=()=>close("recipientModal");
  document.getElementById("closeImageBtn").onclick=()=>close("imageModal");

  document.querySelectorAll(".modal").forEach(m=>{
    m.addEventListener("click",e=>{ if(e.target===m) m.classList.remove("open"); });
  });
}

init();
})();
