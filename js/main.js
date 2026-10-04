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
const precio = n => "$ " + n.toLocaleString("es-AR");
const cont = document.getElementById("recetas");
function mostrar(cat) {
  cont.innerHTML = menu[cat].map(r => `
      <article class="receta">
        <span class="dosis">${r.dosis}</span>
        <h3>${r.n}</h3>
        <p>${r.d}</p>
        <div class="pie"><span class="precio">${precio(r.p)}</span></div>
      </article>`).join("");
}
document.querySelectorAll(".pestanas button").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".pestanas button").forEach(x => x.setAttribute("aria-selected", "false"));
    b.setAttribute("aria-selected", "true");
    mostrar(b.dataset.cat);
  });
});
mostrar("cafe");

const form = document.getElementById("reserva");
const conf = document.getElementById("confirmacion");
const hoy = new Date().toISOString().split("T")[0];
form.dia.min = hoy;
form.addEventListener("submit", e => {
  e.preventDefault();
  const { nombre, dia, hora, personas } = form;
  if (!nombre.value.trim() || !dia.value || !hora.value) {
    conf.textContent = "Completá nombre, día y hora para reservar.";
    conf.classList.add("visible");
    return;
  }
  const fecha = new Date(dia.value + "T12:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  conf.textContent = `Mesa reservada para ${personas.value} el ${fecha} a las ${hora.value}. Te esperamos, ${nombre.value.trim()}.`;
  conf.classList.add("visible");
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
