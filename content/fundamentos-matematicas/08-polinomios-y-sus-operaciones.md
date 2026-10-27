---
titulo: Expresiones algebraicas y polinomios
descripcion: Grado, coeficientes, operaciones con polinomios y el algoritmo de la división.
unidad: Unidad 2 · Álgebra fundamental
modulo: 2.3
video:
etiquetas: polinomio polinomios expresiones algebraicas grado coeficiente division larga variables terminos algebra
---

## Primero, la intuición

Un polinomio en $x$ combina potencias enteras no negativas de $x$ multiplicadas por números, sus **coeficientes**:

$$P(x) = a_n x^n + a_{n-1}x^{n-1} + \dots + a_1 x + a_0, \qquad a_n \ne 0 \;\Rightarrow\; \gr P = n.$$

Los **términos semejantes** tienen la misma potencia de $x$ y se suman combinando sus coeficientes: $3x^2 + 5x^2 = 8x^2$, pero $3x^2 + 5x$ ya no se simplifica. Dos polinomios son iguales cuando tienen los mismos coeficientes en cada potencia.

## Operaciones

Al multiplicar, los grados se suman: $\gr(PQ) = \gr P + \gr Q$. Al dividir $P$ entre $D$, la **división larga** produce un cociente $Q$ y un residuo $R$ de grado menor que el divisor:

$$P(x) = D(x)\,Q(x) + R(x), \qquad R = 0 \text{ o } \gr R < \gr D.$$

:::idea
El grado de un producto es la suma de los grados. Toda división de polinomios cumple $P = DQ + R$, con un residuo de grado menor que el divisor.
:::

:::ejemplo
Al dividir $2x^4 - 3x^3 + x - 5$ entre $x^2 + 1$ se obtiene el cociente $2x^2 - 3x - 2$ y el residuo $4x - 3$. Comprobación: $(x^2 + 1)(2x^2 - 3x - 2) + (4x - 3) = 2x^4 - 3x^3 + x - 5$.
:::

## Practica

:::ejercicio
Sean $P(x) = 3x^3 - 2x + 5$ y $Q(x) = x^2 - 4x + 1$. ¿Cuál es el coeficiente de $x$ en $P - 2Q$?
respuesta: 6
pista: $-2Q = -2x^2 + 8x - 2$.
solucion: $P - 2Q = 3x^3 - 2x^2 + 6x + 3$. El coeficiente de $x$ es $-2 + 8 = 6$.
:::

:::ejercicio
¿Qué grado tiene el producto $PQ$ de los polinomios anteriores?
respuesta: 5
pista: Los grados se suman.
solucion: $\gr(PQ) = 3 + 2 = 5$.
:::

:::ejercicio
Halla $a$ si $(a + 1)x^2 + (b - 2)x + 3 = 4x^2 + 3$ para todo $x$.
respuesta: 3
pista: Iguala los coeficientes de $x^2$.
solucion: $a + 1 = 4$, así que $a = 3$. Además, $b - 2 = 0$ da $b = 2$.
:::
