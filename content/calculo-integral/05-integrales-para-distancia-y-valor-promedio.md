---
titulo: Integrales para distancia y valor promedio
descripcion: Aplicaciones a distancia, volumen y valor promedio.
unidad: Módulo 2 · El teorema fundamental y sus aplicaciones
video: 
etiquetas: integrales aplicaciones distancia desplazamiento promedio volumen
---

## Primero, la intuición

Si conoces una velocidad en función del tiempo, su integral da el desplazamiento. Para calcular la distancia recorrida, integra el valor absoluto de la velocidad y ten en cuenta los cambios de sentido.

El valor promedio de una función en [a,b], con a < b, se obtiene dividiendo su integral entre b − a. Es la altura constante que produciría la misma acumulación.

:::idea
La integral de la velocidad da el desplazamiento. La distancia recorrida se obtiene integrando el valor absoluto de la velocidad.
:::

:::ejemplo
Si v(t) = 2t m/s entre t = 0 y t = 3 s, el desplazamiento es [t²] de 0 a 3 = 9 m. Como la velocidad no es negativa, la distancia también es 9 m.
:::

## Practica

:::ejercicio
Si $v(t) = 3t^2$ m/s, ¿cuál es el desplazamiento entre $t = 0$ y $t = 2$ s, en metros?
respuesta: 8
pista: Integra la velocidad: una primitiva de $3t^2$ es $t^3$.
solucion: $2^3 - 0^3 = 8$ m. Como la velocidad no es negativa, la distancia también es $8$ m.
:::

:::ejercicio
¿Cuál es el valor promedio de $f(x) = x^2$ en el intervalo $[0, 3]$?
respuesta: 3
pista: Promedio $= \dfrac{1}{b - a}\displaystyle\int_a^b f(x)\,dx$.
solucion: $\displaystyle\int_0^3 x^2\,dx = 9$, y $\dfrac{9}{3} = 3$.
:::

:::ejercicio
Si la velocidad de un objeto cambia de signo durante el recorrido, entonces…
- [ ] la distancia recorrida es igual al desplazamiento.
- [x] la distancia recorrida es mayor que el valor absoluto del desplazamiento.
- [ ] el desplazamiento siempre es cero.
solucion: Al cambiar de sentido, parte del recorrido se compensa en el desplazamiento, pero se suma en la distancia.
:::
