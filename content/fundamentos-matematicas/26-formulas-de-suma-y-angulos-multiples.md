---
titulo: Fórmulas de suma y resta, ángulos múltiples y producto–suma
descripcion: Seno y coseno de una suma, ángulo doble, ángulo medio y transformaciones entre productos y sumas.
unidad: Unidad 4 · Trigonometría
modulo: 4.8
video:
etiquetas: formulas suma resta angulo doble angulo medio reduccion potencias producto suma identidades trigonometria
---

## Primero, la intuición

El seno de una suma **no** es la suma de los senos. Las fórmulas de adición dicen exactamente cómo se combinan dos ángulos, y de ellas salen todas las demás fórmulas de esta lección:

$$\sen(x \pm y) = \sen x\cos y \pm \cos x\sen y, \qquad \cos(x \pm y) = \cos x\cos y \mp \sen x\sen y,$$

$$\tan(x \pm y) = \frac{\tan x \pm \tan y}{1 \mp \tan x\tan y}.$$

## Ángulos dobles, medios y productos

Con $y = x$ se obtienen las fórmulas del ángulo doble:

$$\sen 2x = 2\sen x\cos x, \qquad \cos 2x = \cos^2 x - \sen^2 x,$$

y, usando $\sen^2 x + \cos^2 x = 1$, también $\cos 2x = 1 - 2\sen^2 x = 2\cos^2 x - 1$.

Despejando, aparecen la reducción de potencias y el ángulo medio:

$$\sen^2 x = \frac{1 - \cos 2x}{2}, \qquad \cos^2 x = \frac{1 + \cos 2x}{2}, \qquad \sen\frac{u}{2} = \pm\sqrt{\frac{1 - \cos u}{2}}.$$

Y sumando o restando las fórmulas de adición, se pasa de productos a sumas: $\sen u\cos v = \tfrac{1}{2}[\sen(u + v) + \sen(u - v)]$.

:::idea
Todas las fórmulas de ángulos salen de $\sen(x \pm y)$ y $\cos(x \pm y)$. El ángulo doble es el caso $y = x$, y la reducción de potencias y el ángulo medio se despejan de $\cos 2x$.
:::

:::ejemplo
$\cos 75^\circ = \cos(45^\circ + 30^\circ) = \tfrac{\sqrt{2}}{2} \cdot \tfrac{\sqrt{3}}{2} - \tfrac{\sqrt{2}}{2} \cdot \tfrac{1}{2} = \dfrac{\sqrt{6} - \sqrt{2}}{4} \approx 0{,}259$.
:::

## Practica

:::ejercicio
Si $\sen\alpha = \tfrac{3}{5}$ con $\alpha$ en el cuadrante I y $\cos\beta = -\tfrac{5}{13}$ con $\beta$ en el cuadrante II, calcula $\sen(\alpha + \beta)$.
respuesta: 33/65
pista: Primero $\cos\alpha = \tfrac{4}{5}$ y $\sen\beta = \tfrac{12}{13}$.
solucion: $\sen(\alpha + \beta) = \tfrac{3}{5} \cdot \left(-\tfrac{5}{13}\right) + \tfrac{4}{5} \cdot \tfrac{12}{13} = \tfrac{-15 + 48}{65} = \tfrac{33}{65}$.
:::

:::ejercicio
Calcula $\tan 15^\circ$ con tres cifras decimales.
respuesta: 0,268
tolerancia: 0,001
pista: $15^\circ = 45^\circ - 30^\circ$.
solucion: $\tan 15^\circ = \dfrac{1 - \frac{\sqrt{3}}{3}}{1 + \frac{\sqrt{3}}{3}} = 2 - \sqrt{3} \approx 0{,}268$.
:::

:::ejercicio
¿Cómo se escribe $\sen 5x\cos 3x$ como suma?
- [x] $\tfrac{1}{2}(\sen 8x + \sen 2x)$
- [ ] $\sen 8x + \sen 2x$
- [ ] $\tfrac{1}{2}(\cos 8x + \cos 2x)$
solucion: Con $u = 5x$ y $v = 3x$: $\sen u\cos v = \tfrac{1}{2}[\sen(u + v) + \sen(u - v)] = \tfrac{1}{2}(\sen 8x + \sen 2x)$.
:::
