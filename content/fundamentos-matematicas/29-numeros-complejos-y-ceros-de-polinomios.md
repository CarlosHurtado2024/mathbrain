---
titulo: Números complejos y ceros de polinomios
descripcion: El teorema fundamental del álgebra, los ceros conjugados y la factorización completa.
unidad: Unidad 5 · Números complejos
modulo: 5.2
video:
etiquetas: teorema fundamental del algebra ceros complejos conjugados factorizacion polinomios multiplicidad numeros complejos
---

## Primero, la intuición

Con los números complejos, toda ecuación polinómica tiene solución. Es el **teorema fundamental del álgebra**: todo polinomio de grado $n \ge 1$ tiene exactamente $n$ ceros en $\mathbb{C}$, contando multiplicidades.

Por eso cualquier polinomio se factoriza completamente en factores lineales: $f(x) = a(x - c_1)(x - c_2)\cdots(x - c_n)$.

## Ceros conjugados

Si los coeficientes de $P$ son **reales**, sus ceros no reales aparecen en pares conjugados: si $P(a + bi) = 0$, entonces también $P(a - bi) = 0$. Al multiplicar los dos factores se obtiene un factor cuadrático real que no se puede factorizar en $\mathbb{R}$:

$$(x - (a + bi))(x - (a - bi)) = (x - a)^2 + b^2.$$

Así, sobre $\mathbb{R}$ todo polinomio se descompone en factores lineales y cuadráticos irreducibles.

:::idea
Todo polinomio de grado $n$ tiene $n$ ceros complejos. Si sus coeficientes son reales, los ceros no reales vienen en pares conjugados $a \pm bi$.
:::

:::ejemplo
Para construir un polinomio de grado $3$ con coeficientes reales y ceros $2$ y $1 - i$, hay que incluir también $1 + i$: $P(x) = (x - 2)\left[(x - 1)^2 + 1\right] = (x - 2)(x^2 - 2x + 2) = x^3 - 4x^2 + 6x - 4$.
:::

## Practica

:::ejercicio
Sabiendo que $1$ es cero de $P(x) = x^3 - 3x^2 + 4x - 2$, ¿cuántos ceros reales tiene $P$?
respuesta: 1
pista: Divide entre $x - 1$ y analiza el cociente con el discriminante.
solucion: $P(x) = (x - 1)(x^2 - 2x + 2)$. El cociente tiene $\Delta = 4 - 8 < 0$: sus ceros son $1 \pm i$. Solo hay un cero real.
:::

:::ejercicio
¿Cuáles son los ceros de $P(x) = x^4 + 13x^2 + 36$?
- [ ] $\pm 2$ y $\pm 3$
- [x] $\pm 2i$ y $\pm 3i$
- [ ] $\pm 4i$ y $\pm 9i$
solucion: $x^4 + 13x^2 + 36 = (x^2 + 4)(x^2 + 9)$, así que $x^2 = -4$ o $x^2 = -9$.
:::

:::ejercicio
¿Puede un polinomio de grado $3$ con coeficientes reales tener exactamente dos ceros no reales y ninguno real?
- [ ] Sí, por ejemplo $x^3 + 1$
- [x] No: tiene tres ceros y los no reales vienen en pares, así que al menos uno es real
- [ ] Solo si su coeficiente principal es negativo
solucion: Tiene exactamente $3$ ceros. Los no reales aparecen en pares conjugados, así que no pueden ser los tres: al menos uno es real.
:::
