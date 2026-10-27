---
titulo: Triángulos oblicuos: ley de senos y ley de cosenos
descripcion: Resuelve cualquier triángulo, el caso ambiguo y el área con la fórmula de Herón.
unidad: Unidad 4 · Trigonometría
modulo: 4.6
video:
etiquetas: ley de senos ley de cosenos triangulos oblicuos caso ambiguo heron area topografia navegacion trigonometria
---

## Primero, la intuición

En un triángulo sin ángulo recto ya no hay catetos ni hipotenusa, pero los lados y los ángulos siguen relacionados. Con la notación habitual (el lado $a$ es opuesto al ángulo $A$):

$$\frac{\sen A}{a} = \frac{\sen B}{b} = \frac{\sen C}{c}, \qquad a^2 = b^2 + c^2 - 2bc\cos A.$$

La ley de cosenos generaliza el teorema de Pitágoras: si $A = 90^\circ$, el término $2bc\cos A$ desaparece.

## Qué ley usar

- **Ley de senos:** si conoces dos ángulos y un lado (ALA, AAL), o dos lados y un ángulo opuesto a uno de ellos (LLA).
- **Ley de cosenos:** si conoces dos lados y el ángulo comprendido (LAL) o los tres lados (LLL).

El caso **LLA es ambiguo**: puede haber ninguno, uno o dos triángulos. Para el área:

$$\text{Área} = \tfrac{1}{2}ab\sen C, \qquad \text{Área} = \sqrt{s(s - a)(s - b)(s - c)}, \qquad s = \frac{a + b + c}{2}.$$

:::idea
La ley de senos relaciona cada lado con su ángulo opuesto; la de cosenos generaliza a Pitágoras: $a^2 = b^2 + c^2 - 2bc\cos A$. El caso LLA puede dar cero, uno o dos triángulos.
:::

:::ejemplo
Si $a = 7$, $b = 9$ y $C = 60^\circ$, la ley de cosenos da $c^2 = 49 + 81 - 2 \cdot 7 \cdot 9 \cdot \tfrac{1}{2} = 67$, así que $c = \sqrt{67} \approx 8{,}19$.
:::

## Practica

:::ejercicio
Calcula el área del triángulo de lados $13$, $14$ y $15$.
respuesta: 84
pista: Usa la fórmula de Herón con $s = 21$.
solucion: $\sqrt{21 \cdot 8 \cdot 7 \cdot 6} = \sqrt{7056} = 84$.
:::

:::ejercicio
Dos barcos salen del mismo puerto con rumbos que forman $110^\circ$, a $20$ km/h y $28$ km/h. ¿Qué distancia los separa después de $2$ horas, en km?
respuesta: 79,2
tolerancia: 0,1
pista: Han recorrido $40$ y $56$ km. Usa la ley de cosenos con el ángulo de $110^\circ$.
solucion: $d^2 = 40^2 + 56^2 - 2 \cdot 40 \cdot 56 \cos 110^\circ \approx 4736 + 1532 = 6268$, así que $d \approx 79{,}2$ km.
:::

:::ejercicio
Con $a = 8$, $b = 10$ y $A = 35^\circ$, ¿cuántos triángulos existen?
respuesta: 2
pista: Calcula $\sen B = \tfrac{10 \sen 35^\circ}{8}$ y revisa los dos ángulos posibles para $B$.
solucion: $\sen B \approx 0{,}717$, así que $B \approx 45{,}8^\circ$ o $B \approx 134{,}2^\circ$. Ambos dejan espacio para $C$, porque $35^\circ + 134{,}2^\circ < 180^\circ$: hay dos triángulos.
:::
