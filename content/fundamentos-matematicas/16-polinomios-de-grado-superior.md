---
titulo: Polinomios de grado superior
descripcion: Gráficas, división sintética, teoremas del residuo y del factor, y ceros racionales.
unidad: Unidad 3 · Funciones
modulo: 3.5
video:
etiquetas: polinomios grado superior division sintetica teorema residuo factor ceros racionales descartes valor intermedio funciones
---

## Primero, la intuición

La gráfica de un polinomio es continua y suave. En los extremos se comporta como su término principal $a_n x^n$, y cruza o toca el eje $x$ en sus ceros. Si un cero tiene multiplicidad par, la gráfica toca el eje y rebota; si es impar, lo cruza.

## Los teoremas clave

**Teorema del residuo:** el residuo de dividir $P(x)$ entre $x - c$ es $P(c)$.

**Teorema del factor:** $x - c$ es factor de $P(x)$ si y solo si $P(c) = 0$.

**Ceros racionales:** si $p/q$ (irreducible) es un cero de un polinomio con coeficientes enteros, entonces $p$ divide al término independiente $a_0$ y $q$ divide al coeficiente principal $a_n$.

La **división sintética** divide entre $x - c$ usando solo los coeficientes. La **regla de Descartes** acota el número de ceros positivos con las variaciones de signo de $P(x)$, y el **teorema del valor intermedio** garantiza un cero entre dos puntos donde $P$ cambia de signo.

:::idea
$P(c)$ es el residuo de dividir entre $x - c$, y $x - c$ es factor exactamente cuando $P(c) = 0$. Los candidatos a ceros racionales son $\pm \dfrac{\text{divisores de } a_0}{\text{divisores de } a_n}$.
:::

:::ejemplo
Para $P(x) = 2x^3 - 3x^2 - 11x + 6$ se prueban los candidatos racionales. $P(3) = 54 - 27 - 33 + 6 = 0$, así que $x - 3$ es factor. Al dividir queda $2x^2 + 3x - 2 = (2x - 1)(x + 2)$, y $P(x) = (x - 3)(2x - 1)(x + 2)$. Los ceros son $3$, $\tfrac{1}{2}$ y $-2$.
:::

## Practica

:::ejercicio
¿Qué residuo deja $x^4 - 3x^3 + 5x - 6$ al dividirlo entre $x + 2$?
respuesta: 24
pista: Por el teorema del residuo, basta calcular $P(-2)$.
solucion: $P(-2) = 16 + 24 - 10 - 6 = 24$.
:::

:::ejercicio
Halla $k$ para que $x^3 + kx^2 - 4x + 8$ sea divisible por $x - 2$.
respuesta: -2
pista: Divisible significa que $P(2) = 0$.
solucion: $8 + 4k - 8 + 8 = 0$, así que $4k = -8$ y $k = -2$.
:::

:::ejercicio
$x^3 - x - 1$ tiene un cero entre $1$ y $2$. Aproxímalo con una cifra decimal.
respuesta: 1,3
tolerancia: 0,05
pista: Evalúa en $1{,}3$ y en $1{,}4$ y busca el cambio de signo.
solucion: $P(1{,}3) \approx -0{,}10$ y $P(1{,}4) \approx 0{,}34$. El cero está cerca de $1{,}32$.
:::
