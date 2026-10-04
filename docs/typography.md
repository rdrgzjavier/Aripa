# Tipografía compartida

`assets/css/typography.css` se carga al final del head de todas las páginas. Mantiene Inter, colores, espaciados y jerarquía HTML existentes.

| Función | Móvil <768px | Tablet 768–1023px | Escritorio ≥1024px |
| --- | --- | --- | --- |
| Texto de contenido e introducciones de sección | 16px | 18px | 18px |
| Entradilla tras H1 | 18px | 20px | 20px |
| H1 | 40px | 56px | 64px |
| H2 | 32px | 36px | 40px |
| H3 | 22px | 24px | 24px |
| H4 | 20px | 20px | 20px |
| H5 | 18px | 18px | 18px |
| H6 | 16px | 16px | 16px |

Los tamaños están expresados en rem en CSS. Cada nivel comparte peso, interlineado y espaciado entre letras. Los títulos siguen su función semántica, no se cambia su nivel para ajustar su aspecto. Fechas, etiquetas, botones, navegación, formularios y consentimiento conservan sus estilos auxiliares. La frase destacada del panel del Hero mantiene su tratamiento de display.

Usar los tokens compartidos en nuevos componentes y evitar nuevas excepciones tipográficas por página. Las reglas important son una transición frente a estilos antiguos; no añadir nuevas declaraciones important en páginas individuales.

Verificación: 28 páginas a 375, 768, 1024 y 1440px; atributos calculados por nivel consistentes y sin overflow horizontal. Los cuatro párrafos señalados en Servicios, Casos e Insights coinciden en 16/18px. Regresión de navegación, formulario y teclado: 54 combinaciones página/viewport; comprobación estática sin errores.
