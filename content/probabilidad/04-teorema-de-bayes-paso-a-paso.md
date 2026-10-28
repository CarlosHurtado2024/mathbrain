---
titulo: Teorema de Bayes, paso a paso
descripcion: Combina la información previa con nueva evidencia.
unidad: Módulo 2 · Información, evidencia y variables
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

## Practica

:::ejercicio
Con los datos de la fábrica (A produce el $60\,\%$ con $2\,\%$ de defectos; B el $40\,\%$ con $5\,\%$), ¿cuál es la probabilidad de que una pieza elegida al azar sea defectuosa?
respuesta: 0,032
tolerancia: 0,0005
pista: Suma las dos formas de obtener un defecto: $0{,}6 \cdot 0{,}02 + 0{,}4 \cdot 0{,}05$.
solucion: $0{,}012 + 0{,}020 = 0{,}032$, es decir, un $3{,}2\,\%$. Es el denominador del teorema de Bayes.
:::

:::ejercicio
Una enfermedad afecta al $1\,\%$ de la población. Una prueba detecta al $90\,\%$ de los enfermos, pero da positivo en el $5\,\%$ de los sanos. Si alguien da positivo, ¿cuál es la probabilidad de que esté enfermo? Usa tres decimales.
respuesta: 0,154
tolerancia: 0,003
pista: Imagina $1000$ personas: $10$ enfermas y $990$ sanas. Cuenta los positivos de cada grupo.
solucion: Positivos: $9$ enfermos y $49{,}5$ sanos. $P = \dfrac{9}{9 + 49{,}5} \approx 0{,}154$.
:::

:::ejercicio
¿Por qué en el ejemplo anterior un positivo deja una probabilidad tan baja de estar enfermo?
- [x] Porque la enfermedad es rara y los falsos positivos de los muchos sanos superan a los verdaderos positivos.
- [ ] Porque la prueba falla la mayoría de las veces.
- [ ] Porque el teorema de Bayes no se aplica a pruebas médicas.
solucion: La probabilidad previa importa: con una causa poco frecuente, la mayoría de los positivos vienen del grupo grande de sanos.
:::
