/* Click Amuebla — interacciones del sitio */
(() => {
  "use strict";
  const WA = "523332592231";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.PRODUCTS;
  const money = n => "$" + n.toLocaleString("es-MX");
  const thumb = p => `assets/img/m${String(p.n).padStart(2, "0")}-thumb.webp`;
  const full = p => `assets/img/m${String(p.n).padStart(2, "0")}-full.webp`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const waLink = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const byId = Object.fromEntries(P.map(p => [p.id, p]));

  /* WhatsApp: todos los enlaces con data-wa */
  $$("[data-wa]").forEach(a => (a.href = waLink(a.dataset.wa)));

  /* ---------- header, progreso, menú ---------- */
  const header = $("#header"), progress = $("#progress");
  const onScroll = () => {
    header.classList.toggle("is-solid", scrollY > 30);
    const h = document.documentElement;
    progress.style.transform = `scaleX(${scrollY / Math.max(1, h.scrollHeight - innerHeight)})`;
    parallax();
  };
  const burger = $("#burger"), nav = $("#nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  nav.addEventListener("click", e => { if (e.target.closest("a")) { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); } });

  /* resalta la sección activa en el menú */
  const links = $$(".nav a");
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach(a => { const s = $(a.getAttribute("href")); if (s) spy.observe(s); });
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.remove("is-active")); }), { rootMargin: "-45% 0px -50% 0px" }).observe($("#inicio"));

  /* parallax suave en la sección de fábrica */
  const par = $$("[data-par]");
  function parallax() {
    if (reduce) return;
    par.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const k = parseFloat(el.dataset.par);
      el.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * k}px)`;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- hero ---------- */
  const HERO = [14, 5, 34, 18, 1].map(n => P[n - 1]);
  const slidesEl = $("#heroSlides"), ticksEl = $("#heroTicks"), bgs = $$(".hero__bgimg");
  const tagName = $("#heroTagName"), tagPrice = $("#heroTagPrice");
  const DUR = 5600;
  HERO.forEach((p, i) => {
    const s = document.createElement("div");
    s.className = "slide";
    s.innerHTML = `<img src="${full(p)}" alt="${p.name}" ${i ? 'loading="lazy"' : ""}>`;
    slidesEl.appendChild(s);
    const t = document.createElement("button");
    t.className = "tick"; t.type = "button"; t.setAttribute("aria-label", `Ver ${p.name}`);
    t.addEventListener("click", () => go(i, true));
    ticksEl.appendChild(t);
  });
  let cur = -1, timer, bgi = 0;
  function go(i, manual) {
    if (i === cur) return;
    const slides = $$(".slide", slidesEl), ticks = $$(".tick", ticksEl);
    slides.forEach((s, k) => s.classList.toggle("is-on", k === i));
    ticks.forEach((t, k) => {
      t.classList.remove("is-on", "is-done");
      t.style.setProperty("--dur", DUR + "ms");
      if (k < i) t.classList.add("is-done");
    });
    void ticksEl.offsetWidth;
    ticks[i].classList.add("is-on");
    const p = HERO[i];
    tagName.textContent = p.name; tagPrice.textContent = money(p.price);
    bgi = 1 - bgi;
    bgs[bgi].style.backgroundImage = `url(${thumb(p)})`;
    bgs[bgi].classList.add("is-on"); bgs[1 - bgi].classList.remove("is-on");
    cur = i;
    clearTimeout(timer);
    if (!reduce) timer = setTimeout(() => go((i + 1) % HERO.length), DUR);
  }
  go(0);
  const stage = $("#heroFrame");
  stage.addEventListener("mouseenter", () => { clearTimeout(timer); $$(".tick.is-on", ticksEl).forEach(t => (t.style.animationPlayState = "paused")); });
  stage.addEventListener("mouseleave", () => { $$(".tick.is-on", ticksEl).forEach(t => (t.style.animationPlayState = "running")); clearTimeout(timer); timer = setTimeout(() => go((cur + 1) % HERO.length), 2200); });
  $("#heroCount").textContent = P.length;

  /* cinta de texto */
  const words = ["Salas", "Comedores", "Recámaras", "Sofás cama", "Fabricantes", "Entrega inmediata"];
  const item = words.map(w => `<span class="ticker__item">${w}<img src="assets/img/favicon.png" alt=""></span>`).join("");
  $("#ticker").innerHTML = item + item + item + item;

  /* ---------- catálogo ---------- */
  const CATS = [["todo", "Todo"], ["salas", "Salas"], ["sofas", "Sofás cama"], ["recamaras", "Recámaras"], ["comedores", "Comedores"]];
  const state = { cat: "todo", sub: "Todas", sort: "rel" };
  const pillsEl = $("#pills"), subEl = $("#subpills"), gridEl = $("#grid"), countEl = $("#count");
  CATS.forEach(([k, l]) => {
    const n = k === "todo" ? P.length : P.filter(p => p.cat === k).length;
    const b = document.createElement("button");
    b.className = "pill"; b.type = "button"; b.setAttribute("role", "tab"); b.dataset.k = k;
    b.innerHTML = `${l}<small>${n}</small>`;
    b.addEventListener("click", () => { state.cat = k; state.sub = "Todas"; render(); });
    pillsEl.appendChild(b);
  });
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; render(); });

  let list = [];
  function render() {
    $$(".pill", pillsEl).forEach(b => b.setAttribute("aria-selected", b.dataset.k === state.cat));
    /* subfiltros de salas */
    if (state.cat === "salas") {
      const types = ["Todas", ...new Set(P.filter(p => p.cat === "salas").map(p => p.tipo))];
      subEl.hidden = false;
      subEl.innerHTML = types.map(t => `<button class="chip" type="button" aria-pressed="${t === state.sub}" data-t="${t}">${t === "Esquinera" ? "Esquineras" : t === "Sillones" ? "Sillones" : t}</button>`).join("");
    } else subEl.hidden = true;
    list = P.filter(p => (state.cat === "todo" || p.cat === state.cat) && (state.cat !== "salas" || state.sub === "Todas" || p.tipo === state.sub));
    if (state.sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    countEl.textContent = `${list.length} ${list.length === 1 ? "modelo" : "modelos"} en existencia`;
    gridEl.innerHTML = list.map((p, i) => cardHTML(p, i)).join("");
  }
  subEl.addEventListener("click", e => { const c = e.target.closest(".chip"); if (c) { state.sub = c.dataset.t; render(); } });
  function cardHTML(p, i) {
    const inQ = quote.includes(p.id);
    return `<article class="card" style="--i:${Math.min(i, 12)}" data-id="${p.id}">
      <button class="card__media" type="button" data-open="${p.id}" aria-label="Ver detalle de ${p.name}">
        ${p.fit === "contain" ? `<span class="card__bg" style="background-image:url(${thumb(p)})"></span>` : ""}
        <img class="is-${p.fit}" src="${thumb(p)}" alt="${p.name}" loading="lazy" width="720" height="${Math.round(720 / p.ratio)}">
        <span class="card__flag">En existencia</span><span class="card__view">Ver detalle</span>
      </button>
      <div class="card__body">
        <p class="card__type">${p.tipo}</p>
        <h3 class="card__name">${p.name}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="card__foot">
          <p class="price">${money(p.price)}<small>MXN</small></p>
          <button class="add ${inQ ? "is-in" : ""}" type="button" data-add="${p.id}" aria-label="${inQ ? "Quitar de" : "Agregar a"} mi cotización: ${p.name}" aria-pressed="${inQ}">${inQ ? ICON_OK : ICON_PLUS}</button>
        </div>
      </div></article>`;
  }
  const ICON_PLUS = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const ICON_OK = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  gridEl.addEventListener("click", e => {
    const o = e.target.closest("[data-open]"), a = e.target.closest("[data-add]");
    if (a) toggleQuote(a.dataset.add);
    else if (o) openModal(o.dataset.open);
  });

  /* ---------- cotización ---------- */
  const KEY = "clickamuebla.cotizacion";
  let quote = [];
  try { quote = JSON.parse(localStorage.getItem(KEY) || "[]").filter(id => byId[id]); } catch (_) { quote = []; }
  const countBadge = $("#quoteCount");
  function saveQuote() { try { localStorage.setItem(KEY, JSON.stringify(quote)); } catch (_) {} }
  function toggleQuote(id) {
    const i = quote.indexOf(id);
    if (i >= 0) { quote.splice(i, 1); toast("Quitado de tu cotización"); }
    else { quote.push(id); toast(`Agregado: ${byId[id].name}`); }
    saveQuote(); syncQuote(true);
  }
  function syncQuote(bump) {
    countBadge.textContent = quote.length;
    if (bump) { countBadge.classList.add("bump"); setTimeout(() => countBadge.classList.remove("bump"), 300); }
    $$("[data-add]").forEach(b => {
      const on = quote.includes(b.dataset.add);
      b.classList.toggle("is-in", on); b.setAttribute("aria-pressed", on);
      b.innerHTML = on ? ICON_OK : ICON_PLUS;
    });
    const addBtn = $("#mAdd");
    if (addBtn && current) addBtn.textContent = quote.includes(current.id) ? "Quitar de mi cotización" : "Agregar a mi cotización";
    /* lista */
    const ql = $("#qList");
    ql.innerHTML = quote.map(id => { const p = byId[id]; return `<li class="qitem"><img src="${thumb(p)}" alt="" width="76" height="76"><div><h4>${p.name}</h4><p>${money(p.price)}</p></div><button type="button" data-rm="${id}" aria-label="Quitar ${p.name}">×</button></li>`; }).join("");
    $("#qEmpty").hidden = quote.length > 0; ql.hidden = !quote.length; $("#qFoot").hidden = !quote.length;
    const sum = quote.reduce((s, id) => s + byId[id].price, 0);
    $("#qSum").textContent = money(sum);
    const msg = "Hola, quiero cotizar estos muebles de su catálogo:\n" + quote.map(id => `• ${byId[id].name} (${byId[id].id}) — ${money(byId[id].price)}`).join("\n") + `\n\nSuma de referencia: ${money(sum)}\n¿Me confirman disponibilidad, medidas y fecha de entrega?`;
    $("#qSend").href = waLink(msg);
  }
  $("#qList").addEventListener("click", e => { const b = e.target.closest("[data-rm]"); if (b) toggleQuote(b.dataset.rm); });
  $("#qClear").addEventListener("click", () => { quote = []; saveQuote(); syncQuote(); toast("Cotización vacía"); });

  /* diálogos */
  const modal = $("#modal"), drawer = $("#drawer");
  function lock(on) { document.body.classList.toggle("is-locked", on); }
  [modal, drawer].forEach(d => {
    d.addEventListener("close", () => lock(false));
    d.addEventListener("click", e => { if (e.target === d) d.close(); });
  });
  $("#openQuote").addEventListener("click", () => { syncQuote(); drawer.showModal(); lock(true); });
  $("#dClose").addEventListener("click", () => drawer.close());
  $("#mClose").addEventListener("click", () => modal.close());

  let current = null;
  function openModal(id) {
    current = byId[id]; fillModal();
    if (!modal.open) { modal.showModal(); lock(true); }
  }
  function fillModal() {
    const p = current;
    const img = $("#mImg");
    img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
    img.src = full(p); img.alt = p.name;
    $("#mBg").style.backgroundImage = `url(${thumb(p)})`;
    $("#mType").textContent = p.tipo; $("#mName").textContent = p.name;
    $("#mPrice").textContent = money(p.price); $("#mDesc").textContent = p.desc; $("#mId").textContent = p.id;
    $("#mWa").href = waLink(`Hola, me interesa: ${p.name} (${p.id}) en ${money(p.price)}. ¿Me confirman disponibilidad, medidas y colores?`);
    $("#mAdd").textContent = quote.includes(p.id) ? "Quitar de mi cotización" : "Agregar a mi cotización";
  }
  function step(d) {
    const i = list.findIndex(p => p.id === current.id);
    current = list[(i + d + list.length) % list.length]; fillModal();
  }
  $("#mPrev").addEventListener("click", () => step(-1));
  $("#mNext").addEventListener("click", () => step(1));
  $("#mAdd").addEventListener("click", () => { toggleQuote(current.id); });
  modal.addEventListener("keydown", e => { if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); });

  let toastEl;
  function toast(t) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = t; toastEl.classList.add("is-on");
    clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove("is-on"), 1900);
    /* el toast debe verse sobre los diálogos abiertos */
    if (modal.open || drawer.open) (modal.open ? modal : drawer).appendChild(toastEl); else document.body.appendChild(toastEl);
  }

  render(); syncQuote();

  /* ---------- números que suben ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const end = +e.target.dataset.count; const t0 = performance.now(); const dur = 1400;
    if (reduce) { e.target.textContent = end; return; }
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur); e.target.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }), { threshold: .6 });
  $$("[data-count]").forEach(el => io.observe(el));

  /* ---------- tapicería: foto real recoloreada ---------- */
  const COLORS = [["Crema", "#EDE4D3", "crema"], ["Arena", "#CBB89A", "arena"], ["Camel", "#8A6F4B", "camel"], ["Chocolate", "#5B4332", "chocolate"], ["Gris perla", "#9AA1A8", "gris-perla"], ["Gris azulado", "#46586B", "gris-azulado"], ["Azul marino", "#243E5E", "azul-marino"], ["Verde salvia", "#5E7C69", "verde-salvia"], ["Rojo", "#A83430", "rojo"], ["Ámbar", "#D68A2A", "ambar"], ["Ciruela", "#7B4F6D", "ciruela"], ["Carbón", "#2B2825", "carbon"]];
  const TAP_MODEL = P[12];
  const tapSrc = i => `assets/img/tapiceria/${COLORS[i][2]}.webp`;
  const swEl = $("#swatches"), tapName = $("#tapName"), tapWa = $("#tapWa");
  const tapImgs = [$("#tapImgA"), $("#tapImgB")];
  let tapFront = 0, tapCur = 0, tapLoaded = false;
  $("#tapModel").textContent = TAP_MODEL.name;
  COLORS.forEach(([n, c], i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "sw"; b.style.setProperty("--c", c); b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", i === 0); b.setAttribute("aria-label", n); b.title = n;
    b.addEventListener("click", () => pick(i));
    swEl.appendChild(b);
  });
  function pick(i) {
    $$(".sw", swEl).forEach((s, k) => s.setAttribute("aria-checked", k === i));
    tapName.textContent = COLORS[i][0];
    tapWa.href = waLink(`Hola, me interesa la ${TAP_MODEL.name.toLowerCase()} (${TAP_MODEL.id}) en color ${COLORS[i][0].toLowerCase()}. ¿Me pueden dar más información?`);
    if (i === tapCur) return;
    const next = tapImgs[1 - tapFront];
    const show = () => {
      next.onload = null;
      next.alt = `${TAP_MODEL.name} en tapicería color ${COLORS[i][0].toLowerCase()}`;
      next.classList.add("is-on"); tapImgs[tapFront].classList.remove("is-on");
      tapFront = 1 - tapFront; tapCur = i;
    };
    next.onload = show;
    next.src = tapSrc(i);
    if (next.complete && next.naturalWidth) show();
  }
  pick(0);
  /* precarga las 12 fotos cuando la sección está cerca */
  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting && !tapLoaded) { tapLoaded = true; COLORS.forEach((_, i) => { const im = new Image(); im.src = tapSrc(i); }); o.disconnect(); }
  }, { rootMargin: "600px 0px" }).observe($("#tapiceria"));

  /* ---------- fotos ampliadas (reseñas y Colima) ---------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg");
  lb.addEventListener("close", () => lock(false));
  const closeLb = () => { lb.close(); lock(false); };
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  $("#lbClose").addEventListener("click", closeLb);
  $$("[data-zoom]").forEach(b => b.addEventListener("click", () => {
    const im = b.querySelector("img");
    lbImg.src = b.dataset.zoom; lbImg.alt = im ? im.alt : "";
    lb.showModal(); lock(true);
  }));

  /* ---------- video de portada ---------- */
  const cv = $("#coverVideo"), cvBtn = $("#coverToggle");
  if (cv) {
    let userPaused = false;
    cv.muted = true; cv.defaultMuted = true; cv.playsInline = true;
    const go = () => { if (!userPaused) cv.play().catch(() => {}); };
    go();
    cv.addEventListener("loadeddata", go);
    cv.addEventListener("canplay", go);
    /* si el navegador bloqueó el autoplay, arranca con la primera interacción */
    ["pointerdown", "touchstart", "keydown", "scroll"].forEach(ev => addEventListener(ev, go, { once: true, passive: true }));
    document.addEventListener("visibilitychange", () => { if (!document.hidden) go(); });
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) go(); else cv.pause(); })).observe(cv);
    cvBtn.addEventListener("click", () => {
      userPaused = !cv.paused;
      userPaused ? cv.pause() : cv.play().catch(() => {});
      cvBtn.setAttribute("aria-pressed", userPaused);
      cvBtn.setAttribute("aria-label", userPaused ? "Reproducir video de fondo" : "Pausar video de fondo");
    });
  }

  /* ---------- formulario → WhatsApp ---------- */
  $("#form").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target, nombre = f.nombre.value.trim();
    f.nombre.classList.toggle("is-bad", !nombre); $("#formErr").hidden = !!nombre;
    if (!nombre) { f.nombre.focus(); return; }
    const txt = `Hola, soy ${nombre}. Me interesa: ${f.interes.value}.` + (f.mensaje.value.trim() ? `\n${f.mensaje.value.trim()}` : "");
    window.open(waLink(txt), "_blank", "noopener");
  });
})();
