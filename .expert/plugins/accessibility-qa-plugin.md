# Plugin: Accessibility, QA & Performance Registry

Este módulo establece los estándares de calidad técnica y ética (accesibilidad) para el desarrollo de Aripa.

## 1. Accesibilidad (WCAG 2.1 AA)
Cada página debe ser inclusiva por diseño:
- **Semántica**: Uso de `<header>`, `<main>`, `<footer>`, `<article>` y jerarquía de encabezados `<h1>-<h6>` lógica.
- **Interactividad**: Todo elemento clickeable debe ser accesible mediante teclado (`Tab` navigation) y tener estados `:focus` visibles.
- **ARIA**: Atributos `aria-label`, `aria-hidden` y `role` donde el HTML nativo no sea suficiente.
- **Contraste**: Ratio mínimo de 4.5:1 para texto normal sobre fondo.

## 2. QA & Visual Integrity
Protocolo de revisión antes de cada entrega:
- **Fixed Elements Check**: Asegurar que los elementos `fixed` (como el header) no oculten contenido vital (espaciado mediante `spacer divs` o padding agresivo).
- **Broken Links**: Escaneo de enlaces internos (`index.html#seccion`) y externos.
- **Responsive Audit**: Verificación en breakpoints móvil (320px), tablet (768px) y desktop (1440px).
- **Design Consistency**: Alineación con el Design System (uso de variables CSS `--color-primary`, etc.).

## 3. Performance & CWV (Core Web Vitals)
- **LCP (Largest Contentful Paint)**: Optimización de imágenes Hero (WebP, dimensiones exactas, preloading).
- **CLS (Cumulative Layout Shift)**: Reserva de espacio para imágenes y fuentes mediante dimensiones `width/height` y `font-display: swap`.
- **FID/INP**: Minimización de JS bloqueante en el hilo principal.

## 4. Checklist de QA Técnico
- [ ] ¿Pasa el validador de contraste de color en todas las secciones?
- [ ] ¿El H1 es visible y está correctamente posicionado bajo el header?
- [ ] ¿Todas las imágenes tienen atributo `alt` descriptivo?
- [ ] ¿Se han eliminado fragmentos de código muerto o estilos redundantes?
- [ ] ¿Los iconos cargan correctamente sin mostrar texto fallback?
