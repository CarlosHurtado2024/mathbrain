---
titulo: Sistemas numéricos y números reales
descripcion: De contar a medir: naturales, enteros, racionales, irracionales y la recta real.
unidad: Unidad 1 · Números reales y aritmética
modulo: 1.1
video: https://youtu.be/9OhYP2QqRiw
formato: vertical
etiquetas: numeros reales naturales enteros racionales irracionales intervalos valor absoluto fracciones propiedades campo aritmetica
---

## Primero, la intuición

Cada sistema numérico nació para resolver una ecuación que el anterior no podía. Con los naturales contamos, pero $x + 5 = 2$ no tiene solución en ellos: por eso aparecen los enteros. La ecuación $3x = 2$ exige fracciones, los racionales. Y la diagonal de un cuadrado de lado $1$ mide $\sqrt{2}$, un número que no es cociente de enteros: un irracional.

Juntos forman los números reales, que llenan la recta numérica sin dejar huecos:

$$\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}, \qquad \mathbb{R} = \mathbb{Q} \cup \mathbb{I}.$$

Todavía quedará una ecuación sin solución, $x^2 + 1 = 0$. La resolveremos al final del curso con los números complejos.

## Decimales, fracciones y propiedades

Un racional tiene una expansión decimal finita o periódica, y cualquier decimal periódico se puede escribir como fracción:

$$0.\overline{36} = \frac{36}{99} = \frac{4}{11}, \qquad 0.1\overline{6} = \frac{16 - 1}{90} = \frac{1}{6}.$$

Las propiedades de campo (conmutativa, asociativa, distributiva, neutros e inversos) justifican cada paso algebraico. Por ejemplo, $a(b + c) = ab + ac$ es la distributiva y $a + (-a) = 0$ es el inverso aditivo. La división entre cero no está definida.

El **valor absoluto** mide la distancia al cero, y $d(a, b) = |b - a|$ mide la distancia entre dos puntos de la recta:

$$|a| = \begin{cases} a, & a \ge 0 \\ -a, & a < 0 \end{cases} \qquad |ab| = |a||b|, \qquad |a + b| \le |a| + |b|.$$

:::idea
Cada sistema numérico amplía el anterior para resolver nuevas ecuaciones: $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}$. Los racionales tienen decimales finitos o periódicos; los irracionales, decimales infinitos no periódicos.
:::

:::ejemplo
Para calcular $|3 - \pi| + |\pi - 4|$ sin calculadora, observa los signos: $3 - \pi < 0$ y $\pi - 4 < 0$. Entonces $|3 - \pi| = \pi - 3$ y $|\pi - 4| = 4 - \pi$, y la suma es $(\pi - 3) + (4 - \pi) = 1$.
:::

:::nota
Un intervalo como $[-2, 5)$ incluye el $-2$ y excluye el $5$. En la recta se dibuja con un punto relleno en $-2$ y uno vacío en $5$.
:::

## Practica

:::ejercicio
¿A qué conjuntos pertenece $\sqrt{49}$?
- [ ] Solo a $\mathbb{Q}$
- [x] A $\mathbb{N}$, $\mathbb{Z}$, $\mathbb{Q}$ y $\mathbb{R}$
- [ ] A los irracionales $\mathbb{I}$
solucion: $\sqrt{49} = 7$ es natural y, por las inclusiones $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R}$, pertenece a todos ellos.
:::

:::ejercicio
Escribe $0.\overline{27}$ como fracción irreducible.
respuesta: 3/11
tolerancia: 0,0001
pista: Con dos cifras periódicas, divide el periodo entre $99$.
solucion: $0.\overline{27} = \dfrac{27}{99} = \dfrac{3}{11}$.
:::

:::ejercicio
Calcula $|5 - \pi| - |\pi - 5|$.
respuesta: 0
pista: Dos números opuestos tienen el mismo valor absoluto.
solucion: $|\pi - 5| = |-(5 - \pi)| = |5 - \pi|$, así que la diferencia es $0$.
:::
