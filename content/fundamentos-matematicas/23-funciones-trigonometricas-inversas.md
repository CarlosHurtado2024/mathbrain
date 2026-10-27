---
titulo: Funciones trigonométricas inversas
descripcion: Por qué hay que restringir el dominio y cómo evaluar arcoseno, arcocoseno y arcotangente.
unidad: Unidad 4 · Trigonometría
modulo: 4.5
video:
etiquetas: funciones trigonometricas inversas arcoseno arcocoseno arcotangente arcsen arccos arctan dominio restringido trigonometria
---

## Primero, la intuición

El seno no es uno a uno: muchos ángulos tienen el mismo seno. Para definir su inversa se restringe su dominio a un tramo donde toma cada valor una sola vez. Así, $\sen^{-1} x$ devuelve **un** ángulo concreto: el que está en ese tramo.

$$y = \sen^{-1} x \iff \sen y = x, \qquad -1 \le x \le 1, \qquad -\tfrac{\pi}{2} \le y \le \tfrac{\pi}{2},$$

$$y = \cos^{-1} x \iff \cos y = x, \qquad -1 \le x \le 1, \qquad 0 \le y \le \pi,$$

$$y = \tan^{-1} x \iff \tan y = x, \qquad x \in \mathbb{R}, \qquad -\tfrac{\pi}{2} < y < \tfrac{\pi}{2}.$$

## Cancelación y composiciones

$\sen(\sen^{-1} x) = x$ para todo $x \in [-1, 1]$, pero $\sen^{-1}(\sen x) = x$ **solo** si $x \in \left[-\tfrac{\pi}{2}, \tfrac{\pi}{2}\right]$. Expresiones como $\cos(\sen^{-1} x)$ se simplifican dibujando un triángulo de referencia.

:::idea
Las inversas trigonométricas existen porque se restringe el dominio. $\sen^{-1}$ y $\tan^{-1}$ devuelven ángulos entre $-\tfrac{\pi}{2}$ y $\tfrac{\pi}{2}$; $\cos^{-1}$, entre $0$ y $\pi$.
:::

:::ejemplo
Para $\cos\left(\sen^{-1}\tfrac{3}{5}\right)$, sea $\theta = \sen^{-1}\tfrac{3}{5}$: un ángulo agudo con opuesto $3$ e hipotenusa $5$. El adyacente mide $4$, así que $\cos\theta = \tfrac{4}{5}$.
:::

## Practica

:::ejercicio
Calcula $\sen^{-1}\left(-\tfrac{1}{2}\right)$ en grados.
respuesta: -30
pista: El resultado debe estar entre $-90^\circ$ y $90^\circ$.
solucion: $\sen(-30^\circ) = -\tfrac{1}{2}$, así que $\sen^{-1}\left(-\tfrac{1}{2}\right) = -30^\circ = -\tfrac{\pi}{6}$.
:::

:::ejercicio
¿Cuánto vale $\sen^{-1}\left(\sen\tfrac{5\pi}{6}\right)$?
- [ ] $\tfrac{5\pi}{6}$
- [x] $\tfrac{\pi}{6}$
- [ ] $-\tfrac{\pi}{6}$
solucion: $\sen\tfrac{5\pi}{6} = \tfrac{1}{2}$ y el arcoseno devuelve el ángulo de $\left[-\tfrac{\pi}{2}, \tfrac{\pi}{2}\right]$ con ese seno: $\tfrac{\pi}{6}$.
:::

:::ejercicio
Una escalera de $6$ m se apoya en un muro y alcanza $5$ m de altura. ¿Qué ángulo forma con el piso, en grados?
respuesta: 56,4
tolerancia: 0,1
pista: El ángulo $\theta$ cumple $\sen\theta = \tfrac{5}{6}$.
solucion: $\theta = \sen^{-1}\tfrac{5}{6} \approx 56{,}4^\circ$.
:::
