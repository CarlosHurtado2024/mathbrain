---
titulo: Reglas de derivación y regla de la cadena
descripcion: La regla de la potencia, el producto y la cadena.
unidad: Módulo 2 · La derivada y sus aplicaciones
video: 
etiquetas: derivadas potencia producto cadena composicion
---

## Primero, la intuición

La regla de la potencia dice que la derivada de xⁿ es n·xⁿ⁻¹ en los puntos de su dominio donde es derivable. Las sumas se derivan término a término y las constantes multiplicativas se conservan.

Si una función está dentro de otra, usa la regla de la cadena: deriva la función exterior, conservando la interior, y multiplica por la derivada interior. Para un producto, (uv)′ = u′v + uv′; no basta con multiplicar las dos derivadas.

:::idea
Para una potencia, d(xⁿ)/dx = n·xⁿ⁻¹ en su dominio de derivabilidad. La regla de la cadena permite derivar composiciones.
:::

:::ejemplo
Si f(x) = (3x + 1)², la función exterior es un cuadrado y la interior es 3x + 1. Así, f′(x) = 2(3x + 1)·3 = 6(3x + 1).
:::

## Practica

:::ejercicio
Si $f(x) = 5x^3$, ¿cuánto vale $f'(1)$?
respuesta: 15
pista: Por la regla de la potencia, $f'(x) = 5 \cdot 3x^2$.
solucion: $f'(x) = 15x^2$, así que $f'(1) = 15$.
:::

:::ejercicio
Si $f(x) = (2x + 1)^3$, ¿cuánto vale $f'(0)$?
respuesta: 6
pista: Regla de la cadena: deriva el cubo y multiplica por la derivada de $2x + 1$.
solucion: $f'(x) = 3(2x + 1)^2 \cdot 2$. En $x = 0$: $3 \cdot 1 \cdot 2 = 6$.
:::

:::ejercicio
¿Cuál es la regla del producto?
- [x] $(uv)' = u'v + uv'$
- [ ] $(uv)' = u'v'$ :: La derivada de un producto no es el producto de las derivadas. Prueba con $u = v = x$: $(x^2)' = 2x$, no $1$.
- [ ] $(uv)' = u'v - uv'$ :: Ese signo menos aparece en la regla del cociente; en la del producto los dos términos se suman.
solucion: La derivada de un producto no es el producto de las derivadas: $(uv)' = u'v + uv'$.
:::

:::interactivo
{
  "kind": "symbolic",
  "statement": "Deriva $f(x) = x^3 - 4x^2 + 2x - 7$.",
  "answer": "3x^2 - 8x + 2",
  "variables": [
    "x"
  ],
  "label": "$f'(x) =$",
  "mistakes": [
    {
      "answer": "3x^2 - 8x + 2x - 7",
      "why": "La derivada de una constante es $0$, y la de $2x$ es $2$."
    },
    {
      "answer": "3x^2 - 8x + 2 - 7",
      "why": "La derivada de la constante $-7$ es $0$: desaparece."
    },
    {
      "answer": "3x^2 - 4x + 2",
      "why": "Al derivar $4x^2$, el exponente baja multiplicando: $4 \\cdot 2x = 8x$."
    }
  ],
  "hints": [
    "Deriva término a término con la regla de la potencia: $(x^n)' = n x^{n-1}$.",
    "Las constantes se derivan a $0$."
  ],
  "solution": "$f'(x) = 3x^2 - 8x + 2$. Cada término $ax^n$ pasa a $a n x^{n-1}$ y la constante desaparece."
}
:::
