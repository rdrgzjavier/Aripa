# Sistema visual de Aripa

Referencia práctica derivada de la Home y Servicios. Las páginas nuevas reutilizan las reglas compartidas de `assets/css/site-shell.css` y las utilidades de `style.css`; no deben definir una escala de títulos o una paleta distinta en cada HTML.

## Tipografía

- Familia: Inter autohospedada desde `assets/fonts/`, declarada una sola vez en `site-shell.css` para toda la web.
- Archivos disponibles: 400, 500 y 600. Los pesos 700 y 800 de los títulos se sintetizan a partir del 600 hasta disponer de archivos reales para esos pesos.
- H1 de Hero: unos 43 px en móvil y 72 px en escritorio; peso 800 e interlineado cercano a 1.05. Home alinea el titular a la izquierda para acompañar el mapa de diagnóstico; Servicios, Casos y Sobre Aripa conservan su alineación propia.
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

Los héroes usan azules y morados superpuestos con un grano sutil. En páginas con Hero, el encabezado es transparente arriba para mostrar ese mismo fondo y pasa a vidrio oscuro con desenfoque al desplazarse; las páginas sin Hero conservan el encabezado azul. La animación compartida del degradado se detiene fuera de pantalla, al ocultar la pestaña y cuando la persona prefiere menos movimiento. Las tarjetas son blancas, tienen radio de 16 px, borde morado tenue y una elevación discreta al pasar el cursor. El CTA principal usa el degradado morado de los botones del formulario; sobre fondo oscuro se conserva el botón lavanda. Las transiciones respetan `prefers-reduced-motion`.

## Composición

- Ancho máximo: 1440 px. Márgenes internos: 24 px en móvil y 48 px en escritorio.
- Separación vertical de secciones informativas: 64 px en móvil y 80 px en escritorio; los héroes ocupan la mayor parte de la primera pantalla.
- El menú y el pie se comparten en todo el sitio. En móvil el menú se pliega y mantiene el mismo orden de enlaces.
- Casos y Sobre Aripa usan `.aripa-subpage` para compartir la escala, el héroe y las tarjetas. Las páginas futuras deberían reutilizar estos estilos o los módulos existentes de Home y Servicios.

## Gramática editorial del issue #2

`assets/css/issue2-editorial.css` reúne los módulos nuevos. Se conservan Inter, azul, morado, fondo cálido, degradados y movimiento existente. El Hero de Home compone titular y mapa metodológico en proporción aproximada 60/40; los problemas se leen como recorrido, el método como secuencia numerada y las ofertas e Insights como filas editoriales. La composición pasa a una columna en móvil sin desbordamiento horizontal.

Los esquemas son explicaciones del método, no capturas de resultados. No se publican dashboards, porcentajes, logotipos de supuestos clientes ni capturas de trabajo de terceros sin fuente y permiso. Antes de añadir un caso, seguir `docs/plantilla-caso.md`.

La comprobación automática de tamaños, fuentes y alineación está en `tests/design-regression.cjs`; el estado inicial y el cambio del encabezado en `tests/header-regression.cjs`; la revisión visual y responsive en `tests/ui-regression.cjs`.
