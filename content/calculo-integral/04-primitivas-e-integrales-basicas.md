---
titulo: Primitivas e integrales básicas
descripcion: Integrales básicas y sustitución.
unidad: Módulo 2 · El teorema fundamental y sus aplicaciones
video: 
etiquetas: integrales basicas primitivas antiderivada sustitucion constante
---

## Primero, la intuición

Encontrar una primitiva de f es buscar una función cuya derivada sea f. Como la derivada de una constante es cero, las primitivas de una función en un intervalo difieren en una constante.

Para xⁿ, con n ≠ −1, una primitiva es xⁿ⁺¹/(n + 1) en un intervalo adecuado de su dominio. Para 1/x, usa ln∣x∣. Comprueba siempre derivando tu respuesta.

:::idea
Una primitiva F satisface F′ = f. Las primitivas en un intervalo difieren en una constante.
:::

:::ejemplo
Una primitiva de 3x² es x³. La integral indefinida se escribe ∫3x² dx = x³ + C. Al derivar x³ + C recuperas 3x².
:::

## Practica

:::ejercicio
Sea $F$ la primitiva de $4x^3$ que cumple $F(0) = 0$. ¿Cuánto vale $F(2)$?
respuesta: 16
pista: Una primitiva de $4x^3$ es $x^4 + C$.
solucion: Con $F(0) = 0$ se tiene $C = 0$, así que $F(2) = 2^4 = 16$.
:::

:::ejercicio
Calcula $\displaystyle\int_0^1 (6x^2 + 2) \, dx$.
respuesta: 4
pista: Una primitiva es $2x^3 + 2x$.
solucion: $(2 + 2) - 0 = 4$.
:::

:::ejercicio
Dos primitivas de la misma función en un intervalo…
- [x] difieren en una constante.
- [ ] son siempre iguales.
- [ ] difieren en un múltiplo de $x$.
solucion: Si $F' = G' = f$, entonces $(F - G)' = 0$ y $F - G$ es constante.
:::
