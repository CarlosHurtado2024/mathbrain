---
titulo: Gráficas de las funciones trigonométricas
descripcion: Amplitud, periodo, desfase y desplazamiento vertical; modelos de fenómenos periódicos.
unidad: Unidad 4 · Trigonometría
modulo: 4.4
video:
etiquetas: graficas seno coseno tangente amplitud periodo frecuencia desfase fase ondas sinusoidal trigonometria
---

## Primero, la intuición

Al girar el punto $(\cos t, \sen t)$ alrededor de la circunferencia, su altura sube y baja: esa altura dibujada contra $t$ es la onda seno. Se repite cada $2\pi$ y oscila entre $-1$ y $1$. Al cambiar los parámetros, la onda se estira, se comprime y se desplaza.

## Los parámetros de una onda

$$y = a\sen(bx - c) + d, \qquad y = a\cos(bx - c) + d \qquad (b > 0).$$

- **Amplitud** $|a|$: la distancia de la línea media a un máximo.
- **Periodo** $\dfrac{2\pi}{b}$: la longitud de un ciclo completo.
- **Desfase** $\dfrac{c}{b}$: cuánto se traslada la onda horizontalmente.
- **Línea media** $y = d$; el rango es $[d - |a|, d + |a|]$.

La tangente tiene periodo $\pi$ y asíntotas verticales en $x = \tfrac{\pi}{2} + k\pi$. La secante y la cosecante se dibujan a partir del coseno y del seno.

:::idea
En $y = a\sen(bx - c) + d$, la amplitud es $|a|$, el periodo $\dfrac{2\pi}{b}$, el desfase $\dfrac{c}{b}$ y la línea media $y = d$.
:::

:::ejemplo
Para $y = 3\sen\left(2x - \tfrac{\pi}{3}\right) + 1$: la amplitud es $3$, el periodo $\tfrac{2\pi}{2} = \pi$, el desfase $\tfrac{\pi/3}{2} = \tfrac{\pi}{6}$ hacia la derecha y el rango $[1 - 3, 1 + 3] = [-2, 4]$.
:::

## Practica

:::ejercicio
¿Cuál es el valor máximo de $y = 3\sen\left(2x - \tfrac{\pi}{3}\right) + 1$?
respuesta: 4
pista: El máximo es $d + |a|$.
solucion: $1 + 3 = 4$.
:::

:::ejercicio
Una función $y = a\sen(bx) + d$ tiene máximo $5$, mínimo $-1$ y periodo $8$. ¿Cuánto vale $d$?
respuesta: 2
pista: La línea media está en el punto medio entre el máximo y el mínimo.
solucion: $d = \tfrac{5 + (-1)}{2} = 2$. Además, $a = 3$ y $b = \tfrac{2\pi}{8} = \tfrac{\pi}{4}$.
:::

:::ejercicio
¿Qué periodo tiene $y = \tan\left(x - \tfrac{\pi}{4}\right)$?
- [ ] $2\pi$
- [x] $\pi$
- [ ] $\tfrac{\pi}{4}$
solucion: La tangente tiene periodo $\pi$, y un desfase no cambia el periodo. Sus asíntotas se trasladan a $x = \tfrac{3\pi}{4} + k\pi$.
:::
