---
titulo: Intervalos de confianza sin confusiones
descripcion: Estimadores e intervalos de confianza.
unidad: Módulo 2 · Estimar y contrastar
video: 
etiquetas: intervalo confianza estimacion estimadores margen incertidumbre
---

## Primero, la intuición

Un intervalo de confianza añade una medida de incertidumbre a una estimación. Su forma habitual es «estimación ± margen de error», donde el margen depende de la variabilidad, el tamaño de muestra y el procedimiento.

En la interpretación frecuentista, el parámetro es fijo y los intervalos cambian de una muestra a otra. Un procedimiento del 95 % cubre el parámetro en el 95 % de repeticiones bajo sus supuestos; no asigna al parámetro una probabilidad del 95 % de estar en un intervalo ya calculado.

:::idea
Un procedimiento de confianza del 95 % produce intervalos que contienen el parámetro en el 95 % de repeticiones, bajo sus supuestos.
:::

:::ejemplo
Con media 50, σ conocida de 10 y n = 100 de una población normal, el intervalo del 95 % es 50 ± 1,96·10/√100: de 48,04 a 51,96.
:::

## Practica

:::ejercicio
Con $\sigma = 10$ conocida y $n = 100$, ¿cuál es el margen de error de un intervalo del $95\,\%$ para la media?
respuesta: 1,96
pista: Margen $= 1{,}96 \cdot \dfrac{\sigma}{\sqrt{n}}$.
solucion: $1{,}96 \cdot \dfrac{10}{10} = 1{,}96$.
:::

:::ejercicio
Una muestra de $n = 225$ tiene media $80$ y $\sigma = 15$ es conocida. ¿Cuál es el límite superior del intervalo del $95\,\%$?
respuesta: 81,96
tolerancia: 0,01
pista: El error estándar es $\dfrac{15}{\sqrt{225}} = 1$.
solucion: $80 + 1{,}96 \cdot 1 = 81{,}96$. El intervalo va de $78{,}04$ a $81{,}96$.
:::

:::ejercicio
¿Cuál es la interpretación correcta de «intervalo de confianza del $95\,\%$»?
- [x] Si repitiéramos el muestreo muchas veces, cerca del $95\,\%$ de los intervalos construidos así contendrían el parámetro.
- [ ] Hay un $95\,\%$ de probabilidad de que el parámetro esté en este intervalo ya calculado.
- [ ] El $95\,\%$ de los datos está dentro del intervalo.
solucion: El $95\,\%$ describe el procedimiento, no un intervalo concreto: cada intervalo calculado contiene el parámetro o no lo contiene.
:::
