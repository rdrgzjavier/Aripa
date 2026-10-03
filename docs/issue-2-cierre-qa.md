# Cierre técnico del issue #2

Revisión del 3 de octubre de 2026 sobre el estado de `main` y los ajustes finales de coherencia. Este documento registra lo verificado; no sustituye una auditoría de la propiedad de GA4, del contenedor de GTM ni una certificación WCAG.

## Checklist

| Requisito | Estado | Evidencia y límite |
| --- | --- | --- |
| USP y H1 de Home | Completado | H1 «Detectamos por qué tu negocio no convierte»; subtítulo de datos, experiencia y comportamiento. |
| Hero y Header | Completado | Cabecera transparente integrada con el Hero; transición a fondo oscuro al hacer scroll y retorno al subir en las nueve URLs con Hero probadas. |
| Navegación | Completado | Menú desktop desde 960 px, móvil por debajo; logo, footer, enlaces y CTA comprobados. |
| Formulario y funnel | Completado | Cinco campos obligatorios y teléfono opcional; validación nativa de email/URL; estados de error, reintento y éxito; sin reserva automática. La entrega real de correo/CRM queda fuera de la prueba aislada. |
| FAQ y principios | Completado | Objeciones comerciales, respuesta visible coherente con FAQPage y principios de intervención proporcionada. |
| Claims | Completado | Revisados los términos absolutos del issue. Dos textos antiguos del modal de Home y el footer se corrigieron en este cierre. |
| Casos y SHIFTA | Parcial | Caso publicado con alcance verificable y enlaces. El site auditado aún no está publicado: no existen resultados posteriores ni capturas publicables. |
| Servicios | Parcial | Cuatro formas de trabajo visibles con problema, alcance y entregables. Duraciones y condiciones comerciales quedan para la propuesta inferior; no se publican precios sin base. |
| Insights | Completado | Clústeres y contenidos de decisión comercial disponibles; SEO como término principal y GEO en artículos específicos. |
| Diferenciación visual | Completado para esta fase | Home y Método usan recursos editoriales y de diagnóstico. Las tarjetas restantes de Insights sirven al listado navegable; no justifican otro rediseño. |
| Responsive y accesibilidad funcional | Parcial | Se probaron seis páginas a 375, 768, 1024 y 1440 px sin overflow ni texto cortado. Teclado, foco, estructura H1, etiquetas y CTA comprobados. No se afirma conformidad WCAG completa. |
| Analytics y consentimiento | Parcial | La carga de GTM, GA4 y Clarity se observó solo tras aceptar Klaro. Las pruebas aisladas cubren denegación, aceptación, revocación, formulario y no envío de PII al dataLayer. Hay que confirmar en GTM/GA4 los eventos `scroll_depth` y `article_progress` exactos y la recepción de leads reales. |
| Métricas y visuales del site SHIFTA previo a publicación | No aplicable | No publicar pantallas ni atribuir impacto antes del lanzamiento y de contar con datos autorizados. |

## QA ejecutada

- 21 HTML, 40 bloques JSON-LD, 17 URLs en sitemap, sin errores de rutas, anclas, canonical ni H1 en la comprobación estática.
- Seis páginas principales a 375, 768, 1024 y 1440 px: sin overflow horizontal, controles cortados ni excepciones JavaScript; navegación y footer presentes.
- Nueve páginas con Hero: cabecera transparente arriba, compacta/oscura al desplazarse y transparente al volver.
- 21 rutas y cuatro anchuras: etiquetas de CTA en una línea; foco de teclado visible y foco programático del panel sin anillo decorativo.
- Formulario: obligatorios, email y URL inválidos, móvil, error de envío, reintento y éxito verificados con servicios externos simulados. El CTA de SHIFTA abre el formulario de Home.
- FAQ visible y JSON-LD coinciden en Home y Servicios.
- Producción: sin consentimiento no se solicitaron scripts de GTM/Clarity; tras aceptar se observaron GTM, Clarity y llamadas a GA4. El scroll generó `gtm.scrollDepth`. No se observó `article_progress` ni un evento de dataLayer llamado literalmente `scroll_depth` en la sesión probada.

## Ajustes realizados en el cierre

- Aripa pasa a ser el sujeto de los trabajos, la auditoría SHIFTA, las respuestas y las propuestas. Javier permanece como responsable/autor en el contexto de «quién está detrás», autorías y datos legales.
- El footer deja de destacar GEO y aumenta el contraste de su texto pequeño.
- Se retiraron promesas absolutas de un modal antiguo de CRO/UX y se sincronizaron fechas visibles de artículos con `dateModified`.
- La URL SHIFTA se clasifica como `case_study` en `aripa_page_view`.
- Aceptar Klaro y abrir el menú ya no producen un `cta_click` falso.

## Propuesta de productización para revisar, sin implementar

