---
titulo: Potenciación y leyes de los exponentes
descripcion: Multiplicar factores iguales, exponentes cero y negativos, y la notación científica.
unidad: Unidad 2 · Álgebra fundamental
modulo: 2.1
video:
etiquetas: potencia potencias exponente exponentes leyes notacion cientifica base algebra
---

## Primero, la intuición

Una potencia abrevia una multiplicación repetida: $a^n = a \cdot a \cdots a$, con $n$ factores. De esa definición salen todas las leyes. Por ejemplo, $a^3 \cdot a^2$ son $3 + 2 = 5$ factores, así que $a^3 a^2 = a^5$.

Los exponentes cero y negativos se definen para que esas leyes sigan funcionando. Como $\dfrac{a^n}{a^n} = 1$ y también $a^{n-n} = a^0$, debe ser $a^0 = 1$ si $a \ne 0$. Del mismo modo, $a^{-n} = \dfrac{1}{a^n}$.

## Las leyes

$$a^m a^n = a^{m+n}, \qquad \frac{a^m}{a^n} = a^{m-n}, \qquad (a^m)^n = a^{mn},$$

$$(ab)^n = a^n b^n, \qquad \left(\frac{a}{b}\right)^n = \frac{a^n}{b^n}, \qquad \left(\frac{a}{b}\right)^{-n} = \left(\frac{b}{a}\right)^n.$$

La **notación científica** escribe un número como $c \times 10^k$, con $1 \le c < 10$. Por ejemplo, $0{,}00072 = 7{,}2 \times 10^{-4}$.

:::idea
Las leyes de los exponentes se deducen de $a^n = a \cdot a \cdots a$. Para que sigan valiendo, se define $a^0 = 1$ y $a^{-n} = \dfrac{1}{a^n}$ cuando $a \ne 0$.
:::

:::ejemplo
Para simplificar $\dfrac{3^{n+2} - 3^n}{8 \cdot 3^n}$, saca $3^n$ como factor común: $\dfrac{3^n(3^2 - 1)}{8 \cdot 3^n} = \dfrac{9 - 1}{8} = 1$.
:::

:::nota
$-2^4$ y $(-2)^4$ son distintos. En $-2^4$ el exponente afecta solo al $2$: vale $-16$. En $(-2)^4$ afecta al $-2$: vale $16$.
:::

## Practica

:::ejercicio
Calcula $-(-2)^3$.
respuesta: 8
pista: Primero la potencia: $(-2)^3 = -8$.
solucion: $-(-2)^3 = -(-8) = 8$.
:::

:::ejercicio
Simplifica $\dfrac{2^x \cdot 4^{x+1}}{8^x}$.
respuesta: 4
pista: Escribe todo en base $2$: $4 = 2^2$ y $8 = 2^3$.
solucion: $\dfrac{2^x \cdot 2^{2x+2}}{2^{3x}} = 2^{x + 2x + 2 - 3x} = 2^2 = 4$.
:::

:::ejercicio
Si $a = 2$ y $b = 3$, ¿cuánto vale $\dfrac{a^{-1} + b^{-1}}{(ab)^{-1}}$?
respuesta: 5
pista: Simplifica primero: multiplica numerador y denominador por $ab$.
solucion: $\dfrac{a^{-1} + b^{-1}}{(ab)^{-1}} = \dfrac{1/a + 1/b}{1/(ab)} = b + a = 5$.
:::
