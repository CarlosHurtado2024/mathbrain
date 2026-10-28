---
titulo: Límites: acercarse a una idea
descripcion: Observa qué sucede cuando dos puntos de una curva se acercan.
unidad: Módulo 1 · El cambio y los límites
video: 
etiquetas: limites limite continuidad indeterminacion
---

## Primero, la intuición

Un límite pregunta a qué valor se aproxima la salida cuando la entrada se acerca a un punto. Puedes acercarte por la izquierda y por la derecha; para tener un límite bilateral, ambos caminos deben llevar al mismo valor.

El valor de la función en ese punto es otra pregunta. Una gráfica puede tener un hueco y aun así aproximarse a una altura bien definida. Sustituir directamente funciona para funciones continuas, pero no resuelve todas las indeterminaciones.

:::idea
Un límite describe el valor al que se aproxima una función. Ese valor puede existir aunque la función no esté definida en el punto.
:::

:::ejemplo
Para x ≠ 1, (x² − 1)/(x − 1) = x + 1. Aunque la fracción no está definida en 1, cuando x se acerca a 1 su valor se acerca a 2.
:::

## Practica

:::ejercicio
Calcula $\displaystyle\lim_{x \to 3} \frac{x^2 - 9}{x - 3}$.
respuesta: 6
pista: Factoriza el numerador: $x^2 - 9 = (x - 3)(x + 3)$.
solucion: Para $x \ne 3$, la fracción vale $x + 3$. Cuando $x \to 3$, se acerca a $6$.
:::

:::ejercicio
Calcula $\displaystyle\lim_{x \to 2} (3x + 1)$.
respuesta: 7
pista: La función es continua: puedes sustituir directamente.
solucion: $3 \cdot 2 + 1 = 7$.
:::

:::ejercicio
Cerca de $x = a$, una función se acerca a $1$ por la izquierda y a $4$ por la derecha. ¿Qué podemos decir?
- [x] El límite bilateral en $a$ no existe.
- [ ] El límite vale $2{,}5$, el promedio.
- [ ] El límite vale $4$.
solucion: Para que exista el límite bilateral, los dos caminos deben llevar al mismo valor. Aquí llevan a valores distintos.
:::