Las duraciones son hipótesis de planificación para **un activo y un recorrido acotados**, no compromisos publicados. Se ajustarán tras revisar accesos, calidad de datos y capacidad de implementación.

| Oferta | Problema y cliente adecuado | Requisitos mínimos | Alcance y entregables | Duración orientativa | No incluye | CTA | Capacidades y precio |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Diagnóstico de conversión | Tráfico o actividad sin claridad sobre dónde se pierden oportunidades; equipo capaz de actuar después. También cabe una revisión previa a lanzamiento, separando hipótesis de datos reales. | URL o prototipo accesible, objetivo de negocio, contexto de captación y acceso a medición si existe. | Un recorrido prioritario, propuesta, fricciones y datos disponibles; mapa de problemas, hipótesis ordenadas y hoja de ruta. | 2–3 semanas según acceso y número de pantallas. | Rediseño integral, implementación, A/B test o promesa de aumento de conversión. | Consultar alcance. | CRO con UX y analítica; sin precio público hasta estabilizar el alcance. |
| Optimización de landing | Una página de campaña o captación con dudas, abandono o bajo rendimiento; negocio que pueda modificarla. | Landing y objetivo definidos, acceso para editar, forma de medir la acción principal. | Mensaje, jerarquía, confianza, formulario y propuesta de cambios; implementación acordada y plan de evaluación. | 2–4 semanas para una página, más observación si se requiere. | Gestión de paid media, desarrollo de un site completo o test A/B sin volumen suficiente. | Consultar alcance. | UX/CRO y analítica; rango público solo cuando haya proyectos comparables. |
| Auditoría de medición | Decisiones bloqueadas por eventos ausentes, duplicados o poco fiables; responsable con acceso técnico. | Acceso a GA4, GTM y configuración de consentimiento; definición de lead u otra acción clave. | Inventario de eventos y conversiones, QA de disparos/consentimiento, brechas y plan priorizado de corrección. | 1–2 semanas para una propiedad y un recorrido acotado. | Migración completa, implementación de todos los cambios ni mantenimiento continuo. | Consultar alcance. | Analítica; sin precio público hasta delimitar número de propiedades y complejidad. |
| Sprint de optimización | Una hipótesis prioritaria que ya puede ejecutarse; negocio con capacidad de publicar cambios. | Objetivo y evento fiables, responsable de implementación, acceso al activo y actividad para evaluar. | Una intervención acordada, QA, lectura de señales y recomendación del siguiente paso. | 3–5 semanas de trabajo; ventana de lectura variable según volumen. | Retainer indefinido, varias líneas simultáneas, A/B test por defecto ni garantía de resultado. | Consultar alcance. | CRO, UX, Growth y experimentación solo cuando proceda; presupuesto tras definir intervención. |

No recomendaría mostrar un precio «desde» todavía: el alcance y los accesos cambian demasiado entre proyectos. Primero conviene registrar tiempo real, revisiones y entregables de varios trabajos comparables. Ninguna oferta debe presentarse como paquete Starter/Growth/Enterprise.

## Siguiente fase: aprendizaje

1. En GA4, validar que `generate_lead` se registra solo tras respuesta correcta y usarlo como evento clave. Comparar página de entrada, dispositivo, fuente y ubicación del CTA; construir el recorrido visita → CTA → `form_start` → `form_submit_attempt` → `generate_lead`. Completarlo con calidad comercial del lead fuera de GA4, sin introducir datos personales en el dataLayer.
2. Revisar abandono entre inicio e intento/envío del formulario y diferencias entre Home, Servicios, Caso e Insights. Interpretar porcentajes junto al volumen absoluto y al consentimiento.
3. En Clarity, observar mapas de clic y scroll por página y dispositivo; revisar sesiones filtradas por clics muertos, repetidos, errores JavaScript y abandono del formulario. Tratar cada grabación como pista para formular hipótesis, no como prueba causal.
4. Auditar la configuración de GTM antes de modificar `scroll_depth` o `article_progress`; un evento adicional podría duplicar medición existente. Revisar también el uso real de `schedule_intent`, que permanece preparado pero no tiene un CTA de reserva automática.

Fuentes de método: [eventos recomendados de GA4](https://support.google.com/analytics/answer/9267735?hl=en), [exploración de embudos](https://support.google.com/analytics/answer/9327974?hl=en), [exploración de rutas](https://support.google.com/analytics/answer/9317498?hl=en), [mapas de Clarity](https://learn.microsoft.com/en-us/clarity/heatmaps/heatmaps-overview) y [filtros de Clarity](https://learn.microsoft.com/en-us/clarity/filters/clarity-filters).

## No tocar sin hipótesis

No rehacer paleta, Inter, gradientes, Header/Hero, navegación, composición editorial del Método, estructura de Casos ni arquitectura de Insights. Las siguientes intervenciones estructurales deberían responder a señales observadas y tener una métrica o criterio de aprendizaje definido.
