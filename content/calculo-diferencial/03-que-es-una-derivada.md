---
titulo: ¿Qué es una derivada?
descripcion: Construye la pendiente instantánea a partir de pendientes de rectas secantes.
# Pega aquí el enlace de YouTube de la clase (puede ser «No listado»), por ejemplo:
# video: https://www.youtube.com/watch?v=XXXXXXXXXXX
video:
etiquetas: derivadas derivada tangente pendiente diferenciacion limite cociente incremental
---

## Primero, la intuición

Cuando un auto recorre $120$ km en $2$ horas, su velocidad media es $60$ km/h. Pero el velocímetro no muestra un promedio: muestra la rapidez **en ese instante**. La derivada es la herramienta matemática que convierte una tasa de cambio media en una tasa de cambio instantánea.

En una gráfica, la tasa de cambio media entre dos puntos es la pendiente de la recta que los une, llamada **secante**. Si dejamos fijo un punto y acercamos el otro cada vez más, la secante gira y se parece cada vez más a la **recta tangente**. La pendiente de esa tangente es la derivada.

## De la secante a la tangente

Toma un punto $a$ y otro un poco más adelante, $a + h$. La pendiente de la secante es el **cociente incremental**:

$$
m_{\text{sec}} = \frac{f(a+h) - f(a)}{h}, \qquad h \neq 0.
$$

Cuanto más pequeño es $h$, más cerca están los dos puntos. Si ese cociente se aproxima a un número cuando $h \to 0$, ese número es la derivada de $f$ en $a$.

:::idea
La derivada de $f$ en $a$ es la pendiente de la recta tangente en ese punto:

$$f'(a) = \lim_{h \to 0} \frac{f(a+h) - f(a)}{h},$$

siempre que ese límite exista.
:::

## Calculemos una derivada paso a paso

Para $f(x) = x^2$ en un punto cualquiera $x$:

1. Evalúa en $x + h$: $f(x+h) = (x+h)^2 = x^2 + 2xh + h^2$.
2. Resta $f(x)$: $f(x+h) - f(x) = 2xh + h^2$.
3. Divide entre $h$ (que no es cero): $\dfrac{2xh + h^2}{h} = 2x + h$.
4. Haz que $h \to 0$: el término $h$ desaparece y queda $f'(x) = 2x$.

:::ejemplo
En $x = 1$, la pendiente de la tangente a $y = x^2$ es $f'(1) = 2$. En $x = -3$ es $f'(-3) = -6$: la parábola baja con fuerza. En $x = 0$ la pendiente es $0$ y la tangente es horizontal, justo en el mínimo.
:::

## Cómo leer el signo de la derivada

- Si $f'(a) > 0$, la función **crece** cerca de $a$.
- Si $f'(a) < 0$, la función **decrece** cerca de $a$.
- Si $f'(a) = 0$, la tangente es horizontal: puede haber un máximo, un mínimo o ninguno de los dos.

También verás otras notaciones para la misma idea: $f'(x)$, $\dfrac{dy}{dx}$ y $\dfrac{d}{dx}f(x)$.

:::nota
Para que exista la derivada en un punto, la función tiene que ser continua allí, pero la continuidad no basta. La función $f(x) = |x|$ es continua en $0$ y, sin embargo, no tiene derivada en ese punto: por la izquierda las pendientes valen $-1$ y por la derecha valen $1$.
:::

## Practica

:::ejercicio
Para $f(x) = x^2$, calcula la pendiente de la secante entre $x = 1$ y $x = 3$.
respuesta: 4
pista: Usa $\dfrac{f(3) - f(1)}{3 - 1}$.
solucion: $\dfrac{f(3) - f(1)}{3 - 1} = \dfrac{9 - 1}{2} = 4$. Es una tasa media: todavía no es la derivada.
:::

:::ejercicio
Si $f(x) = x^2$, ¿cuánto vale $f'(3)$?
respuesta: 6
pista: Ya calculamos que $f'(x) = 2x$.
solucion: $f'(3) = 2 \cdot 3 = 6$. La tangente en $(3, 9)$ sube $6$ unidades por cada unidad que avanza.
:::

:::ejercicio
Usa la definición con límite para $g(x) = x^3$ en $x = 2$. ¿Cuánto vale $g'(2)$?
respuesta: 12
pista: Desarrolla $(2+h)^3 = 8 + 12h + 6h^2 + h^3$ y divide entre $h$.
solucion: $\dfrac{(2+h)^3 - 8}{h} = 12 + 6h + h^2 \to 12$ cuando $h \to 0$.
:::

:::ejercicio
Si $f'(a) < 0$, ¿qué podemos decir de la gráfica de $f$ cerca de $a$?
- [ ] Que $f(a)$ es negativo.
- [x] Que la función decrece cerca de $a$.
- [ ] Que en $a$ hay un mínimo.
solucion: El signo de la derivada describe la **dirección** del cambio, no el signo del valor $f(a)$. Una pendiente negativa indica que la gráfica baja al avanzar hacia la derecha.
:::
