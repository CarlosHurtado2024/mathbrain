---
titulo: Funciones racionales y fracciones parciales
descripcion: Dominio, huecos, asíntotas y descomposición en fracciones parciales.
unidad: Unidad 3 · Funciones
modulo: 3.6
video:
etiquetas: funcion racional asintota asintotas vertical horizontal oblicua huecos fracciones parciales funciones
---

## Primero, la intuición

En $f(x) = \dfrac{p(x)}{q(x)}$ el denominador decide casi todo. Cerca de un cero de $q$ que no se cancela, la función crece sin límite: hay una **asíntota vertical**. Si el factor se cancela con el numerador, la gráfica tiene solo un **hueco**.

Lejos del origen, la comparación de grados decide el comportamiento de $f(x) = \dfrac{a_n x^n + \cdots}{b_m x^m + \cdots}$:

- Si $n < m$, la asíntota horizontal es $y = 0$.
- Si $n = m$, la asíntota horizontal es $y = \dfrac{a_n}{b_m}$.
- Si $n = m + 1$, hay una asíntota oblicua, que se obtiene dividiendo.

## Fracciones parciales

Una fracción racional propia se puede descomponer en fracciones simples, una por cada factor del denominador. Esa descomposición será clave para integrar en cálculo:

$$\frac{P(x)}{(x - a)(x - b)^2(x^2 + c)} = \frac{A}{x - a} + \frac{B}{x - b} + \frac{C}{(x - b)^2} + \frac{Dx + E}{x^2 + c}.$$

:::idea
Los ceros del denominador que no se cancelan dan asíntotas verticales; los que se cancelan, huecos. Los grados del numerador y del denominador deciden la asíntota horizontal u oblicua.
:::

:::ejemplo
$r(x) = \dfrac{2x^2 - 8}{x^2 - x - 6} = \dfrac{2(x - 2)(x + 2)}{(x - 3)(x + 2)}$. Tiene un hueco en $x = -2$, una asíntota vertical en $x = 3$ y, como los grados son iguales, la asíntota horizontal $y = \tfrac{2}{1} = 2$.
:::

## Practica

:::ejercicio
La asíntota oblicua de $f(x) = \dfrac{x^2 + 3x + 1}{x - 1}$ es $y = x + b$. ¿Cuánto vale $b$?
respuesta: 4
pista: Divide: el cociente es la asíntota.
solucion: $x^2 + 3x + 1 = (x - 1)(x + 4) + 5$, así que $f(x) = x + 4 + \dfrac{5}{x - 1}$ y la asíntota es $y = x + 4$.
:::

:::ejercicio
Si $\dfrac{5x - 1}{x^2 - x - 2} = \dfrac{A}{x - 2} + \dfrac{B}{x + 1}$, ¿cuánto vale $A$?
respuesta: 3
pista: $5x - 1 = A(x + 1) + B(x - 2)$. Evalúa en $x = 2$.
solucion: Con $x = 2$: $9 = 3A$, así que $A = 3$. Con $x = -1$: $-6 = -3B$, así que $B = 2$.
:::

:::ejercicio
¿Qué ocurre en $x = -2$ con $r(x) = \dfrac{2x^2 - 8}{x^2 - x - 6}$?
- [ ] Hay una asíntota vertical
- [x] Hay un hueco
- [ ] La función vale $0$
solucion: El factor $x + 2$ se cancela, así que la gráfica tiene un hueco en $x = -2$, no una asíntota.
:::
