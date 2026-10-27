---
titulo: Radicación, exponentes racionales y racionalización
descripcion: Raíces n-ésimas, su relación con los exponentes fraccionarios y cómo racionalizar denominadores.
unidad: Unidad 2 · Álgebra fundamental
modulo: 2.2
video:
etiquetas: radicacion radical radicales raiz raices exponentes racionales racionalizacion conjugado algebra
---

## Primero, la intuición

La raíz $n$-ésima deshace una potencia: $\sqrt[n]{a} = b$ significa $b^n = a$. Por eso una raíz se puede escribir como un exponente fraccionario, y todas las leyes de los exponentes se aplican también a los radicales:

$$a^{m/n} = \sqrt[n]{a^m} = \left(\sqrt[n]{a}\right)^m.$$

Con índice par, la raíz de un número negativo no existe en $\mathbb{R}$, y la raíz principal nunca es negativa. Por eso $\sqrt{x^2} = |x|$, no $x$.

## Propiedades y racionalización

$$\sqrt[n]{ab} = \sqrt[n]{a}\,\sqrt[n]{b}, \qquad \sqrt[n]{\frac{a}{b}} = \frac{\sqrt[n]{a}}{\sqrt[n]{b}}, \qquad \sqrt[m]{\sqrt[n]{a}} = \sqrt[mn]{a}.$$

**Racionalizar** es eliminar las raíces del denominador. Con un binomio se multiplica por el conjugado, para usar la diferencia de cuadrados:

$$\frac{1}{\sqrt{a} - \sqrt{b}} = \frac{\sqrt{a} + \sqrt{b}}{a - b}.$$

:::idea
Un radical es una potencia de exponente fraccionario, $a^{m/n} = \sqrt[n]{a^m}$, y cumple las mismas leyes. Con índice par, $\sqrt[n]{a^n} = |a|$.
:::

:::ejemplo
Para simplificar $\sqrt{72} + 3\sqrt{50} - \sqrt{18}$, extrae los cuadrados perfectos: $6\sqrt{2} + 3 \cdot 5\sqrt{2} - 3\sqrt{2} = (6 + 15 - 3)\sqrt{2} = 18\sqrt{2}$.
:::

:::nota
$\sqrt{a + b} \ne \sqrt{a} + \sqrt{b}$. Por ejemplo, $\sqrt{9 + 16} = 5$, mientras que $\sqrt{9} + \sqrt{16} = 7$.
:::

## Practica

:::ejercicio
Evalúa $\left(\dfrac{27}{125}\right)^{-1/3}$.
respuesta: 5/3
pista: Invierte la fracción para quitar el signo negativo y luego saca raíz cúbica.
solucion: $\left(\dfrac{125}{27}\right)^{1/3} = \dfrac{5}{3}$.
:::

:::ejercicio
Racionaliza $\dfrac{6}{\sqrt{5} - \sqrt{2}}$ y escríbelo como $k(\sqrt{5} + \sqrt{2})$. ¿Cuánto vale $k$?
respuesta: 2
pista: Multiplica por el conjugado $\sqrt{5} + \sqrt{2}$: el denominador queda $5 - 2$.
solucion: $\dfrac{6(\sqrt{5} + \sqrt{2})}{5 - 2} = 2(\sqrt{5} + \sqrt{2})$.
:::

:::ejercicio
¿Para qué valores de $x$ se cumple $\sqrt{(x - 3)^2} = x - 3$?
- [ ] Para todo número real
- [x] Para $x \ge 3$
- [ ] Solo para $x = 3$
solucion: $\sqrt{(x - 3)^2} = |x - 3|$, que es igual a $x - 3$ exactamente cuando $x - 3 \ge 0$.
:::
