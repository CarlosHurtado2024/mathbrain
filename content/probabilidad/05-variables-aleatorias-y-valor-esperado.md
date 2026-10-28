---
titulo: Variables aleatorias y valor esperado
descripcion: Variables aleatorias, esperanza y distribuciones.
unidad: Módulo 2 · Información, evidencia y variables
video: 
etiquetas: variables aleatorias esperanza distribuciones valor esperado media
---

## Primero, la intuición

Una variable aleatoria traduce los resultados de un experimento a números. Su distribución describe qué valores puede tomar y con qué probabilidades.

Para una variable discreta, el valor esperado se calcula multiplicando cada valor por su probabilidad y sumando. Es un promedio teórico; no tiene que coincidir con un resultado posible ni garantiza lo que ocurrirá en una sola repetición.

:::idea
Una variable aleatoria asigna un número a cada resultado. Su esperanza resume un promedio ponderado por probabilidades, cuando existe.
:::

:::ejemplo
Si X es el resultado de un dado equilibrado, E(X) = (1 + 2 + 3 + 4 + 5 + 6)/6 = 3,5. Ninguna cara muestra 3,5: es el promedio que esperamos aproximar con muchos lanzamientos.
:::

## Practica

:::ejercicio
$X$ toma los valores $0$, $1$ y $2$ con probabilidades $0{,}5$, $0{,}3$ y $0{,}2$. ¿Cuánto vale $E(X)$?
respuesta: 0,7
pista: Multiplica cada valor por su probabilidad y suma.
solucion: $0 \cdot 0{,}5 + 1 \cdot 0{,}3 + 2 \cdot 0{,}2 = 0{,}7$.
:::

:::ejercicio
En un juego ganas $10$ puntos con probabilidad $0{,}2$ y pierdes $2$ puntos con probabilidad $0{,}8$. ¿Cuál es la ganancia esperada por partida?
respuesta: 0,4
pista: $E = 10 \cdot 0{,}2 + (-2) \cdot 0{,}8$.
solucion: $2 - 1{,}6 = 0{,}4$ puntos por partida, en promedio.
:::

:::ejercicio
El valor esperado de un dado es $3{,}5$. ¿Qué significa?
- [x] Es el promedio que se aproxima al repetir muchos lanzamientos.
- [ ] Es el resultado más probable.
- [ ] Es el valor que saldrá en el próximo lanzamiento.
solucion: El valor esperado es un promedio teórico a largo plazo; ninguna cara muestra $3{,}5$.
:::
