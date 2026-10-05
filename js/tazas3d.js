// Modelos 3D de cada bebida (Three.js). Un solo renderizador WebGL dibuja
// las piezas visibles y copia el resultado al canvas de cada fila del recetario.
(function () {
  const THREE = window.THREE;
  window.Botica3D = { disponible: false, montar() {} };
  if (!THREE) return;

  const TAM = 360;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    if (!renderer.getContext()) return;
  } catch (e) { return; }
  renderer.setPixelRatio(1);
  renderer.setSize(TAM, TAM, false);
  renderer.setClearColor(0x000000, 0);

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
  camara.position.set(0, 2.9, 5.2);
  camara.lookAt(0, -.05, 0);
  escena.add(new THREE.HemisphereLight(0xffffff, 0x9fb3a6, 0.6));
  const luzA = new THREE.DirectionalLight(0xffffff, 0.62); luzA.position.set(3, 5, 4); escena.add(luzA);
  const luzB = new THREE.DirectionalLight(0xfff1d6, 0.28); luzB.position.set(-4, 2, -3); escena.add(luzB);

  // ---------- Materiales ----------
  const std = (color, rugosidad = 0.5, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rugosidad, metalness: 0 }, extra));
  const ceramica = std(0xfdfaf2, 0.22, { side: THREE.DoubleSide });
  const vidrio = std(0xffffff, 0.04, { transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false });
  const hieloMat = std(0xeaf6ff, 0.08, { transparent: true, opacity: 0.55, depthWrite: false });

  const lathe = (pts, mat, seg = 56) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg), mat);

  // ---------- Texturas de la superficie del café ----------
  function texturaCafe(tipo) {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d");
    const base = { espresso: "#3a1d0b", cortado: "#4b2a14", flat: "#b87a42" }[tipo];
    x.fillStyle = base; x.fillRect(0, 0, 256, 256);
    if (tipo === "espresso") {
      const g = x.createRadialGradient(128, 128, 10, 128, 128, 124);
      g.addColorStop(0, "#c88b4d"); g.addColorStop(.55, "#a56a30"); g.addColorStop(1, "#4a260f");
      x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      x.fillStyle = "rgba(244,214,170,.55)";
      for (let i = 0; i < 26; i++) { const a = Math.random() * 6.28, r = Math.random() * 100; x.beginPath(); x.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 1.5 + Math.random() * 3, 0, 6.28); x.fill(); }
    } else if (tipo === "flat") {
      const g = x.createRadialGradient(128, 128, 20, 128, 128, 124);
      g.addColorStop(0, "#c58a52"); g.addColorStop(1, "#8d5629");
      x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      x.shadowColor = "rgba(255,243,222,.9)"; x.shadowBlur = 8; x.fillStyle = "#fff3de";
      x.beginPath(); // corazón (tulipán) de latte art
      x.moveTo(128, 204); x.bezierCurveTo(52, 150, 62, 70, 112, 70); x.bezierCurveTo(124, 70, 128, 82, 128, 92);
      x.bezierCurveTo(128, 82, 132, 70, 144, 70); x.bezierCurveTo(194, 70, 204, 150, 128, 204); x.fill();
      x.shadowBlur = 0; x.strokeStyle = "#8d5629"; x.lineWidth = 3;
      for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(128, 100 + i * 20); x.lineTo(128, 190); x.stroke(); break; }
    } else {
      const g = x.createRadialGradient(128, 128, 5, 128, 128, 124);
      g.addColorStop(0, "#d9c3a0"); g.addColorStop(.35, "#7d4a24"); g.addColorStop(1, "#4b2a14");
      x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      x.strokeStyle = "rgba(255,240,215,.8)"; x.lineWidth = 9; x.lineCap = "round";
      x.beginPath(); for (let a = 0; a < 11; a += .1) { const r = 6 + a * 9; const px = 128 + Math.cos(a) * r, py = 128 + Math.sin(a) * r; a === 0 ? x.moveTo(px, py) : x.lineTo(px, py); } x.stroke();
    }
    return new THREE.CanvasTexture(c);
  }

  // ---------- Piezas ----------
  function taza({ r = 0.5, h = 0.7, arte }) {
    const g = new THREE.Group();
    const exterior = [[0, 0], [r * .5, 0], [r * .58, .035], [r * .82, h * .4], [r * .98, h * .82], [r * 1.03, h]];
    const interior = [[r * .97, h], [r * .91, h * .88], [r * .77, h * .5], [r * .5, h * .16], [0, h * .13]];
    const cuerpo = lathe(exterior.concat(interior), ceramica); cuerpo.position.y = .045; g.add(cuerpo);
    const liquido = new THREE.Mesh(new THREE.CircleGeometry(r * .87, 48), std(0xffffff, .12, { map: texturaCafe(arte) }));
    liquido.rotation.x = -Math.PI / 2; liquido.position.y = .045 + h * .77; g.add(liquido);
    const asa = new THREE.Mesh(new THREE.TorusGeometry(h * .27, h * .065, 12, 24, Math.PI), ceramica);
    asa.rotation.z = -Math.PI / 2; asa.position.set(r * .99, .045 + h * .55, 0); g.add(asa);
    const plato = lathe([[0, 0], [r * 1.05, 0], [r * 1.42, .05], [r * 1.5, .095], [r * 1.46, .1], [r * 1.4, .085], [r * 1.1, .04], [0, .04]], ceramica, 64);
    g.add(plato);
    return g;
  }

  function vaso({ r = 0.5, h = 1.5, capas, hielos = 0, sorbete = false, limon = false, boca }) {
    const g = new THREE.Group();
    const ext = [[0, 0], [r * .86, 0], [r * .9, .07], [r * 1.0, h]];
    const intr = [[r * .96, h], [r * .87, .13], [0, .13]];
    const v = lathe(ext.concat(intr), vidrio, 48); v.renderOrder = 5; g.add(v);
    const radioEn = y => (r * .87) + (r * .96 - r * .87) * ((y - .13) / (h - .13)) - .012;
    let y0 = .13;
    capas.forEach((c, i) => {
      const alto = (h - .13) * c.f;
      const cil = new THREE.Mesh(new THREE.CylinderGeometry(radioEn(y0 + alto), radioEn(y0), alto, 40), std(c.color, .12, { transparent: true, opacity: c.op ?? .95 }));
      cil.position.y = y0 + alto / 2; cil.renderOrder = 2 + i; g.add(cil); y0 += alto;
    });
    const nivel = y0;
    for (let i = 0; i < hielos; i++) {
      const lado = r * (.55 + Math.random() * .12);
      const cubo = new THREE.Mesh(new THREE.BoxGeometry(lado, lado, lado), hieloMat);
      const a = (i / hielos) * 6.28 + Math.random();
      cubo.position.set(Math.cos(a) * r * .3, nivel - lado * (.25 + Math.random() * .35) - i * .04, Math.sin(a) * r * .3);
      cubo.rotation.set(Math.random() * 1.2, Math.random() * 3, Math.random() * 1.2); cubo.renderOrder = 6; g.add(cubo);
    }
    if (sorbete) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, h * 1.35, 12), std(0xf0452d, .35));
      s.position.set(r * .22, h * .62, 0); s.rotation.z = -.16; g.add(s);
    }
    if (limon) {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(r * .62, r * .62, .05, 32), std(0xf6d44c, .5));
      l.position.set(r * .75, h - .02, 0); l.rotation.set(0, 0, 1.15); g.add(l);
      const pulpa = new THREE.Mesh(new THREE.CylinderGeometry(r * .54, r * .54, .056, 32), std(0xfff2a8, .6));
      pulpa.position.copy(l.position); pulpa.rotation.copy(l.rotation); g.add(pulpa);
    }
    return g;
  }

  function v60() {
    const g = new THREE.Group();
    const jarra = vaso({ r: .55, h: .85, capas: [{ color: 0x3a1d0b, f: .55, op: .97 }] });
    g.add(jarra);
    const emb = lathe([[.14, 0], [.24, 0], [.62, .5], [.98, .62], [1.0, .67], [.96, .67], [.6, .55], [.22, .06], [.14, .06]], ceramica, 56);
    emb.position.y = .8; g.add(emb);
    const fondo = new THREE.Mesh(new THREE.CircleGeometry(.5, 40), std(0x3a1d0b, .5)); fondo.rotation.x = -Math.PI / 2; fondo.position.y = .8 + .42; g.add(fondo);
    return g;
  }

  function medialuna() {
    const g = new THREE.Group();
    const mat = std(0xe0a03c, .55);
    const oscuro = std(0xc27e22, .6);
    const n = 13;
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1) - .5) * Math.PI * 1.15;
      const perfil = Math.pow(Math.sin(Math.PI * (i + .6) / (n + .2)), .8);
      const s = .09 + perfil * .26;
      const esfera = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), i % 2 ? mat : oscuro);
      esfera.scale.set(s * .95, s * .9, s * 1.3);
      esfera.position.set(Math.sin(t) * .95, s * .85, (1 - Math.cos(t)) * .5 - .25);
      esfera.rotation.y = -t; g.add(esfera);
    }
    g.rotation.y = .4;
    return g;
  }

  function budin() {
    const g = new THREE.Group();
    const miga = new THREE.Mesh(new THREE.BoxGeometry(1.5, .78, .68), std(0xefcf5c, .85)); miga.position.y = .39; g.add(miga);
    const glaseado = new THREE.Mesh(new THREE.BoxGeometry(1.54, .11, .72), std(0xfffdf5, .35)); glaseado.position.y = .82; g.add(glaseado);
    [[-.55, .78, .37], [-.1, .74, .37], [.45, .76, .37]].forEach(([x, y, z]) => {
      const goteo = new THREE.Mesh(new THREE.CylinderGeometry(.07, .05, .2, 12), std(0xfffdf5, .35)); goteo.position.set(x, y, z); g.add(goteo);
    });
    for (let i = 0; i < 16; i++) {
      const sem = new THREE.Mesh(new THREE.SphereGeometry(.022, 8, 6), std(0x1b1b1b, .6));
      sem.position.set((Math.random() - .5) * 1.35, .885, (Math.random() - .5) * .58); g.add(sem);
    }
    g.rotation.y = .5;
    return g;
  }

  function alfajor() {
    const g = new THREE.Group();
    const galleta = std(0xdcb27a, .8), dulce = std(0x8a4b1f, .4);
    const abajo = new THREE.Mesh(new THREE.CylinderGeometry(.72, .7, .17, 48), galleta); abajo.position.y = .085; g.add(abajo);
    const medio = new THREE.Mesh(new THREE.CylinderGeometry(.68, .68, .14, 48), dulce); medio.position.y = .24; g.add(medio);
    const arriba = new THREE.Mesh(new THREE.CylinderGeometry(.72, .72, .17, 48), galleta); arriba.position.y = .395; g.add(arriba);
    const azucar = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .012, 36), std(0xfff8ea, .9)); azucar.position.y = .485; g.add(azucar);
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * 6.28;
      const coco = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), std(0xffffff, .9));
      coco.position.set(Math.cos(a) * .7, .24 + (Math.random() - .5) * .05, Math.sin(a) * .7); g.add(coco);
    }
    g.rotation.x = .12;
    return g;
  }

  function tostado() {
    const g = new THREE.Group();
    const forma = new THREE.Shape(); forma.moveTo(0, 0); forma.lineTo(1.4, 0); forma.lineTo(0, 1.4); forma.lineTo(0, 0);
    const capas = [[0xd9a95a, .2], [0xe58f8f, .09], [0xf4c430, .09], [0xd9a95a, .2]];
    const mitad = () => {
      const m = new THREE.Group(); let z = 0;
      capas.forEach(([color, prof]) => {
        const c = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: prof, bevelEnabled: false }), std(color, .75));
        c.position.z = z; z += prof; m.add(c);
      });
      m.rotation.x = -Math.PI / 2;
      return m;
    };
    const hueco = .12;
    const a = mitad();
    const b = new THREE.Group(); b.add(mitad()); b.rotation.y = Math.PI; b.position.set(1.4 + hueco, 0, -1.4 - hueco);
    const par = new THREE.Group(); par.add(a); par.add(b);
    par.position.set(-(.7 + hueco / 2), 0, .7 + hueco / 2);
    g.add(par); g.rotation.y = .5;
    return g;
  }

  const constructores = {
    espresso: () => taza({ r: .42, h: .6, arte: "espresso" }),
    cortado: () => vaso({ r: .38, h: .74, capas: [{ color: 0x3a1d0b, f: .55 }, { color: 0xd9bf94, f: .3, op: .96 }] }),
    flatwhite: () => taza({ r: .62, h: .72, arte: "flat" }),
    v60,
    coldbrew: () => vaso({ r: .5, h: 1.5, capas: [{ color: 0x3a1d0b, f: .86, op: .97 }], hielos: 4, sorbete: true }),
    tonic: () => vaso({ r: .5, h: 1.45, capas: [{ color: 0xd6a94a, f: .72, op: .92 }, { color: 0x2f180a, f: .12, op: .98 }], hielos: 3, limon: true, sorbete: true }),
    icedlatte: () => vaso({ r: .5, h: 1.5, capas: [{ color: 0x6b3f1e, f: .22, op: .97 }, { color: 0xd2ab7c, f: .64, op: .96 }], hielos: 4, sorbete: true }),
    medialuna, budin, alfajor, tostado
  };

  const sombraTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d"); const g = x.createRadialGradient(64, 64, 6, 64, 64, 62);
    g.addColorStop(0, "rgba(13,31,22,.38)"); g.addColorStop(1, "rgba(13,31,22,0)");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();

  const cache = {};
  function modelo(clave) {
    if (cache[clave]) return cache[clave];
    const interior = constructores[clave]();
    const caja = new THREE.Box3().setFromObject(interior);
    const tam = caja.getSize(new THREE.Vector3());
    const k = 2.3 / Math.max(tam.x, tam.y, tam.z);
    const centroY = (caja.min.y + caja.max.y) / 2;
    interior.position.y -= centroY;
    const raiz = new THREE.Group(); raiz.add(interior); raiz.scale.setScalar(k);
    const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.y = (caja.min.y - centroY) * k - .01;
    sombra.scale.setScalar(Math.max(tam.x, tam.z) * k * 1.25);
    const todo = new THREE.Group(); todo.add(raiz); todo.add(sombra);
    cache[clave] = { rotar: raiz, todo, sombra };
    return cache[clave];
  }

  // ---------- Dibujo en los canvas ----------
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const piezas = new Set();
  const visibles = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { e.target._p.visible = e.isIntersecting; if (e.isIntersecting) e.target._p.sucio = true; }), { rootMargin: "100px" }) : null;

  function dibujar(p) {
    const m = modelo(p.clave);
    m.rotar.rotation.y = p.rot;
    escena.add(m.todo);
    renderer.render(escena, camara);
    escena.remove(m.todo);
    p.ctx.clearRect(0, 0, TAM, TAM);
    p.ctx.drawImage(renderer.domElement, 0, 0);
  }

  let ultimo = performance.now();
  function marcha(t) {
    const dt = Math.min((t - ultimo) / 1000, .1); ultimo = t;
    piezas.forEach(p => {
      if (!p.canvas.isConnected) { piezas.delete(p); visibles && visibles.unobserve(p.canvas); return; }
      if (!p.visible && visibles) return;
      if (!reducir) { p.rot += p.vel * dt; dibujar(p); }
      else if (p.sucio) { dibujar(p); p.sucio = false; }
    });
    requestAnimationFrame(marcha);
  }

  window.Botica3D = {
    disponible: true,
    montar(raiz) {
      raiz.querySelectorAll("canvas.f-3d").forEach((canvas, i) => {
        const p = { canvas, ctx: canvas.getContext("2d"), clave: canvas.dataset.ic, rot: .6 + i * .9, vel: .85, visible: !visibles, sucio: true };
        canvas._p = p; piezas.add(p);
        visibles && visibles.observe(canvas);
        const fila = canvas.closest(".formula");
        if (fila) {
          fila.addEventListener("mouseenter", () => { p.vel = 3.4; });
          fila.addEventListener("mouseleave", () => { p.vel = .85; });
        }
      });
    }
  };
  requestAnimationFrame(marcha);
})();
