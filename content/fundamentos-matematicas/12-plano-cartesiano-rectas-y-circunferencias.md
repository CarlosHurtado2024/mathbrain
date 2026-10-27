---
titulo: Plano cartesiano, rectas y circunferencias
descripcion: Distancias, puntos medios, ecuaciones de la recta y de la circunferencia.
unidad: Unidad 3 · Funciones
modulo: 3.1
video:
etiquetas: plano cartesiano distancia punto medio recta rectas pendiente paralelas perpendiculares circunferencia sistemas ecuaciones algebra
---

## Primero, la intuición

El plano cartesiano convierte la geometría en álgebra: cada punto es un par $(x, y)$ y cada figura, una ecuación. La distancia entre dos puntos es el teorema de Pitágoras aplicado a sus diferencias horizontal y vertical:

$$d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}, \qquad M = \left(\frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2}\right).$$

## Rectas y circunferencias

La **pendiente** mide cuánto sube una recta por cada unidad que avanza:

$$m = \frac{y_2 - y_1}{x_2 - x_1}, \qquad y - y_1 = m(x - x_1), \qquad y = mx + b.$$

Dos rectas son **paralelas** si $m_1 = m_2$ y **perpendiculares** si $m_1 m_2 = -1$. Resolver un sistema de dos ecuaciones lineales es encontrar dónde se cruzan sus rectas.

Una **circunferencia** de centro $(h, k)$ y radio $r$ reúne los puntos a distancia $r$ del centro:

$$(x - h)^2 + (y - k)^2 = r^2.$$

:::idea
La distancia es Pitágoras en coordenadas. Una recta queda determinada por un punto y su pendiente; las paralelas tienen la misma pendiente y las perpendiculares cumplen $m_1 m_2 = -1$.
:::

:::ejemplo
Para hallar el centro y el radio de $x^2 + y^2 - 6x + 4y - 3 = 0$, completa cuadrados: $(x^2 - 6x + 9) + (y^2 + 4y + 4) = 3 + 9 + 4$, es decir, $(x - 3)^2 + (y + 2)^2 = 16$. El centro es $(3, -2)$ y el radio, $4$.
:::

## Practica

:::ejercicio
Halla la distancia entre $A(-2, 3)$ y $B(4, -5)$.
respuesta: 10
pista: Las diferencias son $6$ y $-8$.
solucion: $d = \sqrt{6^2 + 8^2} = \sqrt{100} = 10$.
:::

:::ejercicio
¿Qué pendiente tiene una recta perpendicular a $2x - 3y = 6$?
respuesta: -3/2
pista: Despeja $y$ para ver la pendiente de la recta dada.
solucion: $y = \tfrac{2}{3}x - 2$ tiene pendiente $\tfrac{2}{3}$. La perpendicular tiene pendiente $-\tfrac{3}{2}$, porque $\tfrac{2}{3} \cdot \left(-\tfrac{3}{2}\right) = -1$.
:::

:::ejercicio
¿Cuántas soluciones tiene el sistema $y = 2x + 1$, $y = 2x - 4$?
- [x] Ninguna
- [ ] Una
- [ ] Infinitas
solucion: Las rectas tienen la misma pendiente y distinto intercepto: son paralelas y distintas, así que nunca se cruzan.
:::
