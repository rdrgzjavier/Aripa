# Plan de medición de Aripa

Este documento define la medición de `aripa.es`. Es la referencia antes de modificar GTM, GA4 o el `dataLayer`.

## Principios

- Klaro y Consent Mode controlan toda medición no esencial. No se carga GA4 ni Clarity hasta que exista consentimiento analítico.
- No enviar a `dataLayer`, GA4 o Clarity nombre, email, teléfono, URL introducida, texto libre ni ningún otro dato personal.
- Medir decisiones e interacción, no personas. Los parámetros describen pantalla, tipo de página, ubicación y categoría de acción.
- `generate_lead` representa únicamente una solicitud confirmada. Nunca un clic, un inicio de formulario ni un intento fallido.

## Eventos activos

| Evento | Cuándo se envía | Parámetros permitidos | Uso |
| --- | --- | --- | --- |
| `page_view` | Carga estándar de GA4 | estándar GA4 | Audiencia y páginas |
| `aripa_page_view` | Carga de página | `page_type`, `page_slug`, `content_group`, `device_type` | Clasificación editorial y comercial |
| `cta_click` | Clic en CTA o navegación significativa | `cta_text`, `cta_location`, `cta_destination`, `cta_type` | Rendimiento de CTAs |
| `form_start` | Primer foco en el formulario | `form_id`, `form_name`, `form_location` | Inicio de intención |
| `form_submit_attempt` | Envío del formulario | `form_id`, `form_name`, `form_location`, `service_interest` | Fricción y errores |
| `generate_lead` | Confirmación visible de solicitud recibida | `form_name`, `lead_type` | Conversión principal |
| `scroll_depth` | Umbrales configurados en GTM | umbral GTM | Profundidad de lectura |
| `engagement_time` | 30, 60 y 120 segundos activos de página | `engagement_seconds` | Atención básica |
| `section_view` | Entrada de una sección observable | parámetros existentes de `sectionTracking.js` | Exposición de módulos |
| `section_engagement` | Interacción/tiempo de sección | parámetros existentes de `sectionTracking.js` | Interés relativo |
| `article_progress` | 50 % y 90 % del cuerpo de un artículo | `article_progress` | Lectura editorial |
| `schedule_intent` | CTA con reserva activa | `cta_text`, `cta_location`, `calendar_link` | Mantener inactivo hasta que exista reserva |

## Configuración en GTM

La etiqueta base usa `G-8METZ78PVG` y se activa solo después del consentimiento concedido.

Etiquetas de evento ya existentes: `cta_click`, `generate_lead`, `schedule_intent`, `scroll_depth`, `section_view` y `section_engagement`.

`aripa_page_view`, `form_start`, `form_submit_attempt`, `engagement_time` y `article_progress` se envían desde `assets/js/aripa-analytics.js` mediante la etiqueta de Google ya configurada. El script conserva además el evento equivalente en `dataLayer`, por lo que GTM Preview permite revisarlo. Esta vía respeta el estado de consentimiento que aplica Klaro/Consent Mode y no añade etiquetas ni carga librerías duplicadas.

Si en el futuro se decide centralizar también estos eventos en GTM, sustituir el envío directo, nunca duplicarlo, por una única etiqueta de evento GA4 llamada `GA4 - diagnostic_events` y un único activador de evento personalizado llamado `EV - diagnostic_events`:

- Nombre del evento de la etiqueta: `{{Event}}`.
- Patrón del activador: `^(aripa_page_view|form_start|form_submit_attempt|engagement_time|article_progress)$`.
- Parámetros de evento: variables de capa de datos solo para los parámetros de la tabla anterior.
- No activar en `cta_click`, `generate_lead`, `scroll_depth`, `section_view`, `section_engagement` ni `schedule_intent`, porque ya tienen etiqueta propia.

Variables de capa de datos que deben existir cuando se necesiten: `page_type`, `page_slug`, `content_group`, `device_type`, `form_id`, `form_name`, `form_location`, `service_interest`, `engagement_seconds` y `article_progress`.

## GA4

- Marcar `generate_lead` como evento clave cuando aparezca por primera vez en Eventos recientes. No marcar `form_start`, `form_submit_attempt`, CTAs ni profundidad de scroll como conversión.
- Registrar como dimensiones personalizadas de ámbito evento: `page_type`, `content_group`, `cta_location`, `cta_type`, `form_location`, `service_interest`, `article_progress` y `device_type`.
- No crear dimensiones para URL introducida, texto de contexto ni datos de contacto.

## QA antes de publicar cambios

1. Rechazar cookies y comprobar que no se envían eventos a GA4 ni Clarity.
2. Aceptar cookies y revisar Preview de GTM y DebugView.
3. Validar un CTA, un inicio de formulario, un intento fallido y una solicitud exitosa usando datos de prueba no personales.
4. En un artículo, comprobar una única emisión al 50 % y al 90 %.
5. Revisar que no se envían PII en los parámetros.

## Lectura semanal

Con poco tráfico, analizar tendencias mensuales y no decisiones diarias. Prioridad: páginas de entrada orgánica, CTAs por ubicación, paso `form_start` a `generate_lead`, lectura al 90 % de Insights y sesiones con fricción en Clarity.
