---
titulo: Funciones trigonométricas de números reales
descripcion: La circunferencia unitaria, signos por cuadrante, ángulo de referencia y periodicidad.
unidad: Unidad 4 · Trigonometría
modulo: 4.3
video:
etiquetas: circulo unitario circunferencia unitaria seno coseno cuadrantes angulo de referencia periodicidad paridad trigonometria
---

## Primero, la intuición

Los triángulos solo admiten ángulos agudos. Para extender el seno y el coseno a cualquier ángulo, se usa la circunferencia de radio $1$: el punto terminal del ángulo $t$ tiene coordenadas

$$P(t) = (\cos t, \sen t).$$

El coseno es la coordenada horizontal y el seno, la vertical. Para un punto $P(x, y)$ cualquiera del lado terminal, con $r = \sqrt{x^2 + y^2}$, se tiene $\sen t = \tfrac{y}{r}$, $\cos t = \tfrac{x}{r}$ y $\tan t = \tfrac{y}{x}$.

## Signos, referencia y periodicidad

Los signos dependen del cuadrante: en el I todas son positivas, en el II el seno, en el III la tangente y en el IV el coseno. El **ángulo de referencia** es el ángulo agudo que forma el lado terminal con el eje $x$: da el valor absoluto, y el cuadrante da el signo.

$$\sen(t + 2\pi) = \sen t, \qquad \cos(t + 2\pi) = \cos t, \qquad \tan(t + \pi) = \tan t,$$

$$\sen(-t) = -\sen t, \qquad \cos(-t) = \cos t, \qquad \tan(-t) = -\tan t.$$

:::idea
En la circunferencia unitaria, el punto del ángulo $t$ es $(\cos t, \sen t)$. El ángulo de referencia da el valor y el cuadrante da el signo; seno y coseno se repiten cada $2\pi$.
:::

:::ejemplo
Para $\sen 225^\circ$: el ángulo está en el cuadrante III y su ángulo de referencia es $45^\circ$. Como el seno es negativo en el III, $\sen 225^\circ = -\tfrac{\sqrt{2}}{2} \approx -0{,}707$.
:::

:::nota
Revisa el modo de la calculadora: $\cos 30$ en radianes vale aproximadamente $0{,}154$, mientras que $\cos 30^\circ \approx 0{,}866$.
:::

## Practica

:::ejercicio
Halla el valor exacto de $\cos\dfrac{5\pi}{3}$.
respuesta: 1/2
pista: $\tfrac{5\pi}{3}$ está en el cuadrante IV, con ángulo de referencia $\tfrac{\pi}{3}$.
solucion: En el IV el coseno es positivo: $\cos\tfrac{5\pi}{3} = \cos\tfrac{\pi}{3} = \tfrac{1}{2}$.
:::

:::ejercicio
Si $\sen\theta = -\tfrac{3}{5}$ y $\tan\theta > 0$, ¿cuánto vale $\cos\theta$?
respuesta: -4/5
pista: Seno negativo y tangente positiva: el ángulo está en el cuadrante III.
solucion: $\cos^2\theta = 1 - \tfrac{9}{25} = \tfrac{16}{25}$. En el III el coseno es negativo: $\cos\theta = -\tfrac{4}{5}$.
:::

:::ejercicio
Simplifica $\sen(-t)\cos(t + 2\pi) + \cos(-t)\sen(t + 2\pi)$.
respuesta: 0
pista: Usa la paridad y la periodicidad.
solucion: $-\sen t \cos t + \cos t \sen t = 0$.
:::
