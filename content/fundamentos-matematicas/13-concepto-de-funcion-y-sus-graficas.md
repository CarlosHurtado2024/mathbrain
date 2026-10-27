---
titulo: Concepto de función y sus gráficas
descripcion: Dominio, rango, gráficas, funciones pares e impares y transformaciones.
unidad: Unidad 3 · Funciones
modulo: 3.2
video:
etiquetas: funcion funciones dominio rango grafica par impar transformaciones desplazamiento a trozos recta vertical algebra
---

## Primero, la intuición

Una función es una regla que asigna **exactamente una** salida a cada entrada de su dominio. Puede darse con una fórmula, una tabla, una gráfica o una descripción verbal. En una gráfica, la **prueba de la recta vertical** lo comprueba: ninguna recta vertical puede cortarla en más de un punto.

El **dominio** reúne las entradas permitidas: en los reales no se divide entre cero ni se saca raíz par de un negativo. El **rango** reúne las salidas que se obtienen.

## Simetrías y transformaciones

$$\text{Par: } f(-x) = f(x), \qquad \text{Impar: } f(-x) = -f(x).$$

Una función par es simétrica respecto al eje $y$ y una impar, respecto al origen. A partir de una gráfica conocida se obtienen otras:

$$y = a\,f\big(b(x - h)\big) + k.$$

Aquí $h$ desplaza horizontalmente, $k$ verticalmente, $|a|$ estira o comprime y $a < 0$ refleja respecto al eje $x$. La **rapidez de cambio promedio** en $[a, b]$ es $\dfrac{f(b) - f(a)}{b - a}$.

:::idea
Una función asigna una sola salida a cada entrada de su dominio. Su gráfica puede trasladarse, estirarse y reflejarse cambiando los parámetros de $y = a\,f(b(x - h)) + k$.
:::

:::ejemplo
$y = -2(x - 1)^2 + 3$ se obtiene de $y = x^2$: se desplaza $1$ a la derecha, se estira por $2$, se refleja respecto al eje $x$ y sube $3$. Su vértice es $(1, 3)$ y abre hacia abajo, así que su valor máximo es $3$.
:::

## Practica

:::ejercicio
¿Cuál es el dominio de $f(x) = \dfrac{\sqrt{4 - x}}{x^2 - 1}$?
- [ ] $x \le 4$
- [x] $x \le 4$, con $x \ne 1$ y $x \ne -1$
- [ ] $x \ge 4$, con $x \ne \pm 1$
solucion: La raíz exige $4 - x \ge 0$, es decir, $x \le 4$. El denominador se anula en $x = \pm 1$.
:::

:::ejercicio
Para $f(x) = \begin{cases} x + 2, & x < 0 \\ x^2, & x \ge 0 \end{cases}$, calcula $f(-3) + f(2)$.
respuesta: 3
pista: $-3 < 0$ usa la primera regla; $2 \ge 0$ usa la segunda.
solucion: $f(-3) = -1$ y $f(2) = 4$. La suma es $3$.
:::

:::ejercicio
¿Cómo es $f(x) = x^3 - x$?
- [ ] Par
- [x] Impar
- [ ] Ni par ni impar
solucion: $f(-x) = -x^3 + x = -(x^3 - x) = -f(x)$.
:::
