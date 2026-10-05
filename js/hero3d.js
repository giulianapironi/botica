// Hero: vaso para llevar de Botica en 3D (Three.js).
// Entra rodando desde la izquierda, se levanta con un rebote y después gira con el scroll.
(function () {
  const THREE = window.THREE;
  const hero = document.querySelector(".hero");
  const disco = document.querySelector(".hero-disco");
  if (!THREE || !hero || !disco) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    if (!renderer.getContext()) return;
  } catch (e) { return; }
  const lienzo = renderer.domElement;
  lienzo.className = "hero-3d";
  lienzo.setAttribute("aria-hidden", "true");
  hero.classList.add("con-3d");
  hero.insertBefore(lienzo, hero.querySelector(".titanes"));
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
  tapa.material.side = THREE.DoubleSide; vaso.add(tapa);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(.5, .03, 10, 48), plastico); aro.rotation.x = Math.PI / 2; aro.position.y = 2.2; vaso.add(aro);
  const boca = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .3, 12), new THREE.MeshStandardMaterial({ color: 0x050c08, roughness: .9 }));
  boca.rotation.z = Math.PI / 2; boca.rotation.y = .3; boca.scale.set(1, 1, .9); boca.position.set(.52, 2.215, 0); vaso.add(boca);
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

  // ---------- Tamaño y posición ----------
  let escala = 1, destX = 0, destY = 0, anchoVisible = 1, alto = 1, ancho = 1;
  function medir() {
    const h = hero.getBoundingClientRect();
    ancho = h.width; alto = h.height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto; camara.updateProjectionMatrix();
    anchoVisible = ALTO_VISIBLE * camara.aspect;
    const d = disco.getBoundingClientRect();
    const cx = (d.left + d.width / 2 - h.left) / ancho * 2 - 1;
    const cy = -((d.top + d.height / 2 - h.top) / alto * 2 - 1);
    destX = cx * anchoVisible / 2; destY = cy * ALTO_VISIBLE / 2;
    escala = (d.width * 0.98 / alto * ALTO_VISIBLE) / 2.45;
    pivote.scale.setScalar(escala);
  }
  medir();
  window.addEventListener("resize", medir);

  // ---------- Animación ----------
  const rodar = 1.7, enderezar = .95, retraso = .35;
  const suaviza = t => 1 - Math.pow(1 - t, 3);
  const rebote = t => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const inicio = performance.now();
  let visible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);

  function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    if (!visible || document.hidden) return;
    const t = (ahora - inicio) / 1000 - retraso;
    const yScroll = window.scrollY;
    const p = Math.min(yScroll / Math.max(alto, 1), 1);
    const empuje = yScroll * .0062;
    const radio = .75 * escala;
    const xIni = -(anchoVisible / 2 + 2.2 * escala);
    let x = destX, y = destY, giro = 0, caida = -Math.PI / 2, salto = 0;

    if (reducir) {
      caida = 0; giro = .6;
    } else if (t < rodar) {
      const k = suaviza(Math.max(t, 0) / rodar);
      x = xIni + (destX - xIni) * k;
      giro = -(x - xIni) / radio;
      y = destY - .55 * escala;
    } else {
      const u = Math.min((t - rodar) / enderezar, 1);
      const giroFinal = -(destX - xIni) / radio;
      giro = giroFinal + suaviza(u) * 1.5 + Math.max(t - rodar - enderezar, 0) * .45;
      caida = -Math.PI / 2 * (1 - Math.min(rebote(u), 1.25));
      salto = Math.sin(u * Math.PI) * .45 * escala;
      y = destY - .55 * escala * (1 - suaviza(u)) + salto;
    }
    const flota = t > rodar + enderezar ? Math.sin((t - rodar - enderezar) * 1.7) * .05 * escala : 0;
    pivote.position.set(x + p * .5 * escala, y + flota - p * .25 * escala, 0);
    pivote.scale.setScalar(escala * (1 - p * .12));
    inclina.rotation.z = caida - p * .4;
    inclina.rotation.x = .16;
    gira.rotation.y = giro + empuje;

    sombra.position.set(x, destY - 1.32 * escala - salto * .15, -.2);
    sombra.scale.setScalar(escala * 2.2 * (1 - Math.min(salto / (.9 * escala), .5) * .6) * (t < rodar && !reducir ? Math.max(.0, suaviza(Math.max(t, 0) / rodar)) : 1));
    sombra.visible = !(t < rodar && !reducir) || t > rodar * .6;
    renderer.render(escena, camara);
  }
  requestAnimationFrame(cuadro);
})();
