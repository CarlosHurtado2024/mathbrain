(() => {
  'use strict';

  const topics = [
    { id: 'algebra', title: 'Álgebra', color: 'purple', symbol: 'x²' },
    { id: 'calculo', title: 'Cálculo', color: 'blue', symbol: '∫' },
    { id: 'probabilidad', title: 'Probabilidad', color: 'sand', symbol: 'P(A)' },
    { id: 'estadistica', title: 'Estadística', color: 'green', symbol: 'x̄' },
    { id: 'trigonometria', title: 'Trigonometría', color: 'rose', symbol: 'θ' }
  ];
  const formats = {
    explanation: { title: 'Explicación', icon: 'book', action: 'Entender la idea' },
    simulation: { title: 'Simulación', icon: 'simulation', action: 'Experimentar' },
    exercise: { title: 'Ejercicio resuelto', icon: 'exercise', action: 'Ver paso a paso' }
  };
  // Las explicaciones se escriben en content/<curso>/*.md y llegan compiladas en dist/content.js.
  const courses = window.MATHBRAIN_COURSES;
  const lessons = window.MATHBRAIN_CONTENT || [];
  for (const course of courses) course.lessons = lessons.filter(lesson => lesson.courseId === course.id);
  const resources = courses.flatMap(course => course.lessons.map((lesson, index) => ({ id: lesson.id, type: 'explanation', courseId: course.id, lessonIndex: index, topic: course.id === 'probabilidad' ? 'probabilidad' : course.category, color: course.color, art: course.art, level: course.level, title: lesson.title, description: lesson.description, key: lesson.key, html: lesson.html, practice: lesson.exercises, tags: lesson.tags, video: lesson.video })));
  const simulations = [
    { id: 'sim-derivada', courseId: 'calculo-diferencial', title: 'Mueve el punto. Descubre la derivada.', description: 'Una curva, una tangente y el cambio en tus manos.', tags: 'derivada derivadas tangente pendiente tasa cambio', simulation: 'derivative', key: 'En f(x) = x², la pendiente de la tangente en cada punto es f′(x) = 2x.' },
    { id: 'sim-riemann', courseId: 'calculo-integral', title: 'Construye un área, rectángulo a rectángulo', description: 'Cambia las piezas y acércate a la idea de integral.', tags: 'integral integrales riemann area rectangulos acumulacion', simulation: 'riemann', key: 'La integral de x² en [0,1] vale 1/3. Las sumas de Riemann se aproximan a ese valor.' },
    { id: 'sim-circulo', courseId: 'trigonometria', title: 'Dale una vuelta al seno y al coseno', description: 'Gira un ángulo y conecta el círculo con sus coordenadas.', tags: 'circulo unitario seno coseno angulos grados radianes', simulation: 'circle', key: 'En un círculo de radio 1, las coordenadas del punto son (cos θ, sen θ).' },
    { id: 'sim-azar', courseId: 'probabilidad', title: '¿El azar tiene patrones?', description: 'Lanza una moneda virtual y observa la frecuencia de caras.', tags: 'azar moneda probabilidad frecuencia ley grandes numeros', simulation: 'probability', key: 'En lanzamientos independientes con la misma probabilidad de cara p, la frecuencia relativa tiende a p al aumentar el número de ensayos. No tiene que acercarse en cada paso.' },
    { id: 'sim-sistema', courseId: 'algebra', title: '¿Dónde se cruzan dos rectas?', description: 'Cambia una pendiente y descubre cuántas soluciones tiene un sistema.', tags: 'sistemas sistema ecuaciones rectas interseccion cruce pendiente solucion lineal', simulation: 'system', key: 'La solución de un sistema de dos ecuaciones lineales es el punto común de sus rectas. Si las rectas son paralelas y distintas, el sistema no tiene solución.' },
    { id: 'sim-intervalos', courseId: 'inferencia-estadistica', title: '¿Qué significa «95 % de confianza»?', description: 'Toma muestras, construye intervalos y cuenta cuántos atrapan la media real.', tags: 'intervalo intervalos confianza media muestra cobertura estimacion margen error', simulation: 'confidence', key: 'Un procedimiento del 95 % produce intervalos que contienen el parámetro en cerca del 95 % de las repeticiones. Cada intervalo ya calculado lo contiene o no lo contiene.' }
  ];
  const exercises = [
    { id: 'ej-ecuacion', courseId: 'algebra', title: 'Resuelve una ecuación sin perder el equilibrio', description: 'Despeja la incógnita y comprueba cada paso.', tags: 'ecuacion ecuaciones primer grado resolver despejar lineal', statement: 'Resuelve 3(x − 2) + 4 = 19. Encuentra x y verifica el resultado en la ecuación original.', key: 'Lo que haces en un miembro de la igualdad también debes hacerlo en el otro.', steps: [
      { title: 'Aplica la distributiva', text: 'Multiplica el 3 por cada término del paréntesis.', equation: '3x − 6 + 4 = 19' },
      { title: 'Agrupa las constantes', text: 'Suma −6 + 4 en el miembro izquierdo.', equation: '3x − 2 = 19' },
      { title: 'Aísla la incógnita', text: 'Suma 2 a ambos lados y divide entre 3.', equation: '3x = 21  →  x = 7' },
      { title: 'Comprueba', text: 'Sustituye 7 en la ecuación inicial. Ambos lados son iguales.', equation: '3(7 − 2) + 4 = 15 + 4 = 19' }
    ], answer: 'x = 7', check: { label: 'Valor de x', value: 7 } },
    { id: 'ej-derivada', courseId: 'calculo-diferencial', title: 'De la función a su recta tangente', description: 'Deriva un polinomio y construye la tangente en x = 1.', tags: 'derivadas derivada tangente polinomio pendiente ecuacion', statement: 'Para f(x) = x² + 3x, encuentra la ecuación de la recta tangente a la gráfica en x = 1.', key: 'La tangente pasa por (a, f(a)) y tiene pendiente f′(a): y − f(a) = f′(a)(x − a).', steps: [
      { title: 'Ubica el punto', text: 'Evalúa la función en x = 1 para obtener la altura.', equation: 'f(1) = 1² + 3·1 = 4  →  (1,4)' },
      { title: 'Calcula la pendiente', text: 'Deriva cada término y evalúa en 1.', equation: 'f′(x) = 2x + 3  →  f′(1) = 5' },
      { title: 'Escribe la recta', text: 'Usa la forma punto-pendiente y simplifica.', equation: 'y − 4 = 5(x − 1)  →  y = 5x − 1' }
    ], answer: 'La recta tangente es y = 5x − 1.', check: { label: 'Pendiente de la tangente en x = 1', value: 5 } },
    { id: 'ej-bayes', courseId: 'probabilidad', title: 'Bayes con una tabla de piezas', description: 'Encuentra de dónde viene una pieza defectuosa.', tags: 'bayes probabilidad condicional eventos tabla', statement: 'La máquina A fabrica el 60 % de las piezas y tiene un 2 % de defectos. La máquina B fabrica el 40 % y tiene un 5 % de defectos. Elegimos una pieza al azar y resulta defectuosa. ¿Cuál es la probabilidad de que venga de B?', key: 'P(B | defecto) = P(defecto | B)·P(B) / P(defecto).', steps: [
      { title: 'Imagina 1.000 piezas', text: 'A produce 600 piezas y B produce 400. Es una tabla de frecuencias esperadas, no un conteo observado.', equation: 'A: 1.000·0,60 = 600;  B: 1.000·0,40 = 400' },
      { title: 'Cuenta los defectos esperados', text: 'Aplica la tasa de defectos de cada máquina.', equation: 'A: 600·0,02 = 12;  B: 400·0,05 = 20' },
      { title: 'Cambia el universo de referencia', text: 'Entre las 32 piezas defectuosas esperadas, 20 vienen de B.', equation: 'P(B | defecto) = 20/(12 + 20) = 0,625' }
    ], answer: 'La probabilidad es 62,5 %.', check: { label: 'P(B | defecto)', value: .625, percent: true } },
    { id: 'ej-error-estandar', courseId: 'inferencia-estadistica', title: 'Calcula e interpreta el error estándar', description: 'Distingue la variación de los datos y la de sus medias.', tags: 'media promedio error estandar muestra desviacion estadistica', statement: 'Una población tiene desviación estándar σ = 12. Calcula el error estándar de la media para una muestra aleatoria de 36 observaciones independientes. ¿Qué pasa si aumentas el tamaño a 144?', key: 'Bajo independencia y varianza común finita, EE(x̄) = σ/√n.', steps: [
      { title: 'Identifica las cantidades', text: 'σ describe la variabilidad individual; n es el tamaño de la muestra.', equation: 'σ = 12;  n = 36' },
      { title: 'Aplica la fórmula', text: 'Divide la desviación estándar entre la raíz del tamaño de muestra.', equation: 'EE = 12/√36 = 12/6 = 2' },
      { title: 'Compara los tamaños', text: 'Cuadruplicar el tamaño reduce a la mitad el error estándar. No reduce la desviación estándar de los datos individuales.', equation: 'EE nuevo = 12/√144 = 12/12 = 1' }
    ], answer: 'El error estándar pasa de 2 a 1, en las unidades de la variable.', check: { label: 'Error estándar con n = 36', value: 2 } },
    { id: 'ej-triangulo', courseId: 'trigonometria', title: 'Encuentra el cateto que falta', description: 'Del ángulo y la hipotenusa a una longitud.', tags: 'seno coseno tangente triangulo hipotenusa angulo', statement: 'Un triángulo rectángulo tiene una hipotenusa de 10 cm y un ángulo agudo de 30°. ¿Cuánto mide el cateto opuesto a ese ángulo?', key: 'sen θ = cateto opuesto / hipotenusa.', steps: [
      { title: 'Elige la razón', text: 'Conoces la hipotenusa y buscas el cateto opuesto: usa el seno.', equation: 'sen 30° = opuesto/10' },
      { title: 'Despeja la longitud', text: 'Multiplica ambos lados por 10. El seno de 30° es 1/2.', equation: 'opuesto = 10·sen 30° = 10·0,5 = 5' },
      { title: 'Interpreta', text: 'El cateto resulta menor que la hipotenusa, como debe ocurrir en un triángulo rectángulo.', equation: '5 cm < 10 cm' }
    ], answer: 'El cateto opuesto mide 5 cm.', check: { label: 'Cateto opuesto, en cm', value: 5 } },
    { id: 'ej-integral', courseId: 'calculo-integral', title: 'Calcula el área bajo una parábola', description: 'Una primitiva, dos extremos y una acumulación.', tags: 'integral integrales area parabola primitiva teorema fundamental', statement: 'Calcula el área entre la gráfica de f(x) = x² y el eje horizontal en el intervalo [0,2].', key: 'Si la función es continua y no negativa, la integral definida coincide con el área geométrica bajo su gráfica.', steps: [
      { title: 'Plantea la integral', text: 'Como x² no es negativa, no necesitas separar regiones por signos.', equation: 'Área = ∫₀² x² dx' },
      { title: 'Busca una primitiva', text: 'Aumenta el exponente en uno y divide entre el nuevo exponente.', equation: 'F(x) = x³/3, porque F′(x) = x²' },
      { title: 'Evalúa en los extremos', text: 'Resta el valor en el extremo inferior al valor en el superior.', equation: 'F(2) − F(0) = 8/3 − 0 = 8/3' }
    ], answer: 'El área es 8/3 ≈ 2,667 unidades cuadradas.', check: { label: 'Área', value: 8 / 3, tolerance: .01 } }
  ];
  for (const [type, entries] of [['simulation', simulations], ['exercise', exercises]]) {
    for (const entry of entries) {
      const course = courses.find(candidate => candidate.id === entry.courseId);
      resources.push({ ...entry, type, topic: course.id === 'probabilidad' ? 'probabilidad' : course.category, level: course.level, art: course.art, color: course.color });
    }
  }
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const synonyms = { derivadas: 'derivada', integrales: 'integral', limites: 'limite', ecuaciones: 'ecuacion', funciones: 'funcion', simulaciones: 'simulacion', explicaciones: 'explicacion', ejercicios: 'ejercicio', resueltos: 'resuelto', angulos: 'angulo', ondas: 'onda', muestras: 'muestra', probabilidades: 'probabilidad' };
  const stopwords = new Set(['como', 'que', 'es', 'el', 'la', 'los', 'las', 'de', 'del', 'una', 'un', 'y', 'en', 'para', 'con']);
  const tokenize = value => normalize(value).split(/[^a-z0-9]+/).filter(Boolean).map(term => synonyms[term] || term);
  const searchIndex = new Map(resources.map(resource => [resource.id, tokenize([resource.title, resource.description, resource.tags, resource.key, formats[resource.type].title, topics.find(topic => topic.id === resource.topic).title].join(' ')).join(' ')]));

  function search({ query = '', type = 'all', topic = 'all', level = 'all', ids = null } = {}) {
    const terms = tokenize(query).filter(term => !stopwords.has(term));
    return resources.filter(resource => (type === 'all' || resource.type === type) && (topic === 'all' || resource.topic === topic) && (level === 'all' || resource.level === level) && (!ids || ids.has(resource.id)) && terms.every(term => searchIndex.get(resource.id).includes(term))).sort((first, second) => {
      const score = resource => terms.reduce((total, term) => total + (tokenize(resource.title).join(' ').includes(term) ? 2 : 0), 0);
      return score(second) - score(first);
    });
  }

  function riemannSum(count, method = 'midpoint') {
    const rectangles = Math.max(1, Math.min(1000, Math.round(count)));
    const offset = method === 'left' ? 0 : method === 'right' ? 1 : .5;
    return Array.from({ length: rectangles }, (_, index) => ((index + offset) / rectangles) ** 2 / rectangles).reduce((total, area) => total + area, 0);
  }

  function unitCircle(degrees) {
    const angle = degrees * Math.PI / 180;
    const clean = value => Math.abs(value) < 1e-12 ? 0 : value;
    return { sine: clean(Math.sin(angle)), cosine: clean(Math.cos(angle)), radians: angle };
  }

  function coinExperiment(probability, count, random = Math.random) {
    return Array.from({ length: count }, () => random() < probability ? 1 : 0);
  }

  function lineIntersection(firstSlope, firstIntercept, secondSlope, secondIntercept) {
    if (Math.abs(firstSlope - secondSlope) < 1e-12) return { solutions: Math.abs(firstIntercept - secondIntercept) < 1e-12 ? Infinity : 0 };
    const x = (secondIntercept - firstIntercept) / (firstSlope - secondSlope);
    return { solutions: 1, x, y: firstSlope * x + firstIntercept };
  }

  function standardNormal(random = Math.random) {
    let uniform = random();
    while (uniform <= 0) uniform = random();
    return Math.sqrt(-2 * Math.log(uniform)) * Math.cos(2 * Math.PI * random());
  }

  function confidenceIntervals({ mean = 50, deviation = 10, size = 25, count = 20, z = 1.96, random = Math.random } = {}) {
    const margin = z * deviation / Math.sqrt(size);
    return Array.from({ length: count }, () => {
      let total = 0;
      for (let index = 0; index < size; index += 1) total += mean + deviation * standardNormal(random);
      const center = total / size;
      return { center, lower: center - margin, upper: center + margin, covers: center - margin <= mean && mean <= center + margin };
    });
  }

  function parseAnswer(value) {
    const text = normalize(value).replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/^[a-z]+=/, '').replace(/(cm|u2|unidades.*)$/, '');
    const percent = text.endsWith('%');
    const clean = (percent ? text.slice(0, -1) : text).replace(/,/g, '.');
    const parts = clean.match(/^(-?\d+(?:\.\d+)?)(?:\/(-?\d+(?:\.\d+)?))?$/);
    if (!parts || Number(parts[2]) === 0) return null;
    const number = Number(parts[1]) / (parts[2] === undefined ? 1 : Number(parts[2]));
    return percent ? number / 100 : number;
  }

  function checkAnswer(check, value) {
    const parsed = parseAnswer(value);
    if (parsed === null) return null;
    const tolerance = check.tolerance ?? 1e-6;
    const candidates = check.percent ? [parsed, parsed / 100] : [parsed];
    return candidates.some(candidate => Math.abs(candidate - check.value) <= tolerance);
  }

  window.MATHBRAIN_LIBRARY = { topics, formats, resources, search, normalize, riemannSum, unitCircle, coinExperiment, lineIntersection, confidenceIntervals, parseAnswer, checkAnswer };
})();
