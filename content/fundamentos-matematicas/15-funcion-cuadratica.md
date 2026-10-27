---
titulo: Función cuadrática y ecuaciones cuadráticas
descripcion: Vértice, fórmula general, discriminante, relaciones de Vieta y optimización.
unidad: Unidad 3 · Funciones
modulo: 3.4
video:
etiquetas: cuadratica parabola vertice formula general discriminante vieta raices optimizacion ecuacion cuadratica funciones
---

## Primero, la intuición

La gráfica de $f(x) = ax^2 + bx + c$ es una parábola. Completando el cuadrado aparece su forma estándar, que muestra directamente el vértice:

$$f(x) = a\left(x + \frac{b}{2a}\right)^2 + c - \frac{b^2}{4a}, \qquad \text{vértice: } \left(-\frac{b}{2a},\, f\!\left(-\frac{b}{2a}\right)\right).$$

Si $a > 0$ la parábola abre hacia arriba y el vértice es un mínimo; si $a < 0$, abre hacia abajo y el vértice es un máximo.

## La fórmula general

Al resolver $ax^2 + bx + c = 0$ completando el cuadrado se obtiene:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}.$$

El **discriminante** $\Delta = b^2 - 4ac$ indica cuántas raíces reales hay: dos si $\Delta > 0$, una doble si $\Delta = 0$ y ninguna si $\Delta < 0$. Las raíces cumplen las relaciones de Vieta:

$$r_1 + r_2 = -\frac{b}{a}, \qquad r_1 r_2 = \frac{c}{a}.$$

:::idea
El vértice de una parábola está en $x = -\dfrac{b}{2a}$. Las raíces de $ax^2 + bx + c = 0$ son $\dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$, y el discriminante decide cuántas son reales.
:::

:::ejemplo
$f(x) = -2x^2 + 8x - 5 = -2(x - 2)^2 + 3$. El vértice es $(2, 3)$, la parábola abre hacia abajo, el valor máximo es $3$ y el rango es $(-\infty, 3]$.
:::

## Practica

:::ejercicio
¿Para qué valor positivo de $k$ la ecuación $x^2 + kx + 9 = 0$ tiene una raíz doble?
respuesta: 6
pista: Raíz doble significa $\Delta = 0$.
solucion: $k^2 - 36 = 0$, así que $k = \pm 6$. El valor positivo es $6$.
:::

:::ejercicio
Si $r_1$ y $r_2$ son las raíces de $2x^2 - 6x + 1 = 0$, calcula $r_1^2 + r_2^2$ sin resolver la ecuación.
respuesta: 8
pista: $r_1^2 + r_2^2 = (r_1 + r_2)^2 - 2r_1 r_2$.
solucion: $r_1 + r_2 = 3$ y $r_1 r_2 = \tfrac{1}{2}$, así que $9 - 1 = 8$.
:::

:::ejercicio
Con $60$ m de cerca se quiere encerrar un terreno rectangular. ¿Cuál es el área máxima, en m²?
respuesta: 225
pista: Si un lado mide $x$, el otro mide $30 - x$ y el área es $A(x) = x(30 - x)$.
solucion: El vértice de $A(x) = -x^2 + 30x$ está en $x = 15$: un cuadrado de $15 \times 15$, con área $225$ m².
:::
