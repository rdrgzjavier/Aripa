# aripa — Deploy en Cloudflare Pages

## Estructura del proyecto

```
aripa-cloudflare/
├── index.html          ← La página (= newsource.html renombrada)
├── style.css           ← CSS compilado (también generado por el build)
├── input.css           ← Entrada de Tailwind para el compilador
├── tailwind.config.js  ← Configuración de Tailwind v3
├── package.json        ← Scripts de build y dependencias
├── _headers            ← Headers de seguridad y caché (Cloudflare)
├── _redirects          ← Reglas de redirección (Cloudflare)
├── assets/
│   └── aripa-logo.png  ← ⚠️  AÑADIR MANUALMENTE antes de desplegar
└── README.md
```

> **⚠️ Antes de desplegar**: copia el archivo `aripa-logo.png` dentro de `assets/`.
> La página lo referencia en `./assets/aripa-logo.png`.

---

## Pasos para desplegar en Cloudflare Pages

### 1. Subir la carpeta a GitHub
Crea un repositorio nuevo (p. ej. `aripa-web`) y sube el contenido de esta carpeta:
```bash
git init
git remote add origin https://github.com/TU_USUARIO/aripa-web.git
git add .
git commit -m "chore: deploy inicial aripa en Cloudflare Pages"
git push -u origin main
```

### 2. Conectar con Cloudflare Pages
1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Selecciona **Pages** → **Connect to Git**
3. Elige el repositorio `aripa-web`
4. Configura el build:

| Campo | Valor |
|---|---|
| Framework preset | **None** |
| Build command | `npm run build` |
| Build output directory | `/` (raíz) |
| Root directory | `/` (raíz) |
| Node.js version | **18.x** |

5. Haz clic en **Save and Deploy**

Cloudflare instalará dependencias, compilará Tailwind y desplegará automáticamente.

### 3. Conectar tu dominio personalizado
1. Dentro del proyecto en Cloudflare Pages → **Custom domains**
2. Añade `aripa.es` y sigue el asistente para actualizar los DNS

---

## Flujo de trabajo una vez desplegado

Cada vez que hagas cambios:
```bash
git add .
git commit -m "feat: descripción del cambio"
git push
```
Cloudflare detectará el push, ejecutará `npm run build` y redesployará en menos de 30 segundos.

---

## Desarrollo local

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Compilar CSS y ver cambios en tiempo real
npm run dev
```
Luego abre `index.html` directamente en el navegador.

---

## Assets pendientes de añadir

| Archivo | Ruta esperada | Uso |
|---|---|---|
| `aripa-logo.png` | `assets/aripa-logo.png` | Logo en header, drawer y footer |
| `og-image.jpg` | `og-image.jpg` (raíz) | Imagen Open Graph para redes sociales |
