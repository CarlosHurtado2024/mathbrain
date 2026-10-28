---
titulo: Sumas de Riemann: sumar pequeñas áreas
descripcion: Áreas, aproximaciones y sumas de Riemann.
unidad: Módulo 1 · Acumular y medir áreas
video: 
etiquetas: sumas riemann rectangulos area aproximacion
---

## Primero, la intuición

Divide un intervalo en partes pequeñas. En cada parte elige un punto, evalúa la función y multiplica esa altura por el ancho: obtienes el área con signo de un rectángulo.

La suma de esos rectángulos aproxima la integral. Puedes elegir extremos izquierdos, derechos o puntos medios. Para funciones continuas, al hacer cada vez más fina la partición, las sumas se acercan a la integral.

:::idea
Una suma de Riemann aproxima la acumulación mediante valores de la función multiplicados por pequeños anchos de intervalo.
:::

:::ejemplo
Para f(x) = x² en [0,1], dos rectángulos por la derecha tienen ancho 1/2 y alturas 1/4 y 1. La suma es (1/2)·(1/4 + 1) = 0,625; el área exacta es 1/3.
:::

## Practica

:::ejercicio
Para $f(x) = x$ en $[0, 2]$, calcula la suma de Riemann con $2$ rectángulos y extremos derechos.
respuesta: 3
pista: Cada rectángulo tiene ancho $1$; las alturas son $f(1)$ y $f(2)$.
solucion: $1 \cdot (1 + 2) = 3$. El área exacta es $2$: los extremos derechos sobreestiman una función creciente.
:::

:::ejercicio
Con la misma función y los extremos izquierdos, ¿cuánto vale la suma?
respuesta: 1
pista: Ahora las alturas son $f(0)$ y $f(1)$.
solucion: $1 \cdot (0 + 1) = 1$, que subestima el área exacta $2$.
:::

:::ejercicio
¿Cómo se mejora, en general, una suma de Riemann de una función continua?
- [x] Aumentando el número de rectángulos.
- [ ] Usando siempre un solo rectángulo más alto.
- [ ] Eligiendo rectángulos de anchos aleatorios grandes.
solucion: Al hacer más fina la partición, las sumas se acercan a la integral.
:::
