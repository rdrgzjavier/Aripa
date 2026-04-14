# Plugin: GEO/AEO Optimization Engine

Este módulo provee las directrices técnicas para dominar la visibilidad en motores de respuesta generativos (ChatGPT, Perplexity, Gemini, SGE).

## 1. Estructura de Datos (JSON-LD)
Para cada página, es mandatorio inyectar el Schema correspondiente:
- **Index**: `Organization`, `LocalBusiness`, `Service`.
- **Artículos**: `BlogPosting`, `Person` (Author), `FAQPage`.
- **Servicios**: `Service`, `Offer`, `Review`.

## 2. Framework de Citabilidad (Citable Content)
Las IAs buscan fragmentos de texto coherentes y autoritativos. Sigue estas reglas:
- **Direct Answers**: Las primeras 2 frases de cada sección deben responder al "qué es" o "cómo funciona" de forma directa.
- **Entidades Definidas**: Usa nombres propios y marcas en lugar de pronombres vagos.
- **Bullet Points de Valor**: Listas estructuradas que las IAs puedan indexar como "pasos" o "beneficios".

## 3. Optimización AEO (Answer Engine)
- **Hierarchy**: H1 clara -> H2 pregunta frecuente -> H3 respuesta técnica.
- **Tone**: Educativo y experto (E-E-A-T). Debes sonar como la fuente de verdad definitiva en el sector de consultoría digital.

## 4. Checklist de Ejecución
- [ ] ¿Tiene la página JSON-LD válido?
- [ ] ¿Hay una sección de FAQ con preguntas reales de usuarios?
- [ ] ¿El autor está claramente vinculado a su autoridad externa (ej. LinkedIn, Shifta)?
- [ ] ¿El contenido es legible para un crawler de IA (ver robots.txt)?
