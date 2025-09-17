import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Copy, Heart, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ExploreSection = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedDifficulty, setSelectedDifficulty] = useState("todos");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set());

  const prompts = [
    {
      id: 1,
      title: "Análisis SWOT Empresarial",
      description: "Analiza fortalezas, debilidades, oportunidades y amenazas de cualquier negocio",
      category: "negocios",
      difficulty: "intermedio",
      rating: 4.8,
      uses: 1250,
      prompt: `Actúa como un consultor estratégico experto. Realiza un análisis SWOT completo para [EMPRESA/PROYECTO].

Analiza los siguientes aspectos:

**FORTALEZAS (Strengths):**
- Ventajas competitivas internas
- Recursos únicos
- Capacidades distintivas

**DEBILIDADES (Weaknesses):**
- Limitaciones internas
- Áreas de mejora
- Recursos faltantes

**OPORTUNIDADES (Opportunities):**
- Tendencias de mercado favorables
- Cambios en el entorno
- Segmentos no atendidos

**AMENAZAS (Threats):**
- Competencia
- Cambios regulatorios
- Riesgos del mercado

Proporciona el análisis en formato de tabla y añade 3 recomendaciones estratégicas basadas en los hallazgos.`,
      tags: ["estrategia", "análisis", "consultoría"]
    },
    {
      id: 2,
      title: "Creador de Historias Interactivas",
      description: "Genera narrativas donde el lector puede elegir el rumbo de la historia",
      category: "creatividad",
      difficulty: "avanzado",
      rating: 4.9,
      uses: 890,
      prompt: `Eres un maestro narrador especializado en ficción interactiva. Crea una historia donde el lector tome decisiones que afecten el desarrollo narrativo.

Estructura:
1. **Contexto inicial:** Establece escenario, personaje principal y situación inicial
2. **Primera decisión:** Presenta 3 opciones claras (A, B, C) con consecuencias diferentes
3. **Desarrollo:** Narra el resultado de la elección elegida
4. **Nueva decisión:** Ofrece 3 nuevas opciones basadas en la anterior

Requisitos:
- Tono: [Aventura/Misterio/Ciencia ficción/Fantasía]
- Audiencia: [Infantil/Juvenil/Adulto]
- Longitud: Párrafos de 100-150 palabras
- Incluye descripciones vívidas y diálogos naturales

Al final de cada sección, pregunta: "¿Qué eliges? (A, B o C)" y espera la respuesta para continuar.`,
      tags: ["narrativa", "interactivo", "creatividad"]
    },
    {
      id: 3,
      title: "Optimizador de CV",
      description: "Mejora tu currículum para destacar en procesos de selección específicos",
      category: "profesional",
      difficulty: "basico",
      rating: 4.7,
      uses: 2100,
      prompt: `Actúa como un experto en recursos humanos y coach profesional. Ayúdame a optimizar mi CV para [PUESTO ESPECÍFICO] en [INDUSTRIA/SECTOR].

Analiza mi CV actual y proporciona:

**1. Análisis General:**
- Puntos fuertes actuales
- Áreas de mejora críticas
- Primer impacto visual

**2. Optimizaciones Específicas:**
- Palabras clave relevantes para [PUESTO]
- Reescritura de logros usando métricas
- Estructura recomendada por secciones

**3. Adaptación al Puesto:**
- Habilidades a destacar
- Experiencias más relevantes
- Certificaciones importantes

**4. Consejos Finales:**
- Formato y diseño
- Longitud ideal
- Errores comunes a evitar

Proporciona ejemplos específicos de cómo reescribir bullet points con impacto cuantificable.`,
      tags: ["empleo", "profesional", "optimización"]
    },
    {
      id: 4,
      title: "Generador de Ideas de Contenido Viral",
      description: "Crea conceptos para contenido que genere engagement en redes sociales",
      category: "marketing",
      difficulty: "intermedio",
      rating: 4.6,
      uses: 1580,
      prompt: `Eres un especialista en marketing digital y creación de contenido viral. Genera ideas de contenido para [MARCA/EMPRESA] dirigido a [AUDIENCIA OBJETIVO] en [PLATAFORMA].

Para cada idea proporciona:

**Concepto Principal:**
- Hook inicial (primer 3 segundos)
- Desarrollo del contenido
- Call-to-action específico

**Elementos Virales:**
- Factor emocional (humor, sorpresa, inspiración)
- Elementos de storytelling
- Componente visual sugerido

**Formato de Publicación:**
- Tipo de contenido (video, carrusel, historia)
- Duración/cantidad de slides
- Texto de acompañamiento con hashtags

**Métricas Esperadas:**
- Objetivo principal (reach, engagement, conversión)
- KPIs a medir

Genera 5 ideas diferentes con enfoques únicos pero mantén coherencia con la identidad de marca.`,
      tags: ["viral", "social media", "engagement"]
    },
    {
      id: 5,
      title: "Solucionador de Bugs de Código",
      description: "Identifica y resuelve errores en código de programación paso a paso",
      category: "programacion",
      difficulty: "avanzado",
      rating: 4.9,
      uses: 950,
      prompt: `Actúa como un senior developer y debugger experto. Ayúdame a identificar y resolver el siguiente error de código.

**Código con Error:**
[PEGAR CÓDIGO AQUÍ]

**Error/Comportamiento:**
[DESCRIBIR EL PROBLEMA]

**Análisis Requerido:**

1. **Identificación del Error:**
   - Línea(s) específica(s) con el problema
   - Tipo de error (sintaxis, lógico, runtime)
   - Causa raíz del problema

2. **Solución Paso a Paso:**
   - Código corregido con explicaciones
   - Comentarios en las líneas modificadas
   - Mejores prácticas aplicadas

3. **Prevención Futura:**
   - Patrones para evitar errores similares
   - Técnicas de debugging recomendadas
   - Herramientas útiles para detección

4. **Optimizaciones Adicionales:**
   - Mejoras de rendimiento si aplican
   - Refactoring sugerido
   - Consideraciones de seguridad

Incluye ejemplos de testing para validar la solución.`,
      tags: ["debugging", "código", "solución"]
    },
    {
      id: 6,
      title: "Planificador de Viajes Personalizado",
      description: "Crea itinerarios detallados adaptados a presupuesto y preferencias",
      category: "personal",
      difficulty: "basico",
      rating: 4.5,
      uses: 1890,
      prompt: `Eres un agente de viajes experto especializado en crear itinerarios personalizados. Diseña un plan de viaje completo para [DESTINO] durante [DURACIÓN] con un presupuesto de [CANTIDAD].

**Información del Viajero:**
- Tipo de viajero: [Solo/Pareja/Familia/Grupo]
- Intereses: [Cultura/Naturaleza/Gastronomía/Aventura/Relax]
- Estilo: [Económico/Medio/Lujo]

**Itinerario Día a Día:**
Para cada día incluye:
- Actividades principales (horarios sugeridos)
- Opciones de comidas con presupuesto
- Transporte entre ubicaciones
- Tiempo libre y alternativas

**Información Práctica:**
- Alojamiento recomendado por zona
- Presupuesto desglosado por categorías
- Documentación necesaria
- Mejor época para viajar
- Consejos locales y culturales

**Extras:**
- Plan B para días de mal tiempo
- Apps y recursos útiles
- Frases básicas en idioma local
- Emergencias y contactos importantes

Organiza todo en formato fácil de seguir con mapas sugeridos y enlaces útiles.`,
      tags: ["viajes", "planificación", "turismo"]
    }
  ];

  const categories = [
    { value: "todos", label: "Todas las categorías" },
    { value: "negocios", label: "Negocios" },
    { value: "creatividad", label: "Creatividad" },
    { value: "profesional", label: "Profesional" },
    { value: "marketing", label: "Marketing" },
    { value: "programacion", label: "Programación" },
    { value: "personal", label: "Personal" }
  ];

  const difficulties = [
    { value: "todos", label: "Todos los niveles" },
    { value: "basico", label: "Básico" },
    { value: "intermedio", label: "Intermedio" },
    { value: "avanzado", label: "Avanzado" }
  ];

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "todos" || prompt.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "todos" || prompt.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const copyPrompt = (prompt: string, title: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "¡Prompt copiado!",
      description: `"${title}" copiado al portapapeles`,
    });
  };

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedPrompts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPrompts(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "basico": return "bg-emerald-500 text-white";
      case "intermedio": return "bg-amber-500 text-white";
      case "avanzado": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "basico": return "●";
      case "intermedio": return "●●";
      case "avanzado": return "●●●";
      default: return "●";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "negocios": return "bg-blue-100 text-blue-800 border-blue-200";
      case "creatividad": return "bg-purple-100 text-purple-800 border-purple-200";
      case "profesional": return "bg-green-100 text-green-800 border-green-200";
      case "marketing": return "bg-pink-100 text-pink-800 border-pink-200";
      case "programacion": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "personal": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <section id="explorar" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Explorar <span className="text-primary">Prompts</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre una colección curada de prompts efectivos. Filtra por categoría, 
            copia los que más te gusten y úsalos inmediatamente.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="max-w-4xl mx-auto mb-12 animate-slide-up">
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-primary" />
                <span>Filtros y Búsqueda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Difficulty Filter */}
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Mostrando {filteredPrompts.length} de {prompts.length} prompts
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((promptItem, index) => (
            <Card 
              key={promptItem.id} 
              className="shadow-card-custom hover:shadow-elegant transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg mb-4">{promptItem.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(promptItem.id)}
                    className="shrink-0 ml-2 hover:bg-primary/10"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        favorites.has(promptItem.id) 
                          ? 'fill-primary text-primary' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                </div>

                {/* Difficulty and Category Indicators */}
                <div className="flex items-center gap-3 mb-4">
                  <Badge 
                    className={`${getDifficultyColor(promptItem.difficulty)} font-semibold`}
                  >
                    {getDifficultyIcon(promptItem.difficulty)} {promptItem.difficulty}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${getCategoryColor(promptItem.category)} font-medium`}
                  >
                    {categories.find(c => c.value === promptItem.category)?.label || promptItem.category}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {promptItem.tags.map((tag, index) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className={`text-xs ${
                        index % 4 === 0 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        index % 4 === 1 ? 'bg-green-50 text-green-700 border-green-200' :
                        index % 4 === 2 ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Prompt with Show More */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <pre className="text-sm font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                      {expandedPrompts.has(promptItem.id) 
                        ? promptItem.prompt 
                        : `${promptItem.prompt.substring(0, 300)}${promptItem.prompt.length > 300 ? '...' : ''}`
                      }
                    </pre>
                    {promptItem.prompt.length > 300 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(promptItem.id)}
                        className="mt-2 text-primary hover:text-primary/80 p-0 h-auto"
                      >
                        {expandedPrompts.has(promptItem.id) ? 'Mostrar menos' : 'Mostrar más'}
                      </Button>
                    )}
                  </div>

                   {/* Action Button */}
                   <Button 
                     onClick={() => copyPrompt(promptItem.prompt, promptItem.title)}
                     className="w-full bg-primary hover:bg-primary/90"
                     size="sm"
                   >
                     <Copy className="h-4 w-4 mr-2" />
                     Copiar Prompt
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No se encontraron prompts
            </h3>
            <p className="text-muted-foreground">
              Prueba con otros términos de búsqueda o ajusta los filtros
            </p>
          </div>
        )}

        {/* Add Prompt Section for Registered Users */}
        <div className="mt-16 text-center animate-fade-in">
          <Card className="max-w-2xl mx-auto shadow-elegant bg-gradient-card">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  ¿Tienes un prompt genial?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Comparte tus mejores prompts con la comunidad. Después de registrarte, 
                  podrás contribuir y ayudar a otros usuarios a mejorar sus resultados.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                  onClick={() => {
                    // Scroll to header to open auth dialog
                    document.querySelector('header')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Registrarme para Contribuir
                </Button>
                <p className="text-xs text-muted-foreground">
                  Los usuarios registrados pueden añadir prompts, valorar contenido y guardar favoritos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;