---
titulo: Sumatoria y productoria
descripcion: La notación Σ y Π, sus propiedades, las sumas notables y las sumas telescópicas.
unidad: Unidad 1 · Números reales y aritmética
modulo: 1.5
video:
etiquetas: sumatoria productoria sigma notacion suma telescopica sumas notables factorial aritmetica
---

## Primero, la intuición

Escribir $1 + 2 + 3 + \dots + 100$ es largo. La notación sigma lo resume indicando el término general y los límites del índice:

$$\sum_{k=1}^{100} k = 1 + 2 + \dots + 100.$$

El índice $k$ es una variable muda: $\sum_{k=1}^{n} k$ y $\sum_{j=1}^{n} j$ representan la misma suma. Del mismo modo, $\prod$ abrevia productos: $\prod_{k=1}^{n} k = n!$.

## Propiedades y sumas notables

$$\sum_{k=1}^{n} (c\,a_k + b_k) = c\sum_{k=1}^{n} a_k + \sum_{k=1}^{n} b_k, \qquad \sum_{k=1}^{n} c = nc.$$

$$\sum_{k=1}^{n} k = \frac{n(n+1)}{2}, \qquad \sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6}, \qquad \sum_{k=1}^{n} k^3 = \left[\frac{n(n+1)}{2}\right]^2.$$

En una **suma telescópica** los términos intermedios se cancelan:

$$\sum_{k=1}^{n} (a_{k+1} - a_k) = a_{n+1} - a_1.$$

:::idea
La sumatoria es lineal: las constantes salen y las sumas se separan. Con las sumas notables y la propiedad telescópica se evalúan sumas largas sin sumar término a término.
:::

:::ejemplo
$\displaystyle\sum_{k=1}^{20} (3k - 2) = 3\sum_{k=1}^{20} k - \sum_{k=1}^{20} 2 = 3 \cdot \frac{20 \cdot 21}{2} - 40 = 630 - 40 = 590.$
:::

## Practica

:::ejercicio
Calcula $\displaystyle\sum_{k=1}^{10} k(k+1)$.
respuesta: 440
pista: Separa en $\sum k^2 + \sum k$.
solucion: $\sum k^2 = \dfrac{10 \cdot 11 \cdot 21}{6} = 385$ y $\sum k = 55$. El total es $440$.
:::

:::ejercicio
Usa que $\dfrac{1}{k(k+1)} = \dfrac{1}{k} - \dfrac{1}{k+1}$ para calcular $\displaystyle\sum_{k=1}^{99} \frac{1}{k(k+1)}$.
respuesta: 0,99
pista: Es telescópica: solo sobreviven el primer y el último término.
solucion: La suma es $1 - \dfrac{1}{100} = \dfrac{99}{100} = 0{,}99$.
:::

:::ejercicio
Evalúa $\displaystyle\prod_{k=2}^{10} \left(1 - \frac{1}{k}\right)$.
respuesta: 1/10
pista: $1 - \dfrac{1}{k} = \dfrac{k-1}{k}$: escribe los primeros factores y observa qué se cancela.
solucion: $\dfrac{1}{2} \cdot \dfrac{2}{3} \cdots \dfrac{9}{10} = \dfrac{1}{10}$. En general, el producto hasta $n$ vale $\dfrac{1}{n}$.
:::
