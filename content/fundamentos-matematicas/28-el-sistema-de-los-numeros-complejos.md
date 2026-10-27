---
titulo: El sistema de los números complejos
descripcion: La unidad imaginaria, la forma estándar a + bi y las operaciones con complejos.
unidad: Unidad 5 · Números complejos
modulo: 5.1
video:
etiquetas: numeros complejos unidad imaginaria i forma estandar conjugado operaciones potencias de i
---

## Primero, la intuición

La ecuación $x^2 + 1 = 0$ no tiene solución real: ningún real al cuadrado da $-1$. En el siglo XVI, Cardano y Bombelli se atrevieron a usar un número $i$ con $i^2 = -1$, y descubrieron que los cálculos funcionaban. Así nacen los números complejos, el último paso de la cadena $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R} \subset \mathbb{C}$.

Un número complejo se escribe en **forma estándar** $z = a + bi$, con parte real $a$ y parte imaginaria $b$. Dos complejos son iguales cuando coinciden sus partes reales y sus partes imaginarias.

## Operaciones

Se opera como con polinomios en $i$, recordando que $i^2 = -1$. Las potencias de $i$ se repiten cada cuatro: $i^2 = -1$, $i^3 = -i$ e $i^4 = 1$.

$$(a + bi)(c + di) = (ac - bd) + (ad + bc)i, \qquad \overline{a + bi} = a - bi, \qquad z\bar{z} = a^2 + b^2.$$

Para dividir, se multiplica por el **conjugado** del denominador:

$$\frac{a + bi}{c + di} = \frac{(a + bi)(c - di)}{c^2 + d^2}.$$

:::idea
Los complejos $a + bi$ amplían los reales con una unidad imaginaria que cumple $i^2 = -1$. Se suman y multiplican como polinomios, y se dividen multiplicando por el conjugado del denominador.
:::

:::ejemplo
$(3 - 2i)(4 + 5i) = 12 + 15i - 8i - 10i^2 = 12 + 7i + 10 = 22 + 7i$.
:::

:::nota
Para $a, b > 0$, $\sqrt{-a}\sqrt{-b} \ne \sqrt{ab}$. Primero escribe $\sqrt{-r} = i\sqrt{r}$: por ejemplo, $\sqrt{-12}\sqrt{-3} = i\sqrt{12} \cdot i\sqrt{3} = i^2\sqrt{36} = -6$, no $6$.
:::

## Practica

:::ejercicio
Calcula $i^{2026}$.
respuesta: -1
pista: Divide el exponente entre $4$ y fíjate en el residuo.
solucion: $2026 = 4 \cdot 506 + 2$, así que $i^{2026} = i^2 = -1$.
:::

:::ejercicio
Escribe $\dfrac{5 + i}{2 - 3i}$ en forma estándar. ¿Cuánto vale su parte real?
respuesta: 7/13
pista: Multiplica numerador y denominador por $2 + 3i$.
solucion: $\dfrac{(5 + i)(2 + 3i)}{4 + 9} = \dfrac{10 + 17i + 3i^2}{13} = \dfrac{7 + 17i}{13}$.
:::

:::ejercicio
¿Cuáles son las soluciones de $x^2 - 4x + 13 = 0$?
- [ ] $x = 2 \pm 3$
- [x] $x = 2 \pm 3i$
- [ ] $x = -2 \pm 3i$
solucion: $x = \dfrac{4 \pm \sqrt{16 - 52}}{2} = \dfrac{4 \pm \sqrt{-36}}{2} = \dfrac{4 \pm 6i}{2} = 2 \pm 3i$.
:::
