---
titulo: Productos notables y factorización
descripcion: Desarrolla sin multiplicar término a término y convierte sumas en productos.
unidad: Unidad 2 · Álgebra fundamental
modulo: 2.4
video:
etiquetas: productos notables factorizacion factorizar factor comun trinomio diferencia de cuadrados cubos binomio newton completar cuadrado algebra
---

## Primero, la intuición

Factorizar es escribir una suma como un producto. Es el camino inverso de la propiedad distributiva y la herramienta más usada para resolver ecuaciones, porque un producto es cero solo si alguno de sus factores lo es.

Los productos notables son patrones que conviene reconocer a simple vista:

$$(a \pm b)^2 = a^2 \pm 2ab + b^2, \qquad (a + b)(a - b) = a^2 - b^2,$$

$$(a \pm b)^3 = a^3 \pm 3a^2 b + 3ab^2 \pm b^3, \qquad a^3 \pm b^3 = (a \pm b)(a^2 \mp ab + b^2).$$

## Estrategia de factorización

1. Saca el factor común.
2. Reconoce diferencias de cuadrados, sumas o diferencias de cubos y trinomios cuadrados perfectos.
3. Para $x^2 + bx + c$, busca dos números que sumen $b$ y multipliquen $c$.
4. Si nada funciona, **completa el cuadrado**: $x^2 + bx + c = \left(x + \frac{b}{2}\right)^2 + c - \frac{b^2}{4}$.

El **binomio de Newton** generaliza los cuadrados y cubos: $(a + b)^n = \displaystyle\sum_{k=0}^{n} \binom{n}{k} a^{n-k} b^k$.

:::idea
Factorizar convierte una suma en un producto. Primero el factor común; después los productos notables al revés; y, si hace falta, completar el cuadrado.
:::

:::ejemplo
$x^4 + 4$ no parece factorizable, pero al completar el cuadrado aparece una diferencia de cuadrados: $x^4 + 4x^2 + 4 - 4x^2 = (x^2 + 2)^2 - (2x)^2 = (x^2 + 2x + 2)(x^2 - 2x + 2)$.
:::

## Practica

:::ejercicio
¿Cuál es la factorización de $6x^2 + 7x - 20$?
- [ ] $(6x - 5)(x + 4)$
- [x] $(2x + 5)(3x - 4)$
- [ ] $(3x + 4)(2x - 5)$
solucion: $(2x + 5)(3x - 4) = 6x^2 - 8x + 15x - 20 = 6x^2 + 7x - 20$.
:::

:::ejercicio
Al completar el cuadrado, $x^2 + 6x + 13 = (x + 3)^2 + c$. ¿Cuánto vale $c$?
respuesta: 4
pista: $(x + 3)^2 = x^2 + 6x + 9$.
solucion: $x^2 + 6x + 13 = (x^2 + 6x + 9) + 4 = (x + 3)^2 + 4$.
:::

:::ejercicio
Halla el coeficiente del término en $x^4$ al desarrollar $(2x - 1)^6$.
respuesta: 240
pista: El término es $\binom{6}{2}(2x)^4(-1)^2$.
solucion: $\binom{6}{2} \cdot 2^4 \cdot 1 = 15 \cdot 16 = 240$.
:::
