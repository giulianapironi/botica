const menu = {
  cafe: [
    { ic: "espresso", n: "Espresso", d: "Corto e intenso. Ideal para conocer el origen del día.", dosis: "18 g / 36 ml / 28 s", p: 2800 },
    { ic: "cortado", n: "Cortado", d: "Espresso con un toque de leche texturizada.", dosis: "18 g / 60 ml", p: 3200 },
    { ic: "flatwhite", n: "Flat white", d: "Doble ristretto y leche sedosa, sin espuma alta.", dosis: "18 g / 160 ml", p: 3900 },
    { ic: "v60", n: "Filtrado V60", d: "Método manual que resalta notas frutales.", dosis: "15 g / 250 ml / 3 min", p: 4200 }
  ],
  frio: [
    { ic: "coldbrew", n: "Cold brew", d: "Infusionado en frío durante 18 horas. Suave y dulce.", dosis: "18 h de extracción", p: 4000 },
    { ic: "tonic", n: "Espresso tonic", d: "Agua tónica, hielo y un espresso por encima.", dosis: "18 g / 150 ml tónica", p: 4500 },
    { ic: "icedlatte", n: "Iced latte", d: "Doble espresso con leche fría y hielo.", dosis: "18 g / 200 ml", p: 4300 }
  ],
  pasteleria: [
    { ic: "medialuna", n: "Medialuna de manteca", d: "Horneada cada mañana en el local.", dosis: "Hasta agotar", p: 1500 },
    { ic: "budin", n: "Budín de limón", d: "Con glaseado de limón y semillas de amapola.", dosis: "Porción", p: 2900 },
    { ic: "alfajor", n: "Alfajor de maicena", d: "Dulce de leche casero y coco rallado.", dosis: "Unidad", p: 2200 },
    { ic: "tostado", n: "Tostado de jamón y queso", d: "En pan de masa madre.", dosis: "Con ensalada", p: 6500 }
  ]
};
// Íconos de cada bebida, vistos desde arriba (giran con CSS)
const T = "#0D1F16";
const svg = interior => `<svg class="f-icono" viewBox="0 0 100 100" aria-hidden="true">${interior}</svg>`;
const taza = (r, liquido, arte) =>
  `<circle cx="50" cy="50" r="46" fill="#FFFBEF" stroke="${T}" stroke-width="3"/>` +
  `<rect x="${50 + r - 3}" y="43" width="16" height="14" rx="7" fill="#fff" stroke="${T}" stroke-width="3"/>` +
  `<circle cx="50" cy="50" r="${r}" fill="#fff" stroke="${T}" stroke-width="3"/>` +
  `<circle cx="50" cy="50" r="${r - 6}" fill="${liquido}"/>${arte}`;
