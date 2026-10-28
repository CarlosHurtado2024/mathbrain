---
titulo: El teorema fundamental del cálculo
descripcion: El teorema fundamental del cálculo.
unidad: Módulo 2 · El teorema fundamental y sus aplicaciones
video: 
etiquetas: teorema fundamental primitiva integral derivada
---

## Primero, la intuición

La derivada describe cambio; la integral, acumulación. El teorema fundamental conecta ambas ideas. Si f es continua y F es una primitiva, puedes calcular una integral definida usando F.

:::idea
Si f es continua y F es una primitiva de f, entonces ∫ₐᵇ f(x) dx = F(b) − F(a).
:::

:::ejemplo
Para integrar x² entre 0 y 1, usa F(x) = x³/3. La integral es F(1) − F(0) = 1/3 − 0 = 1/3.
:::

## Practica

:::ejercicio
Calcula $\displaystyle\int_1^2 2x \, dx$.
respuesta: 3
pista: Una primitiva de $2x$ es $x^2$.
solucion: $F(2) - F(1) = 4 - 1 = 3$.
:::

:::ejercicio
Calcula $\displaystyle\int_0^2 3x^2 \, dx$.
respuesta: 8
pista: Una primitiva de $3x^2$ es $x^3$.
solucion: $2^3 - 0^3 = 8$.
:::

:::ejercicio
Para usar $\displaystyle\int_a^b f(x)\,dx = F(b) - F(a)$, ¿qué debe ser $F$?
- [x] Una primitiva de $f$, es decir, $F' = f$.
- [ ] La derivada de $f$.
- [ ] Cualquier función que pase por $(a, 0)$.
solucion: El teorema fundamental pide una primitiva: una función cuya derivada sea $f$.
:::
