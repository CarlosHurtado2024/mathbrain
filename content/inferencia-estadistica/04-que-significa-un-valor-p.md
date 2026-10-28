---
titulo: ¿Qué significa un valor p?
descripcion: Hipótesis nula, valores p y errores de decisión.
unidad: Módulo 2 · Estimar y contrastar
video: 
etiquetas: hipotesis nula contraste prueba valor p significacion
---

## Primero, la intuición

Una prueba de hipótesis plantea una hipótesis nula, un estadístico y un modelo para describir cómo variaría ese estadístico si la hipótesis fuera cierta.

El valor p es la probabilidad, bajo ese modelo y sus supuestos, de resultados al menos tan extremos como el observado. No es la probabilidad de que la hipótesis nula sea cierta ni la probabilidad de que el resultado se deba al azar.

:::idea
Un valor p mide, bajo la hipótesis nula y los supuestos del modelo, la probabilidad de resultados al menos tan extremos como el observado.
:::

:::ejemplo
En una prueba bilateral de una media con estadístico normal estándar z = 2, el valor p es aproximadamente 0,0455. Es la probabilidad de observar |Z| ≥ 2 bajo la hipótesis nula.
:::

## Practica

:::ejercicio
En una prueba bilateral con estadístico normal estándar $z = 1{,}96$, ¿cuál es aproximadamente el valor p?
respuesta: 0,05
tolerancia: 0,002
pista: $1{,}96$ es el valor que deja un $2{,}5\,\%$ en cada cola.
solucion: $P(|Z| \ge 1{,}96) \approx 2 \cdot 0{,}025 = 0{,}05$.
:::

:::ejercicio
Un estudio informa un valor p de $0{,}03$. ¿Qué significa?
- [ ] Hay un $3\,\%$ de probabilidad de que la hipótesis nula sea cierta.
- [x] Si la hipótesis nula fuera cierta, resultados al menos tan extremos aparecerían cerca del $3\,\%$ de las veces.
- [ ] Hay un $97\,\%$ de probabilidad de que el efecto sea real.
solucion: El valor p se calcula suponiendo que la hipótesis nula es cierta; no es la probabilidad de la hipótesis.
:::

:::ejercicio
Un valor p muy pequeño garantiza que…
- [ ] el efecto es grande e importante.
- [ ] el estudio no tiene errores de diseño.
- [x] ninguna de las anteriores: solo indica que los datos serían raros bajo la hipótesis nula.
solucion: Con muestras grandes, efectos diminutos dan valores p pequeños; y el valor p no corrige un mal diseño.
:::
