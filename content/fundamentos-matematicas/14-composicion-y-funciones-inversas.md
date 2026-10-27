---
titulo: Operaciones, composición y funciones inversas
descripcion: Combina funciones, compónlas y deshaz una función con su inversa.
unidad: Unidad 3 · Funciones
modulo: 3.3
video:
etiquetas: composicion funcion inversa uno a uno recta horizontal dominio operaciones funciones algebra
---

## Primero, la intuición

Componer es encadenar máquinas: en $(f \circ g)(x) = f(g(x))$ primero actúa $g$ y su salida entra en $f$. El orden importa: en general $f \circ g \ne g \circ f$. El dominio de la composición solo incluye las $x$ para las que $g(x)$ es una entrada válida de $f$:

$$\Dom(f \circ g) = \{x \in \Dom g : g(x) \in \Dom f\}.$$

## Funciones inversas

La **inversa** deshace lo que hace la función. Solo existe si $f$ es **uno a uno**: entradas distintas dan salidas distintas, lo que se comprueba con la prueba de la recta horizontal.

$$y = f^{-1}(x) \iff x = f(y), \qquad f^{-1}(f(x)) = x, \qquad f(f^{-1}(x)) = x.$$

Los papeles se intercambian: $\Dom f^{-1} = \Ran f$ y $\Ran f^{-1} = \Dom f$. Las gráficas de $f$ y $f^{-1}$ son simétricas respecto a la recta $y = x$. Para hallar la inversa, escribe $y = f(x)$, despeja $x$ e intercambia las letras.

:::idea
$(f \circ g)(x) = f(g(x))$ aplica primero $g$. Una función uno a uno tiene inversa, que intercambia dominio y rango y cuya gráfica es simétrica respecto a $y = x$.
:::

:::ejemplo
Para $f(x) = \dfrac{2x + 3}{x - 1}$: de $y(x - 1) = 2x + 3$ sale $x(y - 2) = y + 3$, así que $f^{-1}(x) = \dfrac{x + 3}{x - 2}$. El dominio de $f^{-1}$ excluye $x = 2$, que es justamente el valor que $f$ nunca alcanza.
:::

## Practica

:::ejercicio
Si $f(x) = x^2 + 1$ y $g(x) = \sqrt{x - 2}$, calcula $(f \circ g)(6)$.
respuesta: 5
pista: Primero $g(6) = \sqrt{4}$.
solucion: $g(6) = 2$ y $f(2) = 5$. En general, $(f \circ g)(x) = x - 1$ con $x \ge 2$.
:::

:::ejercicio
Con $f(x) = \dfrac{2x + 3}{x - 1}$, ¿cuánto vale $f^{-1}(7)$?
respuesta: 2
pista: Busca la $x$ tal que $f(x) = 7$, o usa $f^{-1}(x) = \dfrac{x + 3}{x - 2}$.
solucion: $f^{-1}(7) = \dfrac{10}{5} = 2$. Comprobación: $f(2) = \dfrac{7}{1} = 7$.
:::

:::ejercicio
¿Qué restricción hace que $f(x) = (x - 2)^2$ sea uno a uno?
- [ ] $x \ge 0$
- [x] $x \ge 2$
- [ ] $x \le 0$
solucion: La parábola tiene su vértice en $x = 2$. A la derecha del vértice es creciente, así que restringida a $x \ge 2$ es uno a uno, con inversa $f^{-1}(x) = 2 + \sqrt{x}$.
:::
