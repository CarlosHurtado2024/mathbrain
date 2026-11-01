---
titulo: Combinaciones y permutaciones
descripcion: Principios de conteo, permutaciones y combinaciones.
unidad: Módulo 1 · Contar y medir el azar
video: 
etiquetas: conteo contar combinaciones permutaciones factorial
---

## Primero, la intuición

El principio multiplicativo conecta decisiones sucesivas. Si hay 3 camisetas y 2 pantalones, puedes formar 3·2 = 6 combinaciones de ropa.

Cuando eliges elementos distintos sin repetir, pregunta si importa el orden. Para ordenar r de n elementos hay n!/(n − r)! posibilidades. Si el orden no importa, divide además entre r!: obtienes las combinaciones.

:::idea
Si hay n opciones para una etapa y m para otra, hay n·m pares de opciones. Las combinaciones cuentan selecciones sin considerar el orden.
:::

:::ejemplo
Para elegir 2 personas entre 5 sin asignar cargos, C(5,2) = 5!/(2!·3!) = 10. Si una será presidenta y la otra secretaria, hay 5·4 = 20 opciones.
:::

:::visual
{
  "engine": "p5",
  "scene": "galton",
  "text": "En el tablero de Galton, cada bola elige izquierda o derecha en cada fila. Para llegar a la casilla $k$ hay $\\binom{n}{k}$ caminos: por eso el centro se llena más.",
  "caption": "La curva punteada es lo que predicen las combinaciones."
}
:::

## Practica

:::ejercicio
¿De cuántas formas se pueden elegir $2$ personas entre $6$, sin asignar cargos?
respuesta: 15
pista: Usa $C(6,2) = \dfrac{6!}{2! \cdot 4!}$.
solucion: $C(6,2) = \dfrac{6 \cdot 5}{2} = 15$.
:::

:::ejercicio
En una carrera con $5$ corredores, ¿de cuántas formas se pueden repartir oro, plata y bronce?
respuesta: 60
pista: El orden importa: $5$ opciones para el oro, $4$ para la plata y $3$ para el bronce.
solucion: $5 \cdot 4 \cdot 3 = 60$.
:::

:::ejercicio
Quieres formar un comité de $3$ personas entre $10$, sin cargos. ¿Qué cuentas?
- [x] Combinaciones
- [ ] Permutaciones :: En un comité sin cargos el orden no importa; las permutaciones cuentan ordenaciones distintas.
- [ ] Variaciones con repetición :: Una misma persona no puede ocupar dos puestos y el orden no importa.
solucion: El orden no importa y no se repiten personas: son combinaciones, $C(10,3) = 120$.
:::
