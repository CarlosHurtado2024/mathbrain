// Datos de cada curso. Las lecciones (texto, LaTeX, video y ejercicios) están en content/<id-del-curso>/*.md
// y se compilan con «npm run build» en dist/content.js.
//
// Cada curso se organiza como en una plataforma de cursos en línea:
// - outcomes: «Lo que aprenderás» en todo el curso.
// - skills: habilidades que se desarrollan.
// - modules: módulos en orden. Cada lección declara en su archivo «unidad:» con el título exacto de su módulo.
//   summary y objectives describen el módulo; extras añade simulaciones o ejercicios resueltos de src/library.js.
window.MATHBRAIN_COURSES = [
  {
    id: 'fundamentos-matematicas', title: 'Fundamentos de Matemáticas', category: 'fundamentos', school: 'matematicas', label: 'FUNDAMENTOS', level: 'Inicial', art: 'algebra', color: 'purple',
    description: 'De los números reales a los números complejos. Aritmética, álgebra, funciones y trigonometría: la base para el cálculo y las ciencias.',
    intro: 'Un recorrido en espiral por cinco unidades: números reales, álgebra fundamental, funciones, trigonometría y números complejos. Cada módulo parte de la intuición, deduce sus fórmulas y termina con práctica.',
    prerequisite: 'Ninguno formal. Se recomienda dominar las operaciones aritméticas básicas.',
    outcomes: [
      'Resolver problemas de proporcionalidad, porcentajes, interés y progresiones.',
      'Transformar expresiones algebraicas con exponentes, factorización y fracciones algebraicas.',
      'Modelar situaciones con ecuaciones y desigualdades e interpretar sus soluciones.',
      'Analizar funciones polinómicas, racionales, exponenciales y logarítmicas a partir de su fórmula y su gráfica.',
      'Resolver triángulos, demostrar identidades y resolver ecuaciones trigonométricas.',
      'Operar con números complejos y calcular potencias y raíces con el teorema de De Moivre.'
    ],
    skills: ['Aritmética', 'Álgebra', 'Funciones', 'Trigonometría', 'Números complejos', 'Modelación matemática'],
    modules: [
      { title: 'Unidad 1 · Números reales y aritmética', summary: 'Construye el piso sobre el que descansa todo el curso: los sistemas numéricos, el razonamiento proporcional, los porcentajes, las progresiones y la notación de sumatoria.', objectives: ['Clasificar números en los sistemas numéricos y operar con fracciones, intervalos y valor absoluto.', 'Resolver problemas de proporcionalidad, porcentajes e interés simple y compuesto.', 'Usar progresiones, series geométricas y la notación de sumatoria.'], extras: [] },
      { title: 'Unidad 2 · Álgebra fundamental', summary: 'El álgebra es el lenguaje con el que se escribe el resto de la matemática: exponentes, radicales, polinomios, factorización, expresiones racionales, ecuaciones y desigualdades.', objectives: ['Aplicar las leyes de los exponentes y simplificar radicales.', 'Operar polinomios, factorizar y simplificar expresiones racionales.', 'Resolver ecuaciones y desigualdades y modelar problemas verbales.'], extras: ['ej-ecuacion'] },
      { title: 'Unidad 3 · Funciones', summary: 'La función describe cómo una cantidad depende de otra. Del plano cartesiano a las familias que usarás en cálculo: cuadráticas, polinómicas, racionales, exponenciales y logarítmicas.', objectives: ['Trabajar con rectas, circunferencias y el concepto de función.', 'Analizar funciones cuadráticas, polinómicas y racionales.', 'Resolver ecuaciones exponenciales y logarítmicas y modelar crecimiento.'], extras: ['sim-sistema'] },
      { title: 'Unidad 4 · Trigonometría', summary: 'De la medición indirecta de distancias al lenguaje de los fenómenos periódicos: ángulos, triángulos, la circunferencia unitaria, gráficas, identidades y ecuaciones.', objectives: ['Medir ángulos y resolver triángulos rectángulos y oblicuos.', 'Analizar las funciones trigonométricas, sus gráficas y sus inversas.', 'Demostrar identidades y resolver ecuaciones trigonométricas.'], extras: ['sim-circulo', 'ej-triangulo'] },
      { title: 'Unidad 5 · Números complejos', summary: 'La unidad final completa los sistemas numéricos: los complejos resuelven toda ecuación polinómica y su forma trigonométrica une el álgebra con la trigonometría.', objectives: ['Operar con números complejos en forma estándar.', 'Relacionar los ceros de un polinomio con el teorema fundamental del álgebra.', 'Usar la forma trigonométrica y el teorema de De Moivre para potencias y raíces.'], extras: [] }
    ]
  },
  {
    id: 'calculo-diferencial', title: 'Cálculo diferencial', category: 'calculo', school: 'matematicas', label: 'CÁLCULO', level: 'Intermedio', art: 'derivative', color: 'blue',
    description: 'El cambio tiene su propio lenguaje. Descubre los límites, las derivadas y las ideas que les dan sentido.',
    intro: '¿Cómo describimos algo que cambia a cada instante? En este curso construiremos la idea de derivada desde la intuición geométrica hasta sus aplicaciones.',
    prerequisite: 'Funciones y álgebra básica',
    outcomes: [
      'Interpretar la derivada como tasa de cambio instantánea y como pendiente de la recta tangente.',
      'Calcular límites sencillos y reconocer cuándo no existen.',
      'Derivar funciones con las reglas básicas y la regla de la cadena.',
      'Resolver problemas de optimización con derivadas.'
    ],
    skills: ['Límites', 'Derivadas', 'Tasas de cambio', 'Optimización'],
    modules: [
      { title: 'Módulo 1 · El cambio y los límites', summary: 'Del cambio medio a la idea de límite: la base para definir la derivada.', objectives: ['Calcular tasas de cambio medias e interpretarlas como pendientes de secantes.', 'Explicar qué es un límite y calcularlo en casos sencillos.'], extras: [] },
      { title: 'Módulo 2 · La derivada y sus aplicaciones', summary: 'Construye la derivada, aprende sus reglas y úsala para encontrar máximos y mínimos.', objectives: ['Definir la derivada como límite del cociente incremental.', 'Aplicar las reglas de la potencia, el producto y la cadena.', 'Usar la derivada para encontrar y clasificar extremos.'], extras: ['sim-derivada', 'ej-derivada'] }
    ]
  },
  {
    id: 'probabilidad', title: 'Probabilidad', category: 'estadistica', school: 'estadistica', label: 'PROBABILIDAD', level: 'Inicial', art: 'probability', color: 'sand',
    description: 'Dale sentido al azar. Una forma visual de pensar en la incertidumbre y los eventos que nos rodean.',
    intro: 'El azar tiene patrones. Este curso presenta las herramientas para describir la incertidumbre, desde experimentos sencillos hasta distribuciones de probabilidad.',
    prerequisite: 'Aritmética y nociones de conjuntos',
    outcomes: [
      'Modelar experimentos aleatorios y asignar probabilidades a sus eventos.',
      'Contar casos con el principio multiplicativo, permutaciones y combinaciones.',
      'Razonar con probabilidad condicional y con el teorema de Bayes.',
      'Describir variables aleatorias discretas y su valor esperado.'
    ],
    skills: ['Probabilidad', 'Combinatoria', 'Teorema de Bayes', 'Variables aleatorias'],
    modules: [
      { title: 'Módulo 1 · Contar y medir el azar', summary: 'Experimentos, espacios muestrales y técnicas de conteo para asignar probabilidades.', objectives: ['Describir experimentos, espacios muestrales y eventos.', 'Contar resultados con permutaciones y combinaciones.'], extras: ['sim-azar'] },
      { title: 'Módulo 2 · Información, evidencia y variables', summary: 'Cómo cambia la probabilidad con nueva información y cómo resumir el azar con números.', objectives: ['Calcular probabilidades condicionales y reconocer eventos independientes.', 'Actualizar probabilidades con el teorema de Bayes.', 'Calcular el valor esperado de una variable aleatoria discreta.'], extras: ['ej-bayes'] }
    ]
  },
  {
    id: 'inferencia-estadistica', title: 'Inferencia estadística', category: 'estadistica', school: 'estadistica', label: 'ESTADÍSTICA', level: 'Intermedio', art: 'inference', color: 'green',
    description: 'De una muestra a una conclusión. Aprende a escuchar lo que los datos pueden decir y lo que no.',
    intro: 'Una muestra es una ventana a una población. Exploraremos cómo estimar cantidades, expresar incertidumbre y contrastar hipótesis con cuidado.',
    prerequisite: 'Probabilidad y estadística descriptiva',
    outcomes: [
      'Evaluar cómo se recogieron los datos antes de sacar conclusiones.',
      'Cuantificar la incertidumbre de una estimación con el error estándar.',
      'Construir e interpretar intervalos de confianza sin confusiones.',
      'Leer pruebas de hipótesis y valores p con sentido crítico.'
    ],
    skills: ['Muestreo', 'Estimación', 'Intervalos de confianza', 'Pruebas de hipótesis'],
    modules: [
      { title: 'Módulo 1 · De la muestra a la población', summary: 'Cómo se eligen los datos y cuánto varían las medias de una muestra a otra.', objectives: ['Distinguir población y muestra y reconocer sesgos de selección.', 'Calcular e interpretar el error estándar de la media.'], extras: ['ej-error-estandar'] },
      { title: 'Módulo 2 · Estimar y contrastar', summary: 'Intervalos de confianza, valores p y tamaño del efecto: decir con datos lo que se puede decir.', objectives: ['Construir e interpretar intervalos de confianza.', 'Interpretar correctamente un valor p.', 'Valorar el tamaño del efecto y su importancia práctica.'], extras: ['sim-intervalos'] }
    ]
  },
  {
    id: 'calculo-integral', title: 'Cálculo integral', category: 'calculo', school: 'matematicas', label: 'CÁLCULO', level: 'Intermedio', art: 'integral', color: 'slate',
    description: 'El poder de sumar lo pequeño. Descubre cómo las áreas nos ayudan a entender la acumulación.',
    intro: 'Sumar piezas pequeñas permite resolver grandes preguntas. Construiremos la integral como acumulación y exploraremos su relación con la derivada.',
    prerequisite: 'Cálculo diferencial',
    outcomes: [
      'Entender la integral como acumulación de pequeñas contribuciones.',
      'Aproximar integrales con sumas de Riemann.',
      'Calcular integrales con primitivas y el teorema fundamental del cálculo.',
      'Resolver problemas de desplazamiento y valor promedio.'
    ],
    skills: ['Integrales', 'Sumas de Riemann', 'Teorema fundamental', 'Primitivas'],
    modules: [
      { title: 'Módulo 1 · Acumular y medir áreas', summary: 'De los rectángulos a la integral definida como área con signo.', objectives: ['Aproximar áreas con sumas de Riemann.', 'Interpretar la integral definida como área con signo.'], extras: ['sim-riemann'] },
      { title: 'Módulo 2 · El teorema fundamental y sus aplicaciones', summary: 'La conexión entre derivar e integrar, las primitivas y sus usos en distancia y promedios.', objectives: ['Calcular integrales definidas con el teorema fundamental.', 'Encontrar primitivas de funciones básicas.', 'Aplicar integrales a distancias y valores promedio.'], extras: ['ej-integral'] }
    ]
  }
];