const hielos = `<g fill="rgba(255,255,255,.55)" stroke="#fff" stroke-width="2"><rect x="30" y="34" width="17" height="17" rx="4" transform="rotate(14 38 42)"/><rect x="50" y="46" width="17" height="17" rx="4" transform="rotate(-18 58 54)"/><rect x="36" y="58" width="15" height="15" rx="4" transform="rotate(30 43 65)"/></g>`;
const sorbete = `<path d="M52 50 L84 16" stroke="#F0452D" stroke-width="6" stroke-linecap="round"/>`;
const iconos = {
  espresso: () => svg(taza(24, "#3B200E", `<circle cx="50" cy="50" r="12" fill="#C98B4F" opacity=".85"/><circle cx="44" cy="44" r="2.4" fill="#F3D9B0"/><circle cx="56" cy="55" r="2" fill="#F3D9B0"/>`)),
  cortado: () => svg(taza(28, "#6B3F1E", `<path d="M42 50a8 8 0 1 1 16 0a8 8 0 1 1-16 0" fill="#F3E3C8"/><path d="M46 50a4 4 0 1 1 8 0" fill="none" stroke="#B97B45" stroke-width="2.4" stroke-linecap="round"/>`)),
  flatwhite: () => svg(taza(32, "#B97B45", `<path d="M50 70C32 58 33 40 43 39C47 39 50 42 50 46C50 42 53 39 57 39C67 40 68 58 50 70Z" fill="#FFF3DE"/>`)),
  v60: () => {
    let l = "";
    for (let i = 0; i < 10; i++) l += `<line x1="50" y1="${50 - 16}" x2="50" y2="${50 - 38}" stroke="${T}" stroke-width="2.4" stroke-linecap="round" transform="rotate(${i * 36} 50 50)"/>`;
    return svg(`<circle cx="50" cy="50" r="46" fill="#FFFBEF" stroke="${T}" stroke-width="3"/><circle cx="50" cy="50" r="40" fill="#fff" stroke="${T}" stroke-width="3"/>${l}<circle cx="50" cy="50" r="14" fill="#3B200E"/><circle cx="46" cy="46" r="3" fill="#C98B4F"/>`);
  },
  coldbrew: () => svg(`<circle cx="50" cy="50" r="44" fill="#fff" stroke="${T}" stroke-width="3"/><circle cx="50" cy="50" r="37" fill="#4A2A14"/>${hielos}${sorbete}`),
  tonic: () => svg(`<circle cx="50" cy="50" r="44" fill="#fff" stroke="${T}" stroke-width="3"/><circle cx="50" cy="50" r="37" fill="#E9D79A"/><circle cx="50" cy="50" r="24" fill="#4A2A14" opacity=".55"/><g transform="translate(36 38)"><circle r="15" fill="#F6D44C" stroke="#fff" stroke-width="3"/><path d="M0 0L0-12M0 0L11-5M0 0L9 9M0 0L-9 9M0 0L-11-5" stroke="#fff" stroke-width="2"/></g>${sorbete}`),
  icedlatte: () => svg(`<circle cx="50" cy="50" r="44" fill="#fff" stroke="${T}" stroke-width="3"/><circle cx="50" cy="50" r="37" fill="#C79A6C"/>${hielos}${sorbete}`),
  medialuna: () => svg(`<path d="M10 64C12 30 38 12 62 16C82 20 92 40 90 64C80 52 70 48 60 50C54 58 46 63 36 64C26 68 18 68 10 64Z" fill="#E3A53B" stroke="${T}" stroke-width="3" stroke-linejoin="round"/><path d="M30 50C34 42 42 36 52 34M48 54C54 46 62 42 72 42M62 36C68 33 74 34 80 38" fill="none" stroke="#B87818" stroke-width="3" stroke-linecap="round"/>`),
  budin: () => svg(`<rect x="12" y="28" width="76" height="44" rx="11" fill="#F2D66B" stroke="${T}" stroke-width="3"/><path d="M12 39C12 33 16 28 23 28H77C84 28 88 33 88 39V46H12Z" fill="#fff" stroke="${T}" stroke-width="3" stroke-linejoin="round"/><g fill="${T}"><circle cx="28" cy="58" r="1.8"/><circle cx="44" cy="62" r="1.8"/><circle cx="60" cy="57" r="1.8"/><circle cx="74" cy="63" r="1.8"/><circle cx="36" cy="37" r="1.6"/><circle cx="62" cy="38" r="1.6"/></g>`),
  alfajor: () => {
    let d = "";
    for (let i = 0; i < 14; i++) d += `<circle cx="50" cy="${50 - 36}" r="3.2" fill="#fff" transform="rotate(${i * (360 / 14)} 50 50)"/>`;
    return svg(`<circle cx="50" cy="50" r="42" fill="#C99A62" stroke="${T}" stroke-width="3"/>${d}<circle cx="50" cy="50" r="24" fill="#E7C892" stroke="${T}" stroke-width="2.5"/><circle cx="50" cy="50" r="11" fill="#8A4B1F"/>`);
  },
  tostado: () => svg(`<rect x="12" y="12" width="76" height="76" rx="13" fill="#E2B76A" stroke="${T}" stroke-width="3"/><rect x="22" y="22" width="56" height="56" rx="8" fill="#F8E3A8"/><path d="M28 70L70 28M42 74L74 42M28 52L52 28" stroke="#B8842F" stroke-width="3.5" stroke-linecap="round"/><path d="M22 66C30 62 36 70 44 66C52 62 58 70 66 66C70 64 74 66 78 66V78H22Z" fill="#F4C430" stroke="${T}" stroke-width="2"/>`)
};
const precio = n => "$" + n.toLocaleString("es-AR");
const cont = document.getElementById("recetas");
function mostrar(cat, animar) {
  cont.innerHTML = menu[cat].map((r, i) => `
      <li class="formula${animar ? " nueva" : ""}" style="--i:${i}">
        ${window.Botica3D && Botica3D.disponible ? `<canvas class="f-3d" data-ic="${r.ic}" width="360" height="360" role="img" aria-label="${r.n}"></canvas>` : iconos[r.ic]()}
        <div>
          <p class="f-num">N.º ${String(i + 1).padStart(2, "0")}</p>
          <h3 class="f-nombre">${r.n}</h3>
          <p class="f-desc">${r.d}</p>
          <p class="f-dosis">${r.dosis}</p>
        </div>
        <span class="f-precio">${precio(r.p)}</span>
      </li>`).join("");
  if (window.Botica3D && Botica3D.disponible) Botica3D.montar(cont);
}
document.querySelectorAll(".pestanas button").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".pestanas button").forEach(x => x.setAttribute("aria-selected", "false"));
    b.setAttribute("aria-selected", "true");
    mostrar(b.dataset.cat, true);
  });
});
mostrar("cafe", false);

