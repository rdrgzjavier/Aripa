# Aripa

Sitio estático de [aripa.es](https://aripa.es), publicado con Cloudflare Pages. La fuente de verdad es este repositorio. `style.css` se genera desde `input.css` con Tailwind.

## Vista local

```sh
npm ci
npm run build
npm run preview
```

La vista local queda en `http://127.0.0.1:4173`. El servidor de `scripts/preview.cjs` reproduce las redirecciones estáticas de `_redirects` y aplica la política de seguridad de `_headers` para facilitar la revisión. Para editar clases Tailwind, vuelve a ejecutar `npm run build`.

## Páginas principales

- `/`: narrativa comercial y formulario de contacto.
- `/servicios`: CRO, UX/UI, analítica y Growth.
- `/casos/`: experiencia y estructura para futuros casos documentados.
- `/recursos`: Insights, organizados en cuatro temas.
- `/sobre-aripa`: Javier Rodríguez de la Orden y el enfoque de Aripa.

Cada página está escrita en HTML. `assets/css/site-shell.css` y `assets/js/site-shell.js` aportan la tipografía, la navegación y el formulario compartidos. La escala y los criterios para nuevas páginas se documentan en `docs/sistema-visual.md`. `assets/js/aripa-analytics.js` registra eventos, `assets/js/consent-analytics.js` conecta Klaro con GTM y Clarity, y `analytics/sectionTracking.js` mide las secciones. La medición comienza denegada; el contenedor GTM y Clarity se cargan según el consentimiento. El formulario de contacto envía a Formspree y muestra el éxito únicamente cuando la respuesta de envío es correcta. La página `/captacion` es una suscripción independiente a MailerLite.

## Comprobaciones de la Fase 1

```sh
npm run build
python tests/static-check.py
node tests/analytics-regression.cjs
node tests/ui-regression.cjs
node tests/design-regression.cjs
```

Las pruebas de navegador necesitan Playwright y un navegador Edge instalado. Se pueden indicar `PLAYWRIGHT_MODULE` y `PLAYWRIGHT_CHANNEL=msedge` si no están en el `PATH`. La prueba de UI requiere la vista local en ejecución. Las peticiones externas se interceptan en las pruebas de formularios y consentimiento, de modo que no se envían solicitudes reales. `tests/static-check.py` valida enlaces internos, imágenes, JSON-LD, metadata y sitemap.

## Casos reales

`docs/plantilla-caso.md` recoge los datos y permisos necesarios antes de publicar un caso. Por ahora la página pública explica la experiencia disponible y la estructura editorial; no hay resultados ni métricas de clientes publicados sin evidencia.
