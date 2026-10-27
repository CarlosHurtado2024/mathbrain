---
titulo: Teorema de De Moivre y raíces n-ésimas
descripcion: Potencias y raíces de números complejos, las raíces de la unidad y el cierre del curso.
unidad: Unidad 5 · Números complejos
modulo: 5.4
video:
etiquetas: de moivre raices n-esimas raices de la unidad potencias numeros complejos poligono regular euler
---

## Primero, la intuición

Si multiplicar complejos suma argumentos, elevar a la $n$ multiplica el argumento por $n$. Es el **teorema de De Moivre**:

$$\left[r(\cos\theta + i\sen\theta)\right]^n = r^n(\cos n\theta + i\sen n\theta).$$

Calcular $(1 + i)^{10}$ multiplicando diez veces sería largo. En forma trigonométrica es inmediato.

## Raíces n-ésimas

Todo complejo no nulo tiene exactamente $n$ raíces $n$-ésimas. Todas tienen el mismo módulo y sus argumentos están separados por $\tfrac{2\pi}{n}$, así que forman los vértices de un polígono regular:

$$w_k = \sqrt[n]{r}\,\cis\!\left(\frac{\theta + 2k\pi}{n}\right), \qquad k = 0, 1, \dots, n - 1.$$

El curso cierra donde empezó: completamos $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R} \subset \mathbb{C}$, y la identidad de Euler, $e^{i\pi} + 1 = 0$, reúne en una sola igualdad los números más importantes.

:::idea
Para elevar un complejo a la $n$, eleva el módulo a la $n$ y multiplica el argumento por $n$. Sus $n$ raíces $n$-ésimas tienen módulo $\sqrt[n]{r}$ y forman un polígono regular.
:::

:::ejemplo
$1 + i = \sqrt{2}\cis 45^\circ$. Por De Moivre, $(1 + i)^{10} = (\sqrt{2})^{10}\cis 450^\circ = 32\cis 90^\circ = 32i$.
:::

## Practica

:::ejercicio
Calcula $(\sqrt{3} - i)^6$.
respuesta: -64
pista: $\sqrt{3} - i = 2\cis(-30^\circ)$.
solucion: $2^6\cis(-180^\circ) = 64(\cos 180^\circ - i\sen 180^\circ) = -64$.
:::

:::ejercicio
¿Qué módulo tienen las raíces cúbicas de $8i$?
respuesta: 2
pista: $|8i| = 8$.
solucion: Todas tienen módulo $\sqrt[3]{8} = 2$. Sus argumentos son $30^\circ$, $150^\circ$ y $270^\circ$.
:::

:::ejercicio
¿Cuánto vale la suma de las seis raíces sextas de la unidad?
respuesta: 0
pista: Son los vértices de un hexágono regular centrado en el origen.
solucion: Los vértices de un polígono regular centrado en el origen se compensan: la suma es $0$.
:::
