# Design System & Component Architecture Plugin

Este plugin asegura la integridad visual y funcional en toda la arquitectura multi-página de Aripa.

## 1. Arquitectura de Componentes Globales
Cualquier cambio en los siguientes elementos debe replicarse estrictamente en `index.html`, `servicios.html` y `recursos.html`:
- **Header (Glassmorphism)**: Altura fija (16/20), fondo b-blur (80%) y sombra masiva.
- **Mobile Drawer**: Transparencia del 60%, iconos huecos (Material Symbols FILL:0) y alineación a la izquierda.
- **Footer (Deep Blue)**: Estructura de navegación secundaria, créditos y logos sociales.

## 2. Patrones de UI Dinámica
- **Visibility Logic**: La `sticky-bottom-bar` y `mobile-bottom-nav` deben activarse comparando `window.scrollY` con el `hero.offsetHeight`.
- **Scroll Reveal**: Uso de clases `.reveal-ready`, `.reveal-hidden` y `.reveal-visible` mediante un `IntersectionObserver` centralizado.
- **Cal.com Integration**: Los botones de agendamiento estratégico deben usar el atributo `data-cal-link="aripa/hoja-de-ruta"` y disparar el widget global.

## 3. Protocolo CSS de Continuidad
Para evitar la pérdida de estilos por la purga de utilidades (Tailwind JIT en archivos estáticos):
- **Gaps y Espaciados**: Usar bloques `<style>` locales con IDs de sección (e.g., `#author-module { padding: ... }`).
- **Nombres de Iconos**: Verificar siempre que los nombres correspondan a la versión "Outline" si se desea el estilo de líneas finas.

## 4. Estándar de Módulos Específicos
- **Author Module Profile**: Boxed design, foto con `mix-blend-multiply` y `grayscale(20%)`, rejilla de empresas verificadas con iconos `verified`.
