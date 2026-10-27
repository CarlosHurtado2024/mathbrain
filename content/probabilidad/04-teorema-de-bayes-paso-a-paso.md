---
titulo: Teorema de Bayes, paso a paso
descripcion: Combina la información previa con nueva evidencia.
video: 
etiquetas: bayes teorema condicional evidencia previa
---

## Primero, la intuición

Bayes permite invertir una probabilidad condicional. Parte de la probabilidad previa de una causa y la combina con la probabilidad de observar la evidencia si esa causa estuviera presente.

El denominador reúne todas las formas de observar la evidencia. Olvidarlo lleva a sobreestimar causas poco frecuentes. Puedes organizar la información como un árbol o como una tabla de frecuencias.

:::idea
Si P(B) > 0, el teorema de Bayes establece P(A|B) = P(B|A)·P(A) / P(B).
:::

:::ejemplo
Una fábrica usa A el 60 % del tiempo y B el 40 %. A produce un 2 % de piezas defectuosas y B un 5 %. Si una pieza es defectuosa, P(B | defecto) = (0,4·0,05)/(0,6·0,02 + 0,4·0,05) = 0,625.
:::
