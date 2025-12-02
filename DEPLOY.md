# Impostor — Juego PWA

Un juego divertido para adivinar quién es el impostor. ¡Juega con amigos en el móvil!

## Instalación rápida para tus amigos

### Android (Chrome)
1. Abre este enlace en tu móvil: **[TU_URL_AQUI]**
2. Chrome mostrará un botón "Instalar" o puedes tocar ⋮ (menú) → "Añadir a la pantalla de inicio"
3. ¡Listo! El icono aparecerá en tu pantalla principal. ¡A jugar!

### iPhone/iPad (Safari)
1. Abre este enlace en Safari: **[TU_URL_AQUI]**
2. Toca el botón compartir (cuadro con flecha ⬆)
3. Elige "Añadir a la pantalla de inicio"
4. ¡Listo! Abre el icono desde la pantalla principal.

---

## Para desarrolladores / Para probar localmente

### Requisitos
- Node.js v18+ y npm instalados

### Build
```bash
npm install
npm run build
```
La carpeta `dist/` contiene la app lista para desplegar.

### Probar localmente
```bash
npm install -g serve
serve -s dist -l 5000
```
Abre `http://localhost:5000` en tu navegador. En el móvil (misma Wi-Fi): `http://<tu-ip>:5000`.

### Desplegar (Gratuito)

#### Opción 1: Netlify (recomendado, muy simple)
1. Crea cuenta en [netlify.com](https://www.netlify.com)
2. Arrastra la carpeta `dist/` al panel de Netlify
3. ¡Listo! Te dará una URL pública (ej. https://tu-app.netlify.app)

#### Opción 2: GitHub Pages
1. Sube el repo a GitHub
2. Ve a Settings → Pages → Build and deployment
3. Selecciona "Deploy from a branch" → rama `main` / carpeta `/` (si pusiste `dist` en raíz)
4. ¡Listo! URL será: `https://tu-usuario.github.io/nombre-repo`

#### Opción 3: Cloudflare Pages
1. Crea cuenta en [pages.cloudflare.com](https://pages.cloudflare.com)
2. Conecta tu repo de GitHub
3. Build command: `npm run build`
4. Publish directory: `dist`
5. ¡Listo!

### Compartir con amigos
Una vez desplegado, comparte la URL pública y pídeles que sigan los pasos de "Instalación rápida" arriba.

---

## Características

- 📱 Instalable como app en Android/iOS
- 🎮 Funciona offline (gracias al service worker)
- ⚡ Rápida y ligera (< 200KB)
- 🎨 Diseño responsive

## Créditos

Creador: Sergio Lopez Feito — 2025

---

## Notas técnicas

- **PWA**: Progressive Web App (web app instalable)
- **Service Worker**: Cachea archivos para funcionar offline
- **Manifest**: Define nombre, iconos y comportamiento de la app
- **Vite**: Empaquetador super rápido

## Licencia

Libre para compartir y modificar.
