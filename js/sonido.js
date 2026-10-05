// Sonidos sintetizados con la Web Audio API (no hay archivos de audio).
// Solo suenan después de que la persona hace clic o toca algo, como exigen los navegadores.
(function () {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const CLAVE = "botica-sonido";
  let ctx = null, maestro = null, ruido = null;
  let activo = true;
  try { activo = localStorage.getItem(CLAVE) !== "off"; } catch (e) {}

  function iniciar() {
    if (!Ctx) return false;
    if (!ctx) {
      try {
        ctx = new Ctx();
        const comp = ctx.createDynamicsCompressor();
        maestro = ctx.createGain();
        maestro.gain.value = activo ? .8 : 0;
        maestro.connect(comp); comp.connect(ctx.destination);
        const largo = ctx.sampleRate * 2, buf = ctx.createBuffer(1, largo, ctx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < largo; i++) d[i] = Math.random() * 2 - 1;
        ruido = buf;
      } catch (e) { ctx = null; return false; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return true;
  }
  const listo = () => activo && iniciar() && ctx.state !== "closed";

  function tono(tipo, f0, f1, dur, vol, retraso = 0) {
    const t = ctx.currentTime + retraso, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(maestro); o.start(t); o.stop(t + dur + .05);
  }
  function soplo(dur, tipoFiltro, f0, f1, vol, retraso = 0, q = .8) {
    const t = ctx.currentTime + retraso, src = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = ruido; src.loop = true;
    fl.type = tipoFiltro; fl.Q.value = q;
    fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .25); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(fl); fl.connect(g); g.connect(maestro); src.start(t); src.stop(t + dur + .05);
  }

  const Sonido = {
    get activo() { return activo; },
    // se llama dentro de un clic para habilitar el audio
    activar() { iniciar(); },
    pop() { if (!listo()) return; tono("sine", 560, 130, .14, .55); soplo(.05, "highpass", 2500, 1800, .35, 0, 1); },
    siseo(dur = 1.3) { if (!listo()) return; soplo(dur, "bandpass", 3800, 2600, .22, .05, .9); },
    ola() { if (!listo()) return; soplo(1, "lowpass", 260, 2600, .5, 0, .7); soplo(.9, "lowpass", 2600, 300, .3, .5, .7); tono("sine", 110, 48, 1, .35); },
    aterriza() { if (!listo()) return; tono("sine", 170, 55, .22, .6); tono("triangle", 880, 880, .7, .12, .05); tono("triangle", 1320, 1320, .55, .07, .09); },
    tick() { if (!listo()) return; tono("triangle", 1300, 900, .045, .16); },
    sello() { if (!listo()) return; tono("sine", 140, 45, .25, .7); soplo(.08, "lowpass", 1800, 400, .5, 0, .6); tono("triangle", 990, 990, .5, .1, .12); },
    alternar() {
      activo = !activo;
      try { localStorage.setItem(CLAVE, activo ? "on" : "off"); } catch (e) {}
      if (iniciar()) { maestro.gain.setTargetAtTime(activo ? .8 : 0, ctx.currentTime, .03); if (activo) this.tick(); }
      return activo;
    }
  };
  window.Sonido = Sonido;

  // Botón para silenciar / activar (siempre visible)
  function crearBoton() {
    const b = document.createElement("button");
    b.type = "button"; b.className = "sonido-btn"; b.id = "sonido-btn";
    const pinta = () => {
      b.setAttribute("aria-pressed", String(activo));
      b.setAttribute("aria-label", activo ? "Silenciar sonidos" : "Activar sonidos");
      b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/>' +
        (activo ? '<path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>' : '<path d="m16 9 5 6M21 9l-5 6"/>') + '</svg><span>' + (activo ? "Sonido" : "Mute") + "</span>";
    };
    pinta();
    b.addEventListener("click", e => { e.stopPropagation(); Sonido.alternar(); pinta(); });
    document.body.appendChild(b);
  }
  if (document.body) crearBoton(); else document.addEventListener("DOMContentLoaded", crearBoton);
})();
