---
titulo: Plano complejo y forma trigonométrica
descripcion: Módulo, argumento, forma polar y la multiplicación como rotación.
unidad: Unidad 5 · Números complejos
modulo: 5.3
video:
etiquetas: plano complejo argand modulo argumento forma trigonometrica forma polar cis euler rotacion numeros complejos
---

## Primero, la intuición

Un número complejo $a + bi$ es un punto $(a, b)$ del plano: el eje horizontal es el **real** y el vertical, el **imaginario**. También se puede describir por su distancia al origen, el **módulo**, y por el ángulo que forma con el eje real positivo, el **argumento**:

$$|a + bi| = \sqrt{a^2 + b^2}, \qquad \tan\theta = \frac{b}{a}.$$

El cuadrante del punto decide cuál de los ángulos con esa tangente es el correcto.

## Forma trigonométrica

Con $r = |z|$ y el argumento $\theta$:

$$z = r(\cos\theta + i\sen\theta) = r\cis\theta = re^{i\theta}.$$

En esta forma, multiplicar y dividir es muy sencillo: los módulos se multiplican y los argumentos se suman.

$$z_1 z_2 = r_1 r_2 \cis(\theta_1 + \theta_2), \qquad \frac{z_1}{z_2} = \frac{r_1}{r_2}\cis(\theta_1 - \theta_2) \quad (z_2 \ne 0).$$

:::idea
En forma trigonométrica, $z = r\cis\theta$. Multiplicar complejos multiplica sus módulos y suma sus argumentos: geométricamente, escala y rota.
:::

:::ejemplo
Para $z = -1 + \sqrt{3}\,i$: el módulo es $r = \sqrt{1 + 3} = 2$. El punto está en el cuadrante II con $\tan\theta = -\sqrt{3}$, así que $\theta = 120^\circ$ y $z = 2\cis 120^\circ$.
:::

## Practica

:::ejercicio
Si $z_1 = 4\cis 50^\circ$ y $z_2 = 2\cis 20^\circ$, ¿cuál es el módulo de $z_1 z_2$?
respuesta: 8
pista: Los módulos se multiplican.
solucion: $z_1 z_2 = 8\cis 70^\circ$, y $\dfrac{z_1}{z_2} = 2\cis 30^\circ = \sqrt{3} + i$.
:::

:::ejercicio
Escribe $6\cis\dfrac{7\pi}{4}$ en forma estándar. ¿Cuánto vale su parte real? Usa dos decimales.
respuesta: 4,24
tolerancia: 0,01
pista: $\cos\tfrac{7\pi}{4} = \tfrac{\sqrt{2}}{2}$ y $\sen\tfrac{7\pi}{4} = -\tfrac{\sqrt{2}}{2}$.
solucion: $6\cis\tfrac{7\pi}{4} = 3\sqrt{2} - 3\sqrt{2}\,i \approx 4{,}24 - 4{,}24i$.
:::

:::ejercicio
¿Qué efecto tiene multiplicar un número complejo por $i$?
- [ ] Lo refleja respecto al eje real
- [x] Lo rota $90^\circ$ en sentido antihorario
- [ ] Duplica su módulo
solucion: $i = 1\cis 90^\circ$: el módulo no cambia y el argumento aumenta $90^\circ$. Multiplicar por $2i$ además duplica el módulo.
:::
