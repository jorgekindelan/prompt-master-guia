import { useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, BookOpen, Lightbulb, Code, Palette, Brain, ArrowRight, AlertTriangle, CheckCircle, Info, Database, Link as LinkIcon, Settings, Shield, Image as ImageIcon, GitBranch } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GuideDetail = () => {
  const { category, itemId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'html' | 'text'>('json');

  const guideData: Record<string, any> = {
    fundamentos: {
      icon: BookOpen,
      color: "bg-blue-500",
      title: "Fundamentos del Prompting",
      description: "Aprende los conceptos básicos y estructura de un buen prompt",
      items: {
        "que-es-prompt": {
          title: "¿Qué es un prompt?",
          content: `Un prompt es una instrucción o consulta que das a un modelo de IA para obtener una respuesta específica. Es como una conversación dirigida donde tú estableces el contexto y la dirección.

Los prompts efectivos son fundamentales para aprovechar al máximo las capacidades de la inteligencia artificial. Piensa en ellos como las instrucciones que le das a un asistente muy inteligente pero que necesita orientación específica para entender exactamente qué necesitas.

La calidad de tu prompt determina directamente la calidad de la respuesta que obtienes. Un prompt bien estructurado puede ser la diferencia entre una respuesta genérica y una solución personalizada que realmente resuelva tu problema.

**Características de un buen prompt:**

**Claridad absoluta:** Usa un lenguaje simple y directo. Evita ambigüedades y sé específico en lo que pides. La precisión en las palabras se traduce en precisión en las respuestas.

**Contexto relevante:** Proporciona información de fondo necesaria. Establece el escenario o situación específica. Define claramente el rol que debe asumir la IA para adaptar su respuesta.

**Estructura lógica:** Organiza la información de manera coherente. Usa separadores y formato claro que facilite la comprensión. Incluye ejemplos cuando sea necesario para clarificar expectativas.

**Objetivo definido:** Especifica exactamente qué quieres obtener como resultado. Define el formato de respuesta deseado (lista, párrafo, tabla, etc.). Establece límites o restricciones cuando sea apropiado.`,
          examples: [
            {
              title: "Ejemplo de prompt básico (poco efectivo)",
              content: "Escribe sobre marketing"
            },
            {
              title: "Ejemplo de prompt optimizado",
              content: "Actúa como un experto en marketing digital con 10 años de experiencia. Explica las 5 estrategias más efectivas de marketing de contenidos específicamente para pequeñas empresas en 2024, considerando presupuestos limitados y recursos humanos reducidos.\n\nFormato: Lista numerada con subsecciones\nAudiencia: Emprendedores sin experiencia previa en marketing\nLongitud: Entre 200-300 palabras por estrategia\n\nPara cada estrategia proporciona:\n• Descripción clara y práctica\n• Beneficios específicos cuantificables\n• Pasos concretos para implementar\n• Ejemplo real de aplicación\n• Herramientas gratuitas recomendadas\n• Métrica clave para medir éxito"
            }
          ]
        },
        "estructura-prompt": {
          title: "Estructura de un buen prompt",
          content: `La estructura de un prompt efectivo sigue un patrón que maximiza las posibilidades de obtener la respuesta deseada.

## Fórmula básica: ROL + TAREA + CONTEXTO + FORMATO + RESTRICCIONES

### 1. ROL (Quién)
Define el rol o persona que debe asumir la IA:
- "Actúa como un experto en..."
- "Eres un consultor especializado en..."
- "Imagina que eres un..."

### 2. TAREA (Qué)
Especifica claramente la acción a realizar:
- "Crea un plan de..."
- "Analiza los siguientes datos..."
- "Explica el concepto de..."

### 3. CONTEXTO (Dónde/Cuándo/Por qué)
Proporciona información de fondo relevante:
- Situación específica
- Audiencia objetivo
- Limitaciones o condiciones especiales

### 4. FORMATO (Cómo)
Define cómo quieres recibir la respuesta:
- Lista numerada
- Párrafos descriptivos
- Tabla comparativa
- Código con comentarios

### 5. RESTRICCIONES (Límites)
Establece parámetros específicos:
- Longitud del texto
- Tono de comunicación
- Información a incluir/excluir
- Nivel de detalle`,
          examples: [
            {
              title: "Ejemplo de estructura completa",
              content: `ROL: Actúa como un nutricionista especializado en alimentación deportiva

TAREA: Crea un plan de alimentación semanal

CONTEXTO: Para un corredor de maratón de 35 años que entrena 6 días a la semana y pesa 70kg. Tiene intolerancia al gluten y busca mejorar su rendimiento.

FORMATO: Tabla semanal con desayuno, almuerzo, cena y 2 snacks. Incluye cantidades aproximadas y valor nutricional.

RESTRICCIONES: 
- Máximo 2500 palabras
- Sin gluten
- Enfoque en carbohidratos complejos
- Incluir timing de comidas respecto al entrenamiento`
            }
          ]
        },
        "tipos-prompting": {
          title: "Tipos de prompting",
          content: `Existen diferentes enfoques para crear prompts, cada uno con sus ventajas específicas según el objetivo que busques.

## 1. Prompting Directo

### Características:
- Instrucciones claras y específicas
- Sin ambigüedades
- Resultados predecibles

### Cuándo usar:
- Cuando necesitas una respuesta específica
- Para tareas técnicas o procedimentales
- Cuando tienes tiempo limitado

## 2. Prompting Indirecto

### Características:
- Usa preguntas para guiar al modelo
- Permite más creatividad en las respuestas
- Fomenta el razonamiento

### Cuándo usar:
- Para brainstorming
- Cuando buscas múltiples perspectivas
- Para análisis complejos

## 3. Prompting Conversacional

### Características:
- Imita una conversación natural
- Permite iteración y refinamiento
- Construye sobre respuestas anteriores

### Cuándo usar:
- Para sesiones de trabajo largas
- Cuando necesitas explorar temas en profundidad
- Para desarrollo de ideas complejas

## 4. Prompting Estructurado

### Características:
- Usa formatos específicos
- Organiza la información claramente
- Facilita el seguimiento de instrucciones

### Cuándo usar:
- Para reportes y documentos formales
- Cuando necesitas consistencia
- Para tareas repetitivas`,
          examples: [
            {
              title: "Directo",
              content: "Resume este artículo en 3 puntos clave, usando máximo 50 palabras por punto."
            },
            {
              title: "Indirecto",
              content: "¿Cuáles crees que son los aspectos más importantes que un lector debería recordar de este artículo? ¿Por qué estos puntos son más relevantes que otros?"
            },
            {
              title: "Conversacional",
              content: "He leído este artículo sobre inteligencia artificial. Me interesa especialmente la parte sobre ética. ¿Podrías ayudarme a entender mejor ese tema?"
            },
            {
              title: "Estructurado",
              content: `Analiza este artículo usando el siguiente formato:

TEMA PRINCIPAL: [una oración]
PUNTOS CLAVE: [3 bullets]
AUDIENCIA OBJETIVO: [descripción]
CONCLUSIÓN: [una oración]
RELEVANCIA: [1-10 con justificación]`
            }
          ]
        }
      }
    },
    tecnicas: {
      icon: Brain,
      color: "bg-purple-500", 
      title: "Técnicas Avanzadas",
      description: "Domina técnicas profesionales como Chain-of-Thought y Few-shot",
      items: {
        "few-shot": {
          title: "Few-shot Prompting",
          content: `El Few-shot prompting es una técnica donde proporcionas ejemplos específicos para guiar el comportamiento del modelo hacia el tipo de respuesta que deseas.

## ¿Cómo funciona?

El modelo aprende del patrón que estableces en los ejemplos y replica ese formato, estilo y enfoque en su respuesta.

## Estructura básica:

1. **Instrucción general**
2. **Ejemplos (2-5 típicamente)**
3. **Nueva entrada para procesar**

## Ventajas:

- **Consistencia**: Obtienes resultados más predecibles
- **Calidad**: Mejora significativamente la relevancia
- **Control**: Puedes moldear el estilo y formato exacto
- **Eficiencia**: Reduces la necesidad de correcciones

## Casos de uso ideales:

- Clasificación de textos
- Extracción de información estructurada
- Generación de contenido con formato específico
- Análisis de sentimientos
- Traducciones con contexto particular`,
          examples: [
            {
              title: "Clasificación de sentimientos",
              content: `Clasifica el sentimiento de estos comentarios como Positivo, Negativo o Neutral:

Comentario: "Me encanta este producto, superó mis expectativas"
Sentimiento: Positivo

Comentario: "No funcionó como esperaba, muy decepcionante"
Sentimiento: Negativo

Comentario: "Es un producto promedio, cumple su función"
Sentimiento: Neutral

Comentario: "¡Increíble calidad y excelente servicio al cliente!"
Sentimiento: ?`
            },
            {
              title: "Extracción de datos de currículums",
              content: `Extrae información clave de estos currículums:

Currículum: "Juan Pérez, Ingeniero de Software con 5 años de experiencia en Python y React. Trabajó en Google y Microsoft. MBA en Tecnología."

Información extraída:
- Nombre: Juan Pérez
- Profesión: Ingeniero de Software
- Experiencia: 5 años
- Tecnologías: Python, React
- Empresas: Google, Microsoft
- Educación: MBA en Tecnología

Currículum: "Ana García, diseñadora UX/UI con 3 años de experiencia. Especialista en Figma y Adobe Creative Suite. Trabajó en startups de fintech."

Información extraída: ?`
            }
          ]
        },
        "chain-of-thought": {
          title: "Chain-of-Thought (CoT)",
          content: `Chain-of-Thought es una técnica que instruye al modelo para que muestre su proceso de razonamiento paso a paso antes de llegar a una conclusión final.

## ¿Por qué es efectivo?

- **Transparencia**: Puedes ver cómo llega a las conclusiones
- **Precisión**: Reduce errores de lógica
- **Debugging**: Facilita identificar dónde falla el razonamiento
- **Confianza**: Te da más seguridad en las respuestas

## Tipos de CoT:

### 1. CoT Explícito
Pides directamente que muestre el razonamiento.

### 2. CoT por Ejemplos
Muestras ejemplos de razonamiento paso a paso.

### 3. CoT con Verificación
Incluyes pasos de validación en el proceso.

## Aplicaciones principales:

- **Matemáticas y cálculos**
- **Análisis lógico complejo** 
- **Resolución de problemas**
- **Toma de decisiones**
- **Diagnósticos**

## Palabras clave que activan CoT:

- "Paso a paso"
- "Explica tu razonamiento"
- "¿Cómo llegaste a esta conclusión?"
- "Muestra el proceso"
- "Analiza sistemáticamente"`,
          examples: [
            {
              title: "Problema matemático con CoT",
              content: `Resuelve este problema mostrando tu razonamiento paso a paso:

Una tienda vende productos con 25% de descuento. Si un producto cuesta $120 después del descuento, ¿cuál era el precio original?

Paso 1: Identificar la información conocida
- Precio con descuento: $120
- Descuento aplicado: 25%
- Precio original: desconocido (llamémoslo X)

Paso 2: Establecer la relación matemática
- Si hay 25% de descuento, el cliente paga 75% del precio original
- Entonces: 0.75 × X = $120

Paso 3: Resolver la ecuación
- X = $120 ÷ 0.75
- X = $160

Paso 4: Verificar
- Precio original: $160
- 25% de descuento: $160 × 0.25 = $40
- Precio final: $160 - $40 = $120 ✓

Respuesta: El precio original era $160.`
            },
            {
              title: "Análisis de decisión empresarial",
              content: `Analiza paso a paso si una empresa debería invertir en un nuevo software de gestión:

Paso 1: Evaluar la situación actual
- Costos operativos altos por procesos manuales
- Errores frecuentes en facturación
- Tiempo excesivo en reportes

Paso 2: Analizar beneficios del software
- Automatización reduce errores en 90%
- Ahorro de 20 horas semanales de trabajo manual
- Reportes automáticos en tiempo real

Paso 3: Calcular costos vs beneficios
- Inversión inicial: $50,000
- Ahorro anual en salarios: $30,000
- Reducción de errores: $15,000/año en costos evitados
- ROI: ($45,000 - $50,000) = recuperación en 13 meses

Paso 4: Considerar factores adicionales
- Curva de aprendizaje: 2-3 meses
- Riesgo de implementación: bajo (software establecido)
- Impacto en competitividad: alto

Conclusión: Recomiendo la inversión debido al ROI positivo y beneficios operativos significativos.`
            }
          ]
        },
        "react-prompting": {
          title: "ReAct Prompting",
          content: `ReAct (Reasoning + Acting) es una técnica avanzada que combina razonamiento y acción para resolver problemas complejos que requieren múltiples pasos y decisiones.

## Componentes de ReAct:

### 1. **Reasoning (Razonamiento)**
- Análisis de la situación actual
- Identificación de problemas
- Evaluación de opciones disponibles

### 2. **Action (Acción)**
- Pasos específicos a ejecutar
- Decisiones concretas
- Implementación de soluciones

### 3. **Observation (Observación)**
- Evaluación de resultados
- Ajustes basados en retroalimentación
- Iteración del proceso

## Ventajas del ReAct:

- **Flexibilidad**: Se adapta a problemas complejos
- **Iterativo**: Permite ajustes en tiempo real
- **Realista**: Simula la toma de decisiones humana
- **Completo**: Abarca desde análisis hasta implementación

## Aplicaciones efectivas:

- **Resolución de problemas empresariales**
- **Planificación estratégica**
- **Troubleshooting técnico**
- **Análisis de casos complejos**
- **Desarrollo de proyectos**`,
          examples: [
            {
              title: "Análisis de problema empresarial",
              content: `Analiza este problema empresarial usando la metodología ReAct:

Problema: Las ventas online han bajado 30% en los últimos 3 meses.

**REASONING (Razonamiento):**
- Posibles causas internas: cambios en el sitio web, problemas de inventario, aumento de precios
- Factores externos: nueva competencia, cambios en el mercado, estacionalidad
- Datos necesarios: tráfico web, conversión, análisis de competencia
- Hipótesis principal: problemas de experiencia de usuario en el sitio

**ACTION (Acción):**
1. Auditoría inmediata del sitio web (velocidad, usabilidad, errores)
2. Análisis comparativo de precios con competencia
3. Revisión de métricas de tráfico y conversión
4. Encuesta a clientes recientes sobre experiencia de compra
5. Análisis de reviews y feedback negativo

**OBSERVATION (Observación):**
- Velocidad del sitio: 40% más lenta que hace 6 meses
- Precios: 15% más altos que competencia principal
- Tasa de abandono de carrito: aumentó del 60% al 78%
- Feedback: quejas sobre proceso de checkout complejo

**NEXT REASONING:**
Los datos confirman problemas de experiencia de usuario y pricing. Priorizar optimización técnica y revisar estrategia de precios.

**NEXT ACTIONS:**
1. Optimización inmediata de velocidad (CDN, compresión)
2. Simplificación del proceso de checkout
3. Estrategia de precios competitivos con promociones
4. A/B testing de mejoras implementadas`
            }
          ]
        }
      }
    },
    plantillas: {
      icon: Palette,
      color: "bg-green-500",
      title: "Plantillas y Fórmulas",
      description: "Plantillas probadas para casos de uso específicos",
      items: {
        "resumir-textos": {
          title: "Plantilla para resumir textos",
          content: `Esta plantilla te permitirá crear resúmenes efectivos y estructurados para cualquier tipo de contenido.

## Estructura de la plantilla:

### 1. **Definición del objetivo**
- Longitud deseada del resumen
- Audiencia objetivo
- Propósito del resumen

### 2. **Instrucciones de formato**
- Estructura específica (puntos, párrafos, etc.)
- Nivel de detalle requerido
- Tono y estilo de comunicación

### 3. **Criterios de selección**
- Qué información priorizar
- Qué omitir o minimizar
- Cómo manejar datos técnicos

## Variaciones según el tipo de contenido:

### Para artículos académicos:
- Enfoque en metodología y conclusiones
- Preserve terminología técnica esencial
- Incluya implicaciones del estudio

### Para contenido empresarial:
- Destaque insights accionables
- Simplifique conceptos complejos
- Incluya métricas y resultados clave

### Para contenido técnico:
- Mantenga precisión técnica
- Explique conceptos para audiencia específica
- Incluya pasos o procesos importantes`,
          examples: [
            {
              title: "Plantilla básica para artículos",
              content: `Resume el siguiente texto en [NÚMERO] puntos clave, manteniendo las ideas principales y usando un lenguaje [FORMAL/INFORMAL]. 

Estructura requerida:
1. **Tema principal**: [Una oración que capture la idea central]
2. **Puntos clave**: [2-5 bullets con las ideas más importantes]
3. **Conclusión**: [Una oración con el mensaje principal o llamada a la acción]

Criterios:
- Máximo [NÚMERO] palabras por punto
- Preserve datos importantes y estadísticas
- Usa un tono [DESCRIPCIÓN DEL TONO]
- Dirigido a [AUDIENCIA OBJETIVO]

[INSERTAR TEXTO A RESUMIR AQUÍ]`
            },
            {
              title: "Plantilla para contenido técnico",
              content: `Actúa como un experto técnico que debe explicar conceptos complejos de manera accesible.

Resume este contenido técnico siguiendo esta estructura:

**¿QUÉ ES?** (1-2 oraciones simples)
**¿PARA QUÉ SIRVE?** (beneficios principales en 2-3 puntos)
**¿CÓMO FUNCIONA?** (proceso simplificado en pasos)
**CONSIDERACIONES IMPORTANTES** (limitaciones o requisitos clave)

Requisitos:
- Evita jerga técnica excesiva
- Usa analogías cuando sea útil
- Incluye ejemplos prácticos
- Máximo 200 palabras total
- Audiencia: [NIVEL TÉCNICO DE LA AUDIENCIA]

[INSERTAR CONTENIDO TÉCNICO]`
            }
          ]
        },
        "generar-codigo": {
          title: "Plantilla para generar código",
          content: `Esta plantilla está diseñada para obtener código limpio, documentado y funcional que siga las mejores prácticas del lenguaje.

## Elementos esenciales de la plantilla:

### 1. **Especificación del rol**
- Define el nivel de expertise requerido
- Especifica el lenguaje y frameworks
- Establece el contexto del proyecto

### 2. **Descripción funcional**
- Qué debe hacer el código
- Inputs y outputs esperados
- Restricciones y requisitos especiales

### 3. **Estándares de calidad**
- Estilo de código y convenciones
- Nivel de documentación requerido
- Consideraciones de rendimiento y seguridad

### 4. **Entregables específicos**
- Código principal
- Comentarios explicativos
- Ejemplos de uso
- Casos de prueba básicos

## Buenas prácticas incluidas:

- **Nomenclatura clara y consistente**
- **Separación de responsabilidades**
- **Manejo adecuado de errores**
- **Código reutilizable y modular**
- **Documentación integrada**`,
          examples: [
            {
              title: "Plantilla completa para funciones",
              content: `Actúa como un desarrollador senior especializado en [LENGUAJE]. Crea una función que [DESCRIPCIÓN DETALLADA DE LA FUNCIONALIDAD].

**Especificaciones técnicas:**
- Lenguaje: [LENGUAJE/FRAMEWORK]
- Inputs: [DESCRIBIR PARÁMETROS]
- Output: [DESCRIBIR VALOR DE RETORNO]
- Restricciones: [LIMITACIONES O REQUISITOS ESPECIALES]

**Incluye en tu respuesta:**
1. **Función principal** con documentación inline
2. **Comentarios explicativos** en partes complejas
3. **Manejo de errores** y validación de inputs
4. **Ejemplo de uso** con datos reales
5. **Casos de prueba** básicos para validar funcionamiento

**Estándares de calidad:**
- Usa nomenclatura descriptiva y consistente
- Sigue las mejores prácticas de [LENGUAJE]
- Código optimizado y legible
- Considera edge cases importantes
- Incluye validación de tipos si es relevante

**Ejemplo de estructura esperada:**
\`\`\`[lenguaje]
// Breve descripción de la función
function nombreFuncion(parametro1, parametro2) {
    // Validación de inputs
    
    // Lógica principal con comentarios
    
    // Return con valor procesado
}

// Ejemplo de uso
const resultado = nombreFuncion(valor1, valor2);

// Casos de prueba
console.assert(resultado === valorEsperado);
\`\`\``
            },
            {
              title: "Plantilla para APIs y servicios",
              content: `Actúa como un arquitecto de software senior. Diseña e implementa [TIPO DE API/SERVICIO] para [PROPÓSITO/FUNCIONALIDAD].

**Arquitectura requerida:**
- Framework: [FRAMEWORK ESPECÍFICO]
- Base de datos: [TIPO DE BD SI APLICA]
- Autenticación: [MÉTODO DE AUTH SI APLICA]
- Formato de respuesta: [JSON/XML/ETC]

**Endpoints/Funcionalidades:**
[LISTAR FUNCIONALIDADES ESPECÍFICAS]

**Incluye en la implementación:**
1. **Estructura de proyecto** organizada y escalable
2. **Modelos de datos** con validaciones
3. **Controladores/Handlers** con lógica de negocio
4. **Middleware** para validación y autenticación
5. **Documentación de API** con ejemplos
6. **Configuración de seguridad** básica
7. **Manejo de errores** consistente
8. **Ejemplos de requests/responses**

**Consideraciones adicionales:**
- Implementa paginación si maneja listas
- Incluye rate limiting básico
- Valida todos los inputs
- Usa códigos HTTP apropiados
- Considera versionado de API
- Implementa logging para debugging`
            }
          ]
        },
        "brainstorming": {
          title: "Plantilla para brainstorming",
          content: `Esta plantilla está diseñada para generar ideas creativas y variadas, perfecta para sesiones de lluvia de ideas productivas.

## Metodología de la plantilla:

### 1. **Definición del reto creativo**
- Descripción clara del problema u oportunidad
- Contexto y restricciones relevantes
- Objetivos específicos del brainstorming

### 2. **Estímulos de creatividad**
- Perspectivas múltiples y diversas
- Técnicas de pensamiento lateral
- Referencias cruzadas entre industrias

### 3. **Estructura de ideas**
- Formato organizado y fácil de evaluar
- Criterios de evaluación incluidos
- Balance entre viabilidad y creatividad

### 4. **Iteración y refinamiento**
- Combinación de ideas complementarias
- Evolución de conceptos prometedores
- Identificación de próximos pasos

## Técnicas incluidas:

- **Pensamiento divergente**: Exploración amplia
- **Analogías cruzadas**: Inspiración de otros campos
- **Inversión de problemas**: ¿Qué si fuera lo opuesto?
- **Combinación forzada**: Unir conceptos aparentemente no relacionados
- **Escenarios futuros**: Visualización de posibilidades`,
          examples: [
            {
              title: "Plantilla completa de brainstorming",
              content: `Actúa como un consultor creativo experto en innovación. Genera 10 ideas innovadoras para [TEMA/PROYECTO/PROBLEMA].

**Contexto del desafío:**
- Objetivo: [DESCRIBIR QUÉ SE BUSCA LOGRAR]
- Audiencia: [GRUPO OBJETIVO]
- Restricciones: [LIMITACIONES DE TIEMPO, PRESUPUESTO, RECURSOS]
- Inspiración: [SECTORES O CASOS DE ÉXITO A CONSIDERAR]

**Para cada idea incluye:**
1. **Título llamativo** (máximo 6 palabras)
2. **Descripción concisa** (2-3 oraciones)
3. **Beneficios principales** (2-3 puntos clave)
4. **Viabilidad** (escala 1-10 con justificación breve)
5. **Recursos necesarios** (tiempo, dinero, personal)
6. **Diferenciador clave** (qué la hace única)

**Criterios de creatividad:**
- Piensa fuera de lo convencional
- Combina elementos de diferentes industrias
- Considera tendencias emergentes
- Incluye soluciones disruptivas y evolutivas
- Balance entre ideas realistas y visionarias

**Formato de entrega:**
💡 **IDEA #1: [TÍTULO]**
📝 Descripción: [EXPLICACIÓN]
✅ Beneficios: [LISTA DE VENTAJAS]
📊 Viabilidad: [PUNTUACIÓN]/10 - [JUSTIFICACIÓN]
🚀 Diferenciador: [QUÉ LA HACE ESPECIAL]

[REPETIR PARA LAS 10 IDEAS]

**Bonus:** Al final, identifica las 3 ideas con mayor potencial y sugiere cómo combinarlas o evolucionarlas.`
            },
            {
              title: "Plantilla para brainstorming de productos",
              content: `Eres un director de innovación de productos. Genera ideas creativas para [TIPO DE PRODUCTO] dirigido a [MERCADO OBJETIVO].

**Análisis del mercado:**
- Tendencias actuales: [DESCRIBIR 2-3 TENDENCIAS]
- Pain points identificados: [PROBLEMAS SIN RESOLVER]
- Tecnologías emergentes: [TECH DISPONIBLE PARA APROVECHAR]

**Metodología de ideación:**
Para cada concepto, aplica estas lentes creativas:

🔄 **Lente de Inversión**: ¿Qué pasaría si hiciéramos lo opuesto?
🔀 **Lente de Combinación**: ¿Qué otros productos podríamos fusionar?
🚀 **Lente Futurista**: ¿Cómo será esto en 5-10 años?
🎯 **Lente de Nicho**: ¿Qué micro-segmento está desatendido?

**Ideas a generar:**
1. **3 ideas evolutivas** (mejoras incrementales)
2. **3 ideas disruptivas** (cambios radicales de paradigma)
3. **2 ideas de nicho** (mercados específicos)
4. **2 ideas tecnológicas** (aprovechando nuevas tecnologías)

**Evaluación rápida:**
- 💰 Potencial comercial (1-5)
- 🔧 Facilidad de desarrollo (1-5)  
- 🎯 Ajuste al mercado (1-5)
- ⚡ Factor innovación (1-5)`
            }
          ]
        }
      }
    },
    categorias: {
      icon: Code,
      color: "bg-orange-500",
      title: "Prompts por Categoría",
      description: "Prompts especializados para diferentes áreas y profesiones",
      items: {
        "educacion": {
          title: "Educación y Aprendizaje",
          content: `Los prompts educativos están diseñados para optimizar el proceso de enseñanza-aprendizaje, adaptándose a diferentes estilos de aprendizaje y niveles académicos.

## Principios de los prompts educativos:

### 1. **Adaptabilidad pedagógica**
- Ajuste al nivel del estudiante
- Consideración de estilos de aprendizaje
- Progresión gradual de dificultad

### 2. **Metodología activa**
- Fomento del pensamiento crítico
- Aprendizaje basado en problemas
- Conexión con experiencias previas

### 3. **Evaluación formativa**
- Retroalimentación constante
- Identificación de áreas de mejora
- Celebración de logros

## Tipos de prompts educativos:

### **Para estudiantes:**
- Explicaciones simplificadas de conceptos complejos
- Generación de ejemplos prácticos
- Creación de mnemotécnicos y ayudas memoria
- Simulación de exámenes y práctica

### **Para educadores:**
- Diseño de actividades didácticas
- Evaluación de comprensión
- Adaptación de contenidos
- Gestión del aula virtual

### **Para instituciones:**
- Desarrollo curricular
- Análisis de rendimiento académico
- Personalización de itinerarios de aprendizaje`,
          examples: [
            {
              title: "Plan de estudio personalizado",
              content: `Actúa como un pedagogo experto en diseño instruccional. Crea un plan de estudio de 30 días para [TEMA ESPECÍFICO].

**Información del estudiante:**
- Nivel actual: [PRINCIPIANTE/INTERMEDIO/AVANZADO]
- Tiempo disponible: [HORAS POR DÍA/SEMANA]
- Estilo de aprendizaje: [VISUAL/AUDITIVO/KINESTÉSICO/LECTOESCRITURA]
- Objetivo específico: [QUÉ QUIERE LOGRAR]

**Estructura del plan:**

📅 **SEMANA 1: FUNDAMENTOS**
Día 1-7: [Conceptos básicos y terminología esencial]
- Objetivos diarios específicos
- Recursos de estudio recomendados (videos, libros, artículos)
- Ejercicios prácticos (15-30 min diarios)
- Autoevaluación semanal

📅 **SEMANA 2: DESARROLLO**
Día 8-14: [Aplicación práctica de conceptos]
- Proyectos hands-on
- Casos de estudio reales
- Colaboración y discusión
- Mini-evaluaciones

📅 **SEMANA 3: PROFUNDIZACIÓN**
Día 15-21: [Temas avanzados y especialización]
- Análisis crítico
- Resolución de problemas complejos
- Investigación independiente
- Mentorías virtuales

📅 **SEMANA 4: MAESTRÍA**
Día 22-30: [Síntesis y aplicación avanzada]
- Proyecto final integrador
- Presentación de resultados
- Reflexión y metacognición
- Planificación de continuidad

**Para cada día incluye:**
✅ Objetivo específico de aprendizaje
📚 Recursos de estudio (con enlaces cuando sea posible)
🔬 Actividad práctica o ejercicio
⏱️ Tiempo estimado de dedicación
🎯 Criterio de evaluación
💡 Tip de estudio o técnica de memorización`
            },
            {
              title: "Explicación adaptada por niveles",
              content: `Eres un educador experto en comunicación pedagógica. Explica [CONCEPTO ESPECÍFICO] adaptando la explicación a diferentes niveles educativos.

**NIVEL BÁSICO (Primaria/Principiante):**
- Usa analogías simples y cotidianas
- Vocabulario accesible
- Ejemplos visuales y tangibles
- Longitud: 100-150 palabras

**NIVEL INTERMEDIO (Secundaria/Intermedio):**
- Introduce terminología técnica gradualmente
- Conexiones con otros conceptos conocidos
- Ejemplos más sofisticados
- Longitud: 200-300 palabras

**NIVEL AVANZADO (Universidad/Experto):**
- Terminología técnica completa
- Complejidades y matices del tema
- Referencias académicas y casos especializados
- Longitud: 300-500 palabras

**Para cada nivel incluye:**
1. **Definición clara** adaptada al vocabulario
2. **Analogía principal** apropiada para la edad
3. **Ejemplo práctico** relevante para el contexto
4. **Pregunta reflexiva** para verificar comprensión
5. **Conexiones** con otros temas del currículum
6. **Actividad sugerida** para reforzar el aprendizaje

**Concepto a explicar:** [INSERTAR CONCEPTO AQUÍ]`
            }
          ]
        },
        "marketing": {
          title: "Marketing y Contenido",
          content: `Los prompts de marketing están diseñados para crear contenido persuasivo, estrategias efectivas y campañas que generen resultados medibles.

## Elementos clave del marketing con IA:

### 1. **Conocimiento del cliente**
- Buyer personas detalladas
- Pain points y motivaciones
- Journey del cliente completo

### 2. **Contenido estratégico**
- Mensajes diferenciados por canal
- Storytelling persuasivo
- Call-to-actions efectivos

### 3. **Optimización continua**
- A/B testing de mensajes
- Análisis de performance
- Iteración basada en datos

## Aplicaciones principales:

### **Content Marketing:**
- Blogs que educan y convierten
- Social media que engaña
- Email marketing personalizado
- Videos que viralizan

### **Advertising:**
- Copy que convierte
- Segmentación precisa
- Retargeting inteligente
- Optimización de presupuesto

### **Brand Building:**
- Posicionamiento diferenciado
- Identidad de marca consistente
- Comunicación de valores
- Gestión de reputación online`,
          examples: [
            {
              title: "Estrategia integral de contenido",
              content: `Actúa como un estratega de marketing digital senior. Crea una estrategia de contenido completa para [MARCA/PRODUCTO] dirigida a [AUDIENCIA OBJETIVO].

**Análisis de situación:**
- Industria: [SECTOR ESPECÍFICO]
- Competencia principal: [2-3 COMPETIDORES]
- Propuesta de valor única: [USP]
- Objetivos de marketing: [AWARENESS/LEADS/VENTAS/RETENCIÓN]

**Desarrollo de la estrategia:**

🎯 **1. BUYER PERSONA PRINCIPAL**
- Demografia: [edad, ubicación, ingresos, educación]
- Psicografia: [valores, intereses, aspiraciones]
- Comportamiento: [hábitos de consumo digital, plataformas preferidas]
- Pain points: [3 problemas principales que resuelves]
- Momento de compra: [cuándo y por qué compran]

📱 **2. MIX DE CONTENIDO POR PLATAFORMA**

**Blog/Website (SEO + Thought Leadership):**
- 4 artículos/mes de 1500+ palabras
- Temas: [listar 8-10 topics pilares]
- Palabras clave objetivo: [keywords principales]
- Formato: tutoriales, casos de estudio, tendencias

**LinkedIn (B2B + Networking):**
- 3 posts/semana + 2 artículos/mes
- Contenido: insights de industria, behind-the-scenes, logros
- Engagement: comentarios en posts de líderes de opinión

**Instagram (Visual + Lifestyle):**
- 1 post diario + 3 stories diarias
- Contenido: 40% educativo, 30% entretenimiento, 20% producto, 10% UGC
- Formatos: carruseles educativos, reels de tips, IGTV entrevistas

**YouTube (Educación + Demo):**
- 2 videos/semana de 8-15 minutos
- Series: tutoriales, Q&A, casos de éxito de clientes
- Optimización: thumbnails llamativos, títulos SEO

**Email Marketing:**
- Newsletter semanal segmentada
- Secuencia de onboarding (7 emails)
- Campaigns estacionales y promocionales

📊 **3. CALENDARIO DE CONTENIDO (MUESTRA 1 MES)**
[Incluir tabla semanal con tipos de contenido por plataforma]

📈 **4. MÉTRICAS Y KPIS**
- Awareness: alcance, impresiones, brand mentions
- Engagement: likes, shares, comments, tiempo en página
- Leads: downloads, suscripciones, demos solicitadas
- Conversión: ventas atribuidas, LTV, CAC

🚀 **5. QUICK WINS Y EXPERIMENTOS**
- 5 ideas de contenido viral para los primeros 30 días
- 3 colaboraciones estratégicas con influencers/partners
- 2 campañas pagadas para amplificar contenido orgánico`
            }
          ]
        },
        "programacion": {
          title: "Programación y Desarrollo",
          content: `Los prompts técnicos de programación están diseñados para generar código de calidad, resolver problemas complejos y optimizar el desarrollo de software.

## Características de prompts técnicos efectivos:

### 1. **Especificidad técnica**
- Lenguajes y frameworks precisos
- Versiones y compatibilidades
- Patrones de diseño relevantes

### 2. **Contexto del proyecto**
- Arquitectura existente
- Restricciones y limitaciones
- Objetivos de rendimiento

### 3. **Calidad del código**
- Best practices del lenguaje
- Documentación integrada
- Testing y validación

## Casos de uso principales:

### **Desarrollo de funcionalidades:**
- APIs RESTful y GraphQL
- Componentes reutilizables
- Algoritmos optimizados
- Integraciones de terceros

### **Debugging y optimización:**
- Identificación de bottlenecks
- Refactoring de código legacy
- Mejoras de performance
- Fixing de vulnerabilidades

### **Arquitectura y diseño:**
- Diseño de bases de datos
- Patrones de microservicios
- CI/CD pipelines
- Infraestructura como código`,
          examples: [
            {
              title: "Arquitectura de aplicación completa",
              content: `Actúa como un arquitecto de software senior con 10+ años de experiencia. Diseña la arquitectura completa para [TIPO DE APLICACIÓN] con los siguientes requerimientos:

**Especificaciones del proyecto:**
- Usuarios esperados: [NÚMERO APROXIMADO]
- Funcionalidades principales: [LISTAR 5-7 FEATURES CORE]
- Tecnologías preferidas: [STACK TECNOLÓGICO]
- Restricciones: [PRESUPUESTO, TIEMPO, COMPLIANCE]
- Escalabilidad: [CRECIMIENTO ESPERADO]

**Entregables requeridos:**

🏗️ **1. ARQUITECTURA DE ALTO NIVEL**
- Diagrama de componentes principales
- Flujo de datos entre servicios
- Decisiones arquitectónicas y justificación
- Patrones de diseño aplicados

💾 **2. DISEÑO DE BASE DE DATOS**
- Esquema relacional o NoSQL
- Índices y optimizaciones
- Estrategia de respaldos
- Consideraciones de escalabilidad

🔧 **3. STACK TECNOLÓGICO DETALLADO**

**Frontend:**
- Framework/librería: [REACT/VUE/ANGULAR]
- Estado management: [REDUX/VUEX/CONTEXT]
- Styling: [CSS-IN-JS/TAILWIND/STYLED-COMPONENTS]
- Testing: [JEST/CYPRESS/TESTING-LIBRARY]

**Backend:**
- Runtime/Framework: [NODE.JS/PYTHON/JAVA/.NET]
- Base de datos: [POSTGRESQL/MONGODB/MYSQL]
- Cache: [REDIS/MEMCACHED]
- Queue/Message broker: [RABBITMQ/KAFKA]

**DevOps:**
- Containerización: [DOCKER/KUBERNETES]
- CI/CD: [GITHUB ACTIONS/JENKINS/GITLAB]
- Cloud provider: [AWS/AZURE/GCP]
- Monitoring: [DATADOG/NEW RELIC/PROMETHEUS]

🚀 **4. PLAN DE IMPLEMENTACIÓN**
- Fases de desarrollo (MVP → V1 → V2)
- Cronograma estimado por milestone
- Equipo necesario (roles y skills)
- Riesgos técnicos y mitigaciones

🔒 **5. CONSIDERACIONES DE SEGURIDAD**
- Autenticación y autorización
- Protección de datos sensibles
- Rate limiting y DDoS protection
- Compliance (GDPR, SOC2, etc.)

📊 **6. MÉTRICAS Y MONITORING**
- KPIs técnicos a trackear
- Alertas críticas
- Dashboard de salud del sistema
- Estrategia de logging

Incluye ejemplos de código para los componentes más críticos y considera trade-offs entre diferentes opciones tecnológicas.`
            }
          ]
        }
      }
    }
  };

  const currentCategory = guideData[category as string];
  const currentItem = currentCategory?.items[itemId as string];

  if (!currentCategory || !currentItem) {
    navigate("/404");
    return null;
  }

  const CategoryIcon = currentCategory.icon;

  const copyExample = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "¡Copiado!",
      description: `${title} copiado al portapapeles`,
    });
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="mb-4 hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la guía
              </Button>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Guía</span>
                <span>/</span>
                <span>{currentCategory.title}</span>
                <span>/</span>
                <span className="text-foreground">{currentItem.title}</span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-12 animate-fade-in">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`p-4 rounded-xl ${currentCategory.color}`}>
                  <CategoryIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                    {currentItem.title}
                  </h1>
                  <Badge variant="secondary" className="text-sm">
                    {currentCategory.title}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto">
              {/* Main Article Content */}
              <article className="animate-slide-up">
                <div className="prose prose-lg max-w-none mb-12">
                  <div className="text-foreground leading-relaxed text-lg">
                    {currentItem.content.split('\n').map((paragraph, index) => {
                      if (paragraph.trim() === '') return <br key={index} />;
                      
                      // Handle headers (lines starting with ##)
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4 border-b border-muted pb-2">
                            {paragraph.replace('## ', '')}
                          </h2>
                        );
                      }
                      
                      // Handle subheaders (lines starting with ###)
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h3 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">
                            {paragraph.replace('### ', '')}
                          </h3>
                        );
                      }
                      
                      // Handle bold text (**text**)
                      if (paragraph.includes('**')) {
                        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={index} className="mb-4 leading-relaxed">
                            {parts.map((part, partIndex) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={partIndex} className="font-semibold text-primary">{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                          </p>
                        );
                      }
                      
                      // Handle bullet points (lines starting with -)
                      if (paragraph.startsWith('- ')) {
                        return (
                          <div key={index} className="flex items-start mb-2">
                            <span className="text-primary mr-3 mt-1">•</span>
                            <span className="leading-relaxed">{paragraph.replace('- ', '')}</span>
                          </div>
                        );
                      }
                      
                      // Regular paragraphs
                      return (
                        <p key={index} className="mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Examples Section */}
                {currentItem.examples && currentItem.examples.length > 0 && (
                  <section className="mt-12 border-t border-muted pt-12">
                    <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                      Ejemplos Prácticos
                    </h2>
                    
                    <div className="space-y-8">
                      {currentItem.examples.map((example: any, index: number) => (
                        <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                          <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-8 border border-muted/50">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-semibold text-foreground">
                                📝 {example.title}
                              </h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyExample(example.content, example.title)}
                                className="hover:bg-primary/10 shrink-0"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar
                              </Button>
                            </div>
                            
                            <div className="bg-muted/50 rounded-lg p-6 border-l-4 border-primary">
                              <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-mono">
                                {example.content}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Call to Action */}
                <section className="mt-16 text-center">
                  <div className="bg-gradient-card rounded-2xl p-8 border border-muted/50">
                    <Lightbulb className="h-16 w-16 mx-auto mb-6 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      ¿Listo para poner en práctica lo aprendido?
                    </h3>
                    <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
                      Usa nuestro builder interactivo para crear prompts personalizados basados en estas técnicas
                    </p>
                    <Button 
                      onClick={() => navigate("/#builder")}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg"
                    >
                      Ir al Builder Interactivo
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </section>
              </article>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default GuideDetail;