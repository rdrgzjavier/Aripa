# Sistema visual de Aripa

Referencia práctica derivada de la Home y Servicios. Las páginas nuevas reutilizan las reglas compartidas de `assets/css/site-shell.css` y las utilidades de `style.css`; no deben definir una escala de títulos o una paleta distinta en cada HTML.

## Tipografía

- Familia: Inter autohospedada desde `assets/fonts/`, declarada una sola vez en `site-shell.css` para toda la web.
- Archivos disponibles: 400, 500 y 600. Los pesos 700 y 800 de los títulos se sintetizan a partir del 600 hasta disponer de archivos reales para esos pesos.
- H1: 32–36 px en móvil y 56–60 px en escritorio; peso 800, centrado en los héroes, interlineado cercano a 1.1–1.15.
- H2: 30 px en móvil; 36 o 48 px en escritorio según jerarquía del módulo; peso 800, espaciado negativo moderado.
- H3 de tarjetas: 18–24 px según la densidad de la tarjeta; peso 700 u 800.
- Texto principal: 16–18 px; interlineado 1.6–1.75. Las etiquetas pequeñas se usan como guía visual, nunca como único nombre accesible de una sección.

## Color, superficies y efectos

| Uso | Valor existente |
|---|---|
| Azul profundo | `#061542` |
| Morado principal | `#7c3aed` |
| Morado de enlaces | `#6c45c0` |
| Fondo cálido | `#fcf9f8` |
| Texto secundario | `#45464f` |

Los héroes usan azules y morados superpuestos con un grano sutil; el encabezado aplica vidrio oscuro y desenfoque. Las tarjetas son blancas, tienen radio de 16 px, borde morado tenue y una elevación discreta al pasar el cursor. El CTA principal usa el degradado morado de los botones del formulario; sobre fondo oscuro se conserva el botón lavanda. Las transiciones respetan `prefers-reduced-motion`.

## Composición

- Ancho máximo: 1440 px. Márgenes internos: 24 px en móvil y 48 px en escritorio.
- Separación vertical de secciones informativas: 64 px en móvil y 80 px en escritorio; los héroes ocupan la mayor parte de la primera pantalla.
- El menú y el pie se comparten en todo el sitio. En móvil el menú se pliega y mantiene el mismo orden de enlaces.
- Casos y Sobre Aripa usan `.aripa-subpage` para compartir la escala, el héroe y las tarjetas. Las páginas futuras deberían reutilizar estos estilos o los módulos existentes de Home y Servicios.

La comprobación automática de tamaños, fuentes y alineación está en `tests/design-regression.cjs`; la revisión visual y responsive en `tests/ui-regression.cjs`.
