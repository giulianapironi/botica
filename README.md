# Botica

Landing de una cafetería de especialidad ficticia, instalada en una antigua botica de San Telmo, Buenos Aires. Proyecto conceptual hecho con HTML, CSS y JavaScript, sin pasos de build.

## Qué incluye

- **Pantalla de bienvenida:** contador de carga, un vaso 3D que entra rodando, se destapa con un clic (con vapor) y una ola de café revela la página.
- Hero con el vaso 3D, titular gigante y stickers.
- Recetario con pestañas (Café, Fríos, Pastelería) y cada bebida modelada en 3D.
- Galería de fotos, formulario de reserva (no guarda datos) y sellos.
- **Sonido sintetizado** (sin archivos de audio): chasquido de la tapa, vapor, ola, aterrizaje y clics suaves. Hay un botón para silenciar.
- Diseño adaptado a celular, tablet y escritorio.

## Estructura

```
index.html        Estructura de la página
css/estilos.css   Estilos
js/main.js        Recetario, formulario, animaciones de entrada
js/hero3d.js      Bienvenida y vaso 3D del hero (Three.js)
js/tazas3d.js     Bebidas 3D del recetario (Three.js)
js/sonido.js      Sonidos con la Web Audio API
img/              Fotografías
netlify.toml      Configuración para Netlify
```

## Accesibilidad y respaldos

- Con "reducir movimiento" activado la bienvenida se muestra en una versión suave (sin rodar ni girar).
- Si el navegador no soporta WebGL, la bienvenida se muestra en 2D y el recetario usa dibujos planos.
- Los sonidos solo suenan después de un clic o toque, y se pueden silenciar.

## Cómo verlo

Abrí `index.html` en el navegador. Hace falta conexión: las tipografías vienen de Google Fonts y la librería 3D (Three.js r128) de cdnjs.

## Publicar en Netlify

1. En Netlify: **Add new site, Import an existing project**, y elegí este repositorio.
2. Branch: `main`. Build command: vacío. Publish directory: `.`
3. Cada vez que se suban cambios a `main`, Netlify publica la nueva versión solo.

También se puede arrastrar la carpeta completa a **Add new site, Deploy manually** (hay que repetirlo en cada cambio).

## Créditos

Fotografías de [Pexels](https://www.pexels.com): [302899](https://www.pexels.com/photo/302899/), [2253643](https://www.pexels.com/photo/2253643/), [894695](https://www.pexels.com/photo/894695/), [3892469](https://www.pexels.com/photo/3892469/), [3020919](https://www.pexels.com/photo/3020919/) y [6205506](https://www.pexels.com/photo/6205506/).
