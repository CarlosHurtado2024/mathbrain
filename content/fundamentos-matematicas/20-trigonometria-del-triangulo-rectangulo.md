---
titulo: Trigonometría del triángulo rectángulo
descripcion: Las seis razones trigonométricas, los ángulos notables y la medición indirecta.
unidad: Unidad 4 · Trigonometría
modulo: 4.2
video:
etiquetas: seno coseno tangente triangulo rectangulo hipotenusa catetos razones trigonometricas angulos notables elevacion depresion trigonometria
---

## Primero, la intuición

Todos los triángulos rectángulos con el mismo ángulo agudo $\theta$ son semejantes, así que los cocientes entre sus lados no dependen del tamaño: solo de $\theta$. Esos cocientes son las razones trigonométricas.

$$\sen\theta = \frac{\text{op}}{\text{hip}}, \qquad \cos\theta = \frac{\text{ady}}{\text{hip}}, \qquad \tan\theta = \frac{\text{op}}{\text{ady}},$$

$$\csc\theta = \frac{1}{\sen\theta}, \qquad \sec\theta = \frac{1}{\cos\theta}, \qquad \cot\theta = \frac{1}{\tan\theta}.$$

## Ángulos notables

Del triángulo equilátero y del cuadrado se deducen valores exactos:

$$\sen 30^\circ = \tfrac{1}{2}, \qquad \cos 30^\circ = \tfrac{\sqrt{3}}{2}, \qquad \sen 45^\circ = \cos 45^\circ = \tfrac{\sqrt{2}}{2}, \qquad \tan 60^\circ = \sqrt{3}.$$

Por Pitágoras se cumplen $\sen^2\theta + \cos^2\theta = 1$ y $1 + \tan^2\theta = \sec^2\theta$. Estas razones permiten calcular alturas y distancias que no se pueden medir directamente, con ángulos de elevación y de depresión.

:::idea
En un triángulo rectángulo, $\sen\theta = \text{op}/\text{hip}$, $\cos\theta = \text{ady}/\text{hip}$ y $\tan\theta = \text{op}/\text{ady}$. Solo dependen del ángulo, no del tamaño del triángulo.
:::

:::ejemplo
Desde un punto a $40$ m de la base de un edificio, el ángulo de elevación a la azotea es de $52^\circ$. La altura es el cateto opuesto: $h = 40 \tan 52^\circ \approx 40 \cdot 1{,}280 \approx 51{,}2$ m.
:::

## Practica

:::ejercicio
Los catetos de un triángulo rectángulo miden $5$ y $12$. ¿Cuánto vale el coseno del ángulo opuesto al cateto de $5$?
respuesta: 12/13
pista: La hipotenusa mide $\sqrt{25 + 144}$.
solucion: La hipotenusa es $13$. El cateto adyacente a ese ángulo mide $12$, así que $\cos\theta = \tfrac{12}{13}$.
:::

:::ejercicio
Calcula el valor exacto de $\sen 60^\circ \cos 30^\circ + \tan^2 45^\circ - \csc^2 30^\circ$.
respuesta: -9/4
pista: $\sen 60^\circ = \cos 30^\circ = \tfrac{\sqrt{3}}{2}$, $\tan 45^\circ = 1$ y $\csc 30^\circ = 2$.
solucion: $\tfrac{3}{4} + 1 - 4 = -\tfrac{9}{4}$.
:::

:::ejercicio
La hipotenusa de un triángulo rectángulo mide $25$ y un ángulo agudo mide $30^\circ$. ¿Cuánto mide el cateto opuesto a ese ángulo?
respuesta: 12,5
pista: Usa $\sen 30^\circ = \tfrac{1}{2}$.
solucion: $25 \sen 30^\circ = 12{,}5$. El otro cateto mide $25 \cos 30^\circ \approx 21{,}65$.
:::
