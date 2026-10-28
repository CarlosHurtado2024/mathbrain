---
titulo: Error estándar: cuánto varía una media
descripcion: Distribuciones muestrales y error estándar.
unidad: Módulo 1 · De la muestra a la población
video: 
etiquetas: media promedio error estandar distribucion muestral desviacion
---

## Primero, la intuición

Si tomas muchas muestras del mismo tamaño, sus medias no serán idénticas. La distribución muestral describe esa variación. El error estándar es la desviación estándar de esa distribución.

Para observaciones independientes con la misma varianza finita σ², el error estándar de la media es σ/√n. Si σ se desconoce, suele estimarse con s/√n. Cuadruplicar el tamaño reduce a la mitad ese error.

:::idea
Bajo independencia y varianza finita, el error estándar de la media es σ/√n. Si σ se desconoce, suele estimarse a partir de la muestra.
:::

:::ejemplo
Si la desviación estándar poblacional es 12 y n = 36, el error estándar de la media es 12/√36 = 2. Con n = 144 pasa a ser 1, bajo los mismos supuestos.
:::

## Practica

:::ejercicio
Si $\sigma = 20$ y $n = 25$, ¿cuál es el error estándar de la media?
respuesta: 4
pista: $EE = \dfrac{\sigma}{\sqrt{n}}$.
solucion: $\dfrac{20}{\sqrt{25}} = \dfrac{20}{5} = 4$.
:::

:::ejercicio
Si $\sigma = 12$ y $n = 16$, ¿cuál es el error estándar de la media?
respuesta: 3
pista: $\sqrt{16} = 4$.
solucion: $\dfrac{12}{4} = 3$.
:::

:::ejercicio
¿Qué hay que hacer con el tamaño de la muestra para reducir el error estándar a la mitad?
- [ ] Duplicarlo.
- [x] Multiplicarlo por $4$.
- [ ] Reducirlo a la mitad.
solucion: Como $EE = \sigma/\sqrt{n}$, multiplicar $n$ por $4$ multiplica $\sqrt{n}$ por $2$ y divide el error estándar entre $2$.
:::