const form = document.getElementById("reserva");
const conf = document.getElementById("confirmacion");
const hoy = new Date().toISOString().split("T")[0];
form.dia.min = hoy;
form.addEventListener("submit", e => {
  e.preventDefault();
  const { nombre, dia, hora, personas } = form;
  conf.classList.add("visible");
  if (!nombre.value.trim() || !dia.value || !hora.value) {
    conf.textContent = "Completá nombre, día y hora para reservar.";
    return;
  }
  const fecha = new Date(dia.value + "T12:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  conf.innerHTML = "";
  const sello = document.createElement("span");
  sello.className = "sello";
  sello.textContent = "Reservada";
  const texto = document.createElement("span");
  texto.textContent = `Mesa para ${personas.value} el ${fecha} a las ${hora.value}. Te esperamos, ${nombre.value.trim()}.`;
  conf.append(sello, texto);
  form.reset();
});

// Estado "abierto ahora" según el horario de Buenos Aires
const horarios = { 0: [10, 18], 6: [9, 20] };
for (let d = 1; d <= 5; d++) horarios[d] = [8, 19];
function actualizarEstado() {
  const ahora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const [abre, cierra] = horarios[ahora.getDay()];
  const hora = ahora.getHours() + ahora.getMinutes() / 60;
  const abierto = hora >= abre && hora < cierra;
  document.getElementById("estado").classList.toggle("abierto", abierto);
  document.getElementById("estado-texto").textContent = abierto
    ? `Abierto ahora · hasta las ${cierra} h`
    : `Cerrado · abre ${hora < abre ? "hoy" : "mañana"} a las ${hora < abre ? abre : horarios[(ahora.getDay() + 1) % 7][0]} h`;
}
actualizarEstado();

// Cintas: se duplica el contenido para que el bucle sea continuo
document.querySelectorAll(".pista").forEach(p => {
  const original = [...p.children];
  const ancho = () => p.scrollWidth;
  while (ancho() < window.innerWidth * 2.2) original.forEach(h => p.appendChild(h.cloneNode(true)));
  const mitad = [...p.children];
  mitad.forEach(h => p.appendChild(h.cloneNode(true)));
});

// Movimiento (se omite si el sistema pide reducir movimiento)
if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches && "IntersectionObserver" in window) {
  document.documentElement.classList.add("anim");

  // Titular del hero letra por letra
  document.querySelectorAll(".titanes .linea").forEach((linea, l) => {
    const texto = linea.textContent;
    linea.innerHTML = [...texto].map((c, i) => `<span class="ch" style="--i:${i + l * 4}">${c}</span>`).join("");
  });

  // Entrada al hacer scroll
  const grupos = ".casa-texto > *, .redondo, .cab-sec, .pestanas, .formula, .gigante-xl, .ph, .visita-info > *, .talonario";
  const visibles = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visto");
      visibles.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
  const observar = el => {
    const hermanos = [...el.parentElement.children].filter(h => h.matches(grupos));
    el.dataset.reveal = "";
    el.style.setProperty("--d", `${Math.min(hermanos.indexOf(el), 6) * 0.08}s`);
    visibles.observe(el);
  };
  document.querySelectorAll(grupos).forEach(el => { if (!el.closest(".cab-sec") || el.matches(".cab-sec")) observar(el); });

  // Parallax suave: cada elemento con data-vel se desplaza a su propio ritmo
  const flotantes = [...document.querySelectorAll("[data-vel]")];
  let esperando = false;
  const mover = () => {
    const mitad = window.innerHeight / 2;
    flotantes.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const centro = r.top + r.height / 2 - mitad;
      el.style.translate = `0 ${(-(centro) * parseFloat(el.dataset.vel)).toFixed(1)}px`;
    });
    esperando = false;
  };
  window.addEventListener("scroll", () => { if (!esperando) { esperando = true; requestAnimationFrame(mover); } }, { passive: true });
  window.addEventListener("resize", mover);
  mover();
}
