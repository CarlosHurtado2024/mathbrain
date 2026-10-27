---
titulo: Progresiones aritméticas y geométricas
descripcion: Sucesiones que suman o multiplican siempre lo mismo, sus términos, sus sumas y las series infinitas.
unidad: Unidad 1 · Números reales y aritmética
modulo: 1.4
video:
etiquetas: progresion progresiones aritmetica geometrica sucesion serie geometrica gauss termino general suma aritmetica
---

## Primero, la intuición

En una **progresión aritmética (PA)** cada término se obtiene sumando la misma diferencia $d$: $7, 11, 15, 19, \dots$ En una **progresión geométrica (PG)** cada término se obtiene multiplicando por la misma razón $r$: $3, 6, 12, 24, \dots$

Gauss sumó $1 + 2 + \dots + 100$ emparejando el primero con el último: cada par suma $101$ y hay $50$ pares. Esa idea da la suma de cualquier PA.

## Términos y sumas

$$\text{PA: } a_n = a_1 + (n - 1)d, \qquad S_n = \frac{n}{2}(a_1 + a_n).$$

$$\text{PG: } a_n = a_1 r^{n-1}, \qquad S_n = a_1 \frac{1 - r^n}{1 - r} \;(r \ne 1).$$

Si $|r| < 1$, los términos de una PG se hacen cada vez más pequeños y la suma infinita converge:

$$S_\infty = \frac{a_1}{1 - r}, \qquad |r| < 1.$$

:::idea
Una PA suma una diferencia constante: $a_n = a_1 + (n - 1)d$. Una PG multiplica por una razón constante: $a_n = a_1 r^{n-1}$. Si $|r| < 1$, la serie geométrica infinita suma $\dfrac{a_1}{1 - r}$.
:::

:::ejemplo
En la PA $7, 11, 15, \dots$ se tiene $a_1 = 7$ y $d = 4$. El término $20$ es $a_{20} = 7 + 19 \cdot 4 = 83$, y la suma de los primeros $20$ términos es $S_{20} = \dfrac{20}{2}(7 + 83) = 900$.
:::

## Practica

:::ejercicio
En una PA, $a_4 = 10$ y $a_{11} = 31$. ¿Cuánto vale la diferencia $d$?
respuesta: 3
pista: Entre $a_4$ y $a_{11}$ hay $7$ diferencias.
solucion: $31 - 10 = 7d$, así que $d = 3$ y $a_1 = 10 - 3 \cdot 3 = 1$.
:::

:::ejercicio
Calcula $6 + 2 + \dfrac{2}{3} + \dfrac{2}{9} + \cdots$
respuesta: 9
pista: Es una serie geométrica con $a_1 = 6$ y $r = \tfrac{1}{3}$.
solucion: $S_\infty = \dfrac{6}{1 - 1/3} = \dfrac{6}{2/3} = 9$.
:::

:::ejercicio
Una pelota cae desde $8$ m y en cada rebote sube $\tfrac{3}{4}$ de la altura anterior. ¿Qué distancia total recorre hasta detenerse, en metros?
respuesta: 56
pista: Cada rebote se recorre dos veces: subida y bajada. Las subidas forman una serie con $a_1 = 6$ y $r = \tfrac{3}{4}$.
solucion: $8 + 2 \cdot \dfrac{6}{1 - 3/4} = 8 + 2 \cdot 24 = 56$ m.
:::
