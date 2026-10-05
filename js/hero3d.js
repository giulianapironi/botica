// Escenario fijo: un vaso para llevar de Botica en 3D (Three.js).
// Entra rodando en el hero y después acompaña el scroll, cambiando de lugar y de pose en cada sección.
(function () {
  const THREE = window.THREE;
  const hero = document.querySelector(".hero");
  const disco = document.querySelector(".hero-disco");
  const sinIntro = () => {
    document.documentElement.classList.remove("intro-pausa", "intro-bloqueo");
    const i = document.getElementById("intro"); if (i) i.remove();
  };
  window.BoticaIntro = true;
  if (!THREE || !hero || !disco) { sinIntro(); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    if (!renderer.getContext()) { sinIntro(); return; }
  } catch (e) { sinIntro(); return; }
  const lienzo = renderer.domElement;
  lienzo.className = "hero-3d";
  lienzo.setAttribute("aria-hidden", "true");
  hero.classList.add("con-3d");
  document.body.appendChild(lienzo);
  renderer.setClearColor(0x000000, 0);

  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camara.position.set(0, 0, 9);
  const ALTO_VISIBLE = 2 * Math.tan((30 / 2) * Math.PI / 180) * 9;

  escena.add(new THREE.HemisphereLight(0xffffff, 0x6e8f7a, 0.85));
  const luzClave = new THREE.DirectionalLight(0xffffff, 0.85); luzClave.position.set(3, 5, 5); escena.add(luzClave);
  const luzBorde = new THREE.DirectionalLight(0xffe9a8, 0.55); luzBorde.position.set(-5, 2, -3); escena.add(luzBorde);

  // ---------- Texturas impresas ----------
  const FUENTE = '"Anton", "Arial Narrow", Impact, sans-serif';
  function texturaCuerpo() {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 512;
    const x = c.getContext("2d");
    x.fillStyle = "#FFFBEF"; x.fillRect(0, 0, 1024, 512);
    // franja verde inferior con ondas y filete superior
    x.fillStyle = "#0B7A47"; x.fillRect(0, 470, 1024, 42); x.fillRect(0, 0, 1024, 16);
    x.textAlign = "center"; x.textBaseline = "middle";
    [256, 768].forEach(px => {
      x.fillStyle = "#0B7A47"; x.font = `110px ${FUENTE}`; x.fillText("BOTICA", px, 82);
      x.fillStyle = "#F0452D"; x.font = `54px ${FUENTE}`; x.fillText("℞", px, 150);
      x.fillStyle = "#0D1F16"; x.font = `500 22px "DM Mono", monospace`;
      x.fillText("CAFÉ DE ESPECIALIDAD · SAN TELMO", px, 188);
      x.fillText("LOTE N.º 1924", px, 440);
    });
    return c;
  }
  function texturaManga() {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 256;
    const x = c.getContext("2d");
    x.fillStyle = "#F0452D"; x.fillRect(0, 0, 1024, 256);
    x.textAlign = "center"; x.textBaseline = "middle";
    for (let i = 0; i < 2; i++) {
      const px = 256 + i * 512;
      x.fillStyle = "#FFE9A8"; x.font = `74px ${FUENTE}`; x.fillText("CAFÉ RECETADO", px, 100);
      x.font = `500 24px "DM Mono", monospace`; x.fillText("18 g · 36 ml · 28 s", px, 184);
      x.fillStyle = "#FFE9A8";
      [-246, 246].forEach(dx => { x.beginPath(); const sx = px + dx, sy = 128; for (let k = 0; k < 8; k++) { const r = k % 2 ? 7 : 20, a = k * Math.PI / 4; x.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } x.closePath(); x.fill(); });
    }
    return c;
  }
  const texCuerpo = new THREE.CanvasTexture(texturaCuerpo());
  const texManga = new THREE.CanvasTexture(texturaManga());
  texCuerpo.anisotropy = texManga.anisotropy = 4;
  function redibujar() {
    texCuerpo.image = texturaCuerpo(); texManga.image = texturaManga();
    texCuerpo.needsUpdate = texManga.needsUpdate = true;
  }
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load(`110px Anton`), document.fonts.load(`22px "DM Mono"`)]).then(redibujar).catch(() => {});
  }

  // ---------- Vaso ----------
  const R0 = 0.6, R1 = 0.9, ALTO = 2.0;
  const radioEn = y => R0 + (R1 - R0) * (y / ALTO);
  function cono(y0, y1, extra, mat, n = 24) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const y = y0 + (y1 - y0) * i / n; pts.push(new THREE.Vector2(radioEn(y) + extra, y)); }
    const g = new THREE.LatheGeometry(pts, 72);
    return new THREE.Mesh(g, mat);
  }
  const papel = new THREE.MeshStandardMaterial({ map: texCuerpo, roughness: .62, metalness: 0, side: THREE.DoubleSide });
  const manga = new THREE.MeshStandardMaterial({ map: texManga, roughness: .85, metalness: 0, side: THREE.DoubleSide });
  const plastico = new THREE.MeshStandardMaterial({ color: 0x0d1f16, roughness: .38, metalness: 0 });

  const vaso = new THREE.Group();
  vaso.add(cono(0, ALTO, 0, papel, 30));
  const base = new THREE.Mesh(new THREE.CircleGeometry(R0, 48), new THREE.MeshStandardMaterial({ color: 0xe8e2cf, roughness: .8 }));
  base.rotation.x = Math.PI / 2; base.position.y = .001; vaso.add(base);
  const mangaMesh = cono(0.5, 1.4, 0.018, manga, 16);
  vaso.add(mangaMesh);
  const borde = new THREE.Mesh(new THREE.TorusGeometry(radioEn(ALTO) + .015, .035, 12, 72), new THREE.MeshStandardMaterial({ color: 0xfffbef, roughness: .6 }));
  borde.rotation.x = Math.PI / 2; borde.position.y = ALTO; vaso.add(borde);
  // tapa con boca para beber
  const tapa = new THREE.Mesh(new THREE.LatheGeometry([[0, 2.2], [.46, 2.2], [.56, 2.17], [.66, 2.1], [.8, 2.07], [.95, 2.0], [.97, 1.93], [.93, 1.93]].map(p => new THREE.Vector2(p[0], p[1])), 72), plastico);
  tapa.material.side = THREE.DoubleSide;
  const tapaGrupo = new THREE.Group(); tapaGrupo.add(tapa); vaso.add(tapaGrupo);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(.5, .03, 10, 48), plastico); aro.rotation.x = Math.PI / 2; aro.position.y = 2.2; tapaGrupo.add(aro);
  const boca = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .3, 12), new THREE.MeshStandardMaterial({ color: 0x050c08, roughness: .9 }));
  boca.rotation.z = Math.PI / 2; boca.rotation.y = .3; boca.scale.set(1, 1, .9); boca.position.set(.52, 2.215, 0); tapaGrupo.add(boca);
  const cafeSup = new THREE.Mesh(new THREE.CircleGeometry(radioEn(ALTO) - .07, 48), new THREE.MeshStandardMaterial({ color: 0x2a1408, roughness: .1 }));
  cafeSup.rotation.x = -Math.PI / 2; cafeSup.position.y = ALTO - .18; vaso.add(cafeSup);
  vaso.position.y = -ALTO / 2 - .1; // centra la altura en el origen

  const inclina = new THREE.Group(); // inclinación (acostado -> parado)
  const gira = new THREE.Group();    // giro alrededor de su eje
  gira.add(vaso); inclina.add(gira);
  const pivote = new THREE.Group(); pivote.add(inclina); escena.add(pivote);

  // sombra suave bajo el vaso
  const sombraTex = (() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 64;
    const x = c.getContext("2d");
    x.translate(128, 32); x.scale(1, .25);
    const g = x.createRadialGradient(0, 0, 2, 0, 0, 124);
    g.addColorStop(0, "rgba(6,40,20,.5)"); g.addColorStop(.7, "rgba(6,40,20,.18)"); g.addColorStop(1, "rgba(6,40,20,0)");
    x.fillStyle = g; x.fillRect(-128, -128, 256, 256); return new THREE.CanvasTexture(c);
  })();
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1, .25), new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, depthWrite: false }));
  escena.add(sombra);

  // ---------- Elementos de la pantalla de bienvenida ----------
  const html = document.documentElement;
  const intro = document.getElementById("intro");
  const cuenta = document.getElementById("intro-cuenta");
  const onda = document.getElementById("intro-onda");
  const botonSaltar = document.getElementById("intro-saltar");
  const botonAbrir = document.getElementById("intro-abrir");
  window.BoticaIntro = true;

  // ---------- Vapor ----------
  const vaporTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const x = c.getContext("2d"); const g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
    g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();
  const vapor = [];
  for (let i = 0; i < 26; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: vaporTex, transparent: true, depthWrite: false, opacity: 0 }));
    sp.visible = false; escena.add(sp); vapor.push({ sp, vida: 0, dur: 1, vx: 0 });
  }
  let proxVapor = 0;

  // ---------- Medidas ----------
  let escala = 1, anchoVisible = 1, alto = 1, ancho = 1, heroPose = null;
  const lerp = (a, b, w) => a + (b - a) * w;
  const suave = t => { t = Math.min(Math.max(t, 0), 1); return t * t * (3 - 2 * t); };
  const suaviza = t => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
  const rebote = t => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

  function medir() {
    ancho = window.innerWidth; alto = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto; camara.updateProjectionMatrix();
    anchoVisible = ALTO_VISIBLE * camara.aspect;
    // el disco del hero se mide sin transformaciones (entra con una animación de escala)
    const dAncho = disco.offsetWidth, dAlto = disco.offsetHeight;
    const r = hero.getBoundingClientRect();
    heroPose = {
      x: (r.left + disco.offsetLeft + dAncho / 2) / ancho * 2 - 1,
      cyPagina: r.top + window.scrollY + disco.offsetTop + dAlto / 2,
      h: dAncho * .98 / alto
    };
  }
  medir();
  window.addEventListener("resize", medir);
  window.addEventListener("load", medir);
  const poseHero = s => ({ x: heroPose.x, y: -((heroPose.cyPagina - s) / alto * 2 - 1), h: heroPose.h, tx: .16 });
  const poseCentro = () => ({ x: 0, y: .03, h: ancho < 800 ? .44 : .6, tx: .22 });

  // ---------- Secuencia ----------
  const T = { entrar: 1.9, abrir: 1.2, viaje: 1.35 };
  let fase = "cargando", tFase = performance.now(), giro = 0, ultimo = performance.now();
  let tapaVuelta = 0, ondaLista = false, irisLista = false;
  const t0 = performance.now();
  let progreso = 0;
  const pasar = f => { fase = f; tFase = performance.now(); };

  function terminar() {
    fase = "listo"; tapaVuelta = performance.now();
    html.classList.remove("intro-pausa", "intro-bloqueo");
    if (intro) intro.remove();
    window.scrollTo(0, 0);
  }
  function saltar() {
    if (fase === "listo") return;
    tapaGrupo.visible = true; tapaGrupo.position.set(0, 0, 0); tapaGrupo.rotation.set(0, 0, 0); tapaGrupo.scale.setScalar(1);
    terminar();
  }
  if (reducir || !intro) { saltar(); }
  else {
    botonSaltar && botonSaltar.addEventListener("click", e => { e.stopPropagation(); saltar(); });
    const abrir = () => { if (fase === "espera") { pasar("abriendo"); intro.classList.add("abierto"); } };
    intro.addEventListener("click", abrir);
    botonAbrir && botonAbrir.addEventListener("click", e => { e.stopPropagation(); abrir(); });
    window.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && fase === "espera") { e.preventDefault(); abrir(); } });
  }

  function emitirVapor(x, y, ahora, dt) {
    proxVapor -= dt;
    if (proxVapor > 0) return;
    proxVapor = .07;
    const p = vapor.find(v => v.vida <= 0); if (!p) return;
    p.vida = p.dur = 1.6 + Math.random() * .8; p.vx = (Math.random() - .5) * .35;
    p.sp.position.set(x + (Math.random() - .5) * .35 * escala, y + 1.15 * escala, .3);
    p.sp.scale.setScalar(.5 * escala); p.sp.visible = true;
  }
  function moverVapor(dt) {
    vapor.forEach(p => {
      if (p.vida <= 0) { p.sp.visible = false; return; }
      p.vida -= dt;
      const k = 1 - Math.max(p.vida, 0) / p.dur;
      p.sp.position.y += dt * 1.1 * escala; p.sp.position.x += p.vx * dt * escala;
      p.sp.scale.setScalar((.5 + k * 1.3) * escala);
      p.sp.material.opacity = Math.sin(Math.min(k, 1) * Math.PI) * .5;
    });
  }

  function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    if (document.hidden) return;
    const dt = Math.min((ahora - ultimo) / 1000, .1); ultimo = ahora;
    const tf = (ahora - tFase) / 1000;
    const yScroll = window.scrollY;
    let P, x, y, caida = 0, tx = .16, salto = 0, squash = 1, velGiro = .35;
    const centro = poseCentro();
    const aHero = poseHero(fase === "listo" ? yScroll : 0);

    pivote.visible = fase !== "cargando";
    // contador de carga
    if (fase === "cargando") {
      const real = document.readyState === "complete" ? 1 : .6;
      progreso = Math.min(Math.min((ahora - t0) / 2200, 1) * real + (real === 1 ? 0 : 0), 1);
      if (cuenta) cuenta.textContent = String(Math.round(progreso * 100)).padStart(2, "0");
      if (progreso >= 1 && document.readyState === "complete") {
        intro && intro.classList.add("listo");
        pasar("entrando");
      }
    }

    P = fase === "listo" ? aHero : centro;
    escala = (P.h * ALTO_VISIBLE) / 2.45;
    const radio = .75 * escala;
    let destX = P.x * anchoVisible / 2, destY = P.y * ALTO_VISIBLE / 2;
    x = destX; y = destY;

    if (fase === "entrando") {
      const rodar = 1.15, enderezar = .75;
      const xIni = -(anchoVisible / 2 + 2.2 * escala);
      if (tf < rodar) {
        const k = suaviza(tf / rodar);
        x = xIni + (destX - xIni) * k; giro = -(x - xIni) / radio;
        y = destY - .55 * escala; caida = -Math.PI / 2;
      } else {
        const u = Math.min((tf - rodar) / enderezar, 1);
        giro = -(destX - xIni) / radio + suaviza(u) * 1.5;
        caida = -Math.PI / 2 * (1 - Math.min(rebote(u), 1.25));
        salto = Math.sin(u * Math.PI) * .45 * escala;
        y = destY - .55 * escala * (1 - suaviza(u)) + salto;
      }
      tx = lerp(.16, centro.tx, suave(tf / T.entrar));
      if (tf >= T.entrar) { pasar("espera"); intro && intro.classList.add("espera"); }
    } else if (fase === "espera") {
      giro += .5 * dt; velGiro = 0; tx = centro.tx;
      y += Math.sin(tf * 1.8) * .05 * escala;
    } else if (fase === "abriendo") {
      const u = Math.min(tf / T.abrir, 1);
      tx = lerp(centro.tx, .62, suave(u * 2));
      giro += (.5 + 16 * Math.sin(Math.min(u * 1.6, 1) * Math.PI)) * dt; velGiro = 0;
      squash = 1 + .06 * Math.sin(Math.min(u * 3, 1) * Math.PI);
      x += Math.sin(tf * 48) * .012 * escala * (1 - u);
      // la tapa sale volando
      const t = Math.max(tf - .12, 0);
      tapaGrupo.position.set(1.7 * t, 5.4 * t - 6.2 * t * t, 1.4 * t);
      tapaGrupo.rotation.set(2.2 * t, 0, -3.4 * t);
      tapaGrupo.visible = t < 1.05;
      emitirVapor(x, y, ahora, dt);
      if (!ondaLista && tf > .55 && onda) {
        ondaLista = true;
        const px = (x / (anchoVisible / 2) + 1) / 2 * ancho, py = (1 - (y / (ALTO_VISIBLE / 2) + 1) / 2) * alto;
        onda.style.left = px + "px"; onda.style.top = py + "px"; onda.classList.add("crece");
      }
      if (tf >= T.abrir) { pasar("viaje"); }
    } else if (fase === "viaje") {
      const u = Math.min(tf / T.viaje, 1), e = suave(u);
      const h = poseHero(0);
      destX = lerp(centro.x, h.x, e) * anchoVisible / 2; destY = lerp(centro.y, h.y, e) * ALTO_VISIBLE / 2;
      escala = (lerp(centro.h, h.h, e) * ALTO_VISIBLE) / 2.45;
      x = destX; y = destY + Math.sin(u * Math.PI) * .35 * escala;
      tx = lerp(.62, .16, e);
      giro += (.5 + 6 * (1 - u)) * dt; velGiro = 0;
      emitirVapor(x, y, ahora, dt);
      if (!irisLista && intro) {
        irisLista = true;
        html.classList.remove("intro-pausa");
        const hp = poseHero(0);
        const px = (hp.x + 1) / 2 * ancho, py = (1 - (hp.y + 1) / 2) * alto;
        intro.style.transition = `clip-path ${T.viaje * .85}s cubic-bezier(.65,0,.25,1)`;
        intro.style.clipPath = `circle(0px at ${px}px ${py}px)`;
      }
      if (tf >= T.viaje) terminar();
    } else if (fase === "listo") {
      giro += velGiro * dt;
      y += Math.sin(ahora / 1000 * 1.7) * .04 * escala;
      const k = Math.min((ahora - tapaVuelta) / 450, 1);
      if (k < 1 && tapaVuelta) { tapaGrupo.visible = true; tapaGrupo.position.set(0, 0, 0); tapaGrupo.rotation.set(0, 0, 0); tapaGrupo.scale.setScalar(Math.max(rebote(k), .001)); }
      else tapaGrupo.scale.setScalar(1);
    }

    pivote.position.set(x, y, 0);
    pivote.scale.setScalar(escala * squash);
    inclina.rotation.z = caida;
    inclina.rotation.x = tx;
    gira.rotation.y = giro + (fase === "listo" ? yScroll * .0042 : 0);
    sombra.position.set(x, y - 1.32 * escala - salto * .15, -.2);
    sombra.scale.setScalar(escala * 2.2);
    sombra.visible = fase !== "cargando" && !(fase === "entrando" && tf < .7) && fase !== "viaje";
    moverVapor(dt);
    renderer.render(escena, camara);
  }
  requestAnimationFrame(cuadro);
})();
