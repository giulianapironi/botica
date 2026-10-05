const menu = {
  cafe: [
    { n: "Espresso", d: "Corto e intenso. Ideal para conocer el origen del día.", dosis: "18 g / 36 ml / 28 s", p: 2800 },
    { n: "Cortado", d: "Espresso con un toque de leche texturizada.", dosis: "18 g / 60 ml", p: 3200 },
    { n: "Flat white", d: "Doble ristretto y leche sedosa, sin espuma alta.", dosis: "18 g / 160 ml", p: 3900 },
    { n: "Filtrado V60", d: "Método manual que resalta notas frutales.", dosis: "15 g / 250 ml / 3 min", p: 4200 }
  ],
  frio: [
    { n: "Cold brew", d: "Infusionado en frío durante 18 horas. Suave y dulce.", dosis: "18 h de extracción", p: 4000 },
    { n: "Espresso tonic", d: "Agua tónica, hielo y un espresso por encima.", dosis: "18 g / 150 ml tónica", p: 4500 },
    { n: "Iced latte", d: "Doble espresso con leche fría y hielo.", dosis: "18 g / 200 ml", p: 4300 }
  ],
  pasteleria: [
    { n: "Medialuna de manteca", d: "Horneada cada mañana en el local.", dosis: "Hasta agotar", p: 1500 },
    { n: "Budín de limón", d: "Con glaseado de limón y semillas de amapola.", dosis: "Porción", p: 2900 },
    { n: "Alfajor de maicena", d: "Dulce de leche casero y coco rallado.", dosis: "Unidad", p: 2200 },
    { n: "Tostado de jamón y queso", d: "En pan de masa madre.", dosis: "Con ensalada", p: 6500 }
  ]
};
const precio = n => "$" + n.toLocaleString("es-AR");
const cont = document.getElementById("recetas");
function mostrar(cat, animar) {
  cont.innerHTML = menu[cat].map((r, i) => `
      <li class="formula${animar ? " nueva" : ""}" style="--i:${i}">
        <span class="f-num">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <h3 class="f-nombre">${r.n}</h3>
          <p class="f-desc">${r.d}</p>
          <p class="f-dosis">${r.dosis}</p>
        </div>
        <span class="f-precio">${precio(r.p)}</span>
      </li>`).join("");
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
