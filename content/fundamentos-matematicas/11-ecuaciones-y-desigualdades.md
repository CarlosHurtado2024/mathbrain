---
titulo: Ecuaciones y desigualdades
descripcion: Lineales, cuadráticas, racionales, con radicales y con valor absoluto, y cómo modelar con ellas.
unidad: Unidad 2 · Álgebra fundamental
modulo: 2.6
video:
etiquetas: ecuacion ecuaciones lineal primer grado despejar desigualdades inecuaciones valor absoluto soluciones extranas intervalos modelado algebra
---

## Primero, la intuición

Una ecuación es una balanza: para mantener el equilibrio, haz la misma operación en los dos lados. Sumar, restar, multiplicar o dividir por una cantidad no nula produce una **ecuación equivalente**, con las mismas soluciones.

Otras operaciones pueden **añadir** soluciones falsas. Al elevar al cuadrado o multiplicar por una expresión con $x$, la ecuación nueva puede tener raíces que no cumplen la original. Por eso siempre se comprueba en la ecuación inicial.

## Valor absoluto y desigualdades

$$|X| = a \;(a \ge 0) \iff X = a \text{ o } X = -a,$$

$$|X| < a \iff -a < X < a, \qquad |X| > a \iff X < -a \text{ o } X > a.$$

En las desigualdades hay una regla nueva: **multiplicar o dividir por un número negativo invierte el sentido**. Si $A < B$ y $C < 0$, entonces $CA > CB$. Las desigualdades polinómicas y racionales se resuelven con una tabla de signos de sus factores.

:::idea
Las operaciones que no cambian las soluciones producen ecuaciones equivalentes. Elevar al cuadrado puede introducir soluciones extrañas, y multiplicar una desigualdad por un número negativo invierte su sentido.
:::

:::ejemplo
Para resolver $\sqrt{2x + 3} = x$, eleva al cuadrado: $2x + 3 = x^2$, es decir, $x^2 - 2x - 3 = (x - 3)(x + 1) = 0$. Los candidatos son $3$ y $-1$. Al comprobar, $\sqrt{9} = 3$ funciona, pero $\sqrt{1} = 1 \ne -1$: la única solución es $x = 3$.
:::

## Practica

:::ejercicio
Resuelve $3(x - 2) - \dfrac{2x + 1}{4} = 5$.
respuesta: 4,5
pista: Multiplica todo por $4$ para eliminar el denominador.
solucion: $12x - 24 - 2x - 1 = 20$, así que $10x = 45$ y $x = 4{,}5$.
:::

:::ejercicio
Resuelve $|2x - 5| = 7$. ¿Cuál es la solución positiva?
respuesta: 6
pista: $2x - 5 = 7$ o $2x - 5 = -7$.
solucion: Las soluciones son $x = 6$ y $x = -1$.
:::

:::ejercicio
¿Cuál es el conjunto solución de $x^2 - x - 6 < 0$?
- [x] $(-2, 3)$
- [ ] $(-\infty, -2) \cup (3, \infty)$
- [ ] $(-3, 2)$
solucion: $x^2 - x - 6 = (x - 3)(x + 2)$ es negativo entre sus raíces $-2$ y $3$.
:::

:::ejercicio
El producto de dos números impares consecutivos positivos es $143$. ¿Cuál es el menor?
respuesta: 11
pista: Llámalos $n$ y $n + 2$: $n(n + 2) = 143$.
solucion: $n^2 + 2n - 143 = (n - 11)(n + 13) = 0$. La solución positiva es $n = 11$: los números son $11$ y $13$.
:::
