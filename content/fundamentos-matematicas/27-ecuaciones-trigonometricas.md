---
titulo: Ecuaciones trigonométricas
descripcion: Soluciones en un intervalo y soluciones generales, ecuaciones de tipo cuadrático y con identidades.
unidad: Unidad 4 · Trigonometría
modulo: 4.9
video:
etiquetas: ecuaciones trigonometricas solucion general seno coseno tangente soluciones extranas periodicidad trigonometria
---

## Primero, la intuición

Como las funciones trigonométricas son periódicas, una ecuación como $\sen x = \tfrac{1}{2}$ tiene infinitas soluciones. Se resuelve en dos pasos: primero se buscan las soluciones en una vuelta, $[0, 2\pi)$, y después se suman los múltiplos del periodo.

Con $n \in \mathbb{Z}$:

- Si $\sen x = k$ y $|k| \le 1$: $x = \sen^{-1} k + 2n\pi$ o $x = \pi - \sen^{-1} k + 2n\pi$.
- Si $\cos x = k$ y $|k| \le 1$: $x = \pm\cos^{-1} k + 2n\pi$.
- Si $\tan x = k$: $x = \tan^{-1} k + n\pi$.

## Estrategias

1. Despeja la función trigonométrica.
2. Si la ecuación es de tipo cuadrático, factoriza: $2\cos^2 x + \cos x - 1 = (2\cos x - 1)(\cos x + 1)$.
3. Si mezcla funciones o ángulos, usa identidades para dejar una sola función.
4. Si elevas al cuadrado, comprueba cada solución: pueden aparecer soluciones extrañas.

:::idea
Una ecuación trigonométrica tiene infinitas soluciones por la periodicidad. Se buscan las de una vuelta y se suman múltiplos del periodo; las identidades y la factorización reducen la ecuación a casos básicos.
:::

:::ejemplo
$2\sen x - 1 = 0$ da $\sen x = \tfrac{1}{2}$. En $[0, 2\pi)$ las soluciones son $\tfrac{\pi}{6}$ y $\tfrac{5\pi}{6}$. La solución general es $x = \tfrac{\pi}{6} + 2n\pi$ o $x = \tfrac{5\pi}{6} + 2n\pi$.
:::

## Practica

:::ejercicio
¿Cuántas soluciones tiene $2\cos^2 x + \cos x - 1 = 0$ en $[0, 2\pi)$?
respuesta: 3
pista: Factoriza: $(2\cos x - 1)(\cos x + 1) = 0$.
solucion: $\cos x = \tfrac{1}{2}$ da $\tfrac{\pi}{3}$ y $\tfrac{5\pi}{3}$; $\cos x = -1$ da $\pi$. Son $3$ soluciones.
:::

:::ejercicio
¿Cuántas soluciones tiene $\sen 2x = \cos x$ en $[0, 2\pi)$?
respuesta: 4
pista: Usa $\sen 2x = 2\sen x\cos x$ y factoriza $\cos x$.
solucion: $\cos x(2\sen x - 1) = 0$. $\cos x = 0$ da $\tfrac{\pi}{2}$ y $\tfrac{3\pi}{2}$; $\sen x = \tfrac{1}{2}$ da $\tfrac{\pi}{6}$ y $\tfrac{5\pi}{6}$.
:::

:::ejercicio
Al resolver $\sen x + \cos x = 1$ elevando al cuadrado se obtienen $0$, $\tfrac{\pi}{2}$, $\pi$ y $\tfrac{3\pi}{2}$. ¿Cuántas son soluciones reales de la ecuación original?
respuesta: 2
pista: Sustituye cada candidato en $\sen x + \cos x$.
solucion: $x = 0$ y $x = \tfrac{\pi}{2}$ cumplen la ecuación. En $\pi$ y $\tfrac{3\pi}{2}$ la suma vale $-1$: son soluciones extrañas.
:::
