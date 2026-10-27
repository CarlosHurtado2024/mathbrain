---
titulo: Expresiones racionales
descripcion: Fracciones de polinomios: dominio, simplificación, operaciones y fracciones complejas.
unidad: Unidad 2 · Álgebra fundamental
modulo: 2.5
video:
etiquetas: expresiones racionales fraccion algebraica simplificar dominio minimo comun denominador fracciones complejas algebra
---

## Primero, la intuición

Una expresión racional es un cociente de polinomios, $P/Q$. Se trabaja igual que con las fracciones numéricas, con una precaución adicional: el denominador no puede anularse. Por eso, antes de simplificar, conviene anotar el **dominio**.

Solo se cancelan **factores** comunes, nunca términos sueltos:

$$\frac{PR}{QR} = \frac{P}{Q} \;(R \ne 0), \qquad \frac{P}{Q} \pm \frac{R}{S} = \frac{PS \pm QR}{QS}, \qquad \frac{P/Q}{R/S} = \frac{PS}{QR}.$$

## Cómo trabajar

1. Factoriza numeradores y denominadores.
2. Anota los valores que anulan algún denominador.
3. Cancela factores comunes y opera usando el mínimo común denominador.

:::idea
Una expresión racional se simplifica cancelando factores comunes, no términos, y conserva las restricciones de su dominio original.
:::

:::ejemplo
$\dfrac{x^2 - 9}{x^2 + x - 6} = \dfrac{(x - 3)(x + 3)}{(x + 3)(x - 2)} = \dfrac{x - 3}{x - 2}$, con $x \ne -3$ y $x \ne 2$. Aunque el factor $x + 3$ desaparece, el valor $x = -3$ sigue excluido.
:::

:::nota
Es un error cancelar así: $\dfrac{x + 2}{x} = 2$. El $x$ del numerador es un término, no un factor.
:::

## Practica

:::ejercicio
Simplifica $\dfrac{x^2 - 9}{x^2 + x - 6}$ y evalúa el resultado en $x = 4$.
respuesta: 1/2
pista: La forma simplificada es $\dfrac{x - 3}{x - 2}$.
solucion: $\dfrac{4 - 3}{4 - 2} = \dfrac{1}{2}$.
:::

:::ejercicio
Efectúa $\dfrac{2}{x - 1} - \dfrac{3}{x + 1} + \dfrac{6}{x^2 - 1}$ y evalúa el resultado en $x = 2$.
respuesta: 3
pista: El mínimo común denominador es $x^2 - 1 = (x - 1)(x + 1)$.
solucion: $\dfrac{2(x + 1) - 3(x - 1) + 6}{x^2 - 1} = \dfrac{11 - x}{x^2 - 1}$. En $x = 2$: $\dfrac{9}{3} = 3$.
:::

:::ejercicio
¿A qué es igual la fracción compleja $\dfrac{\frac{1}{x} - \frac{1}{a}}{x - a}$?
- [ ] $\dfrac{1}{ax}$
- [x] $-\dfrac{1}{ax}$
- [ ] $\dfrac{x - a}{ax}$
solucion: $\dfrac{1}{x} - \dfrac{1}{a} = \dfrac{a - x}{ax} = -\dfrac{x - a}{ax}$. Al dividir entre $x - a$ queda $-\dfrac{1}{ax}$.
:::
