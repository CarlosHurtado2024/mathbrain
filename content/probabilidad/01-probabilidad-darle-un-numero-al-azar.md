---
titulo: Probabilidad: darle un número al azar
descripcion: Experimentos, resultados y espacios muestrales.
unidad: Módulo 1 · Contar y medir el azar
video: 
etiquetas: azar eventos espacio muestral dado moneda
---

## Primero, la intuición

Primero define el experimento y el espacio muestral: todos sus resultados posibles. Un evento es un conjunto de esos resultados. Su probabilidad expresa qué tan posible es dentro del modelo elegido.

Si los resultados son equiprobables, puedes dividir los casos favorables entre los posibles. Esa regla no vale automáticamente si unos resultados son más probables que otros.

:::idea
La probabilidad de un evento está entre 0 y 1. El espacio muestral contiene todos los resultados posibles del experimento.
:::

:::ejemplo
Al lanzar un dado equilibrado, los resultados posibles son 1, 2, 3, 4, 5 y 6. El evento «obtener un par» es {2, 4, 6}, por lo que su probabilidad es 3/6 = 1/2.
:::

## Practica

:::ejercicio
Al lanzar un dado equilibrado, ¿cuál es la probabilidad de obtener un número mayor que $4$?
respuesta: 1/3
tolerancia: 0,001
pista: Cuenta los resultados favorables: $5$ y $6$.
solucion: $\dfrac{2}{6} = \dfrac{1}{3}$.
:::

:::ejercicio
Se lanzan dos monedas equilibradas. ¿Cuál es la probabilidad de obtener dos caras?
respuesta: 1/4
pista: El espacio muestral es $\{CC, CS, SC, SS\}$.
solucion: Solo $CC$ es favorable entre $4$ resultados equiprobables: $\dfrac{1}{4}$.
:::

:::ejercicio
¿Cuál de estos números **no** puede ser una probabilidad?
- [ ] $0$ :: $0$ sí es una probabilidad: la de un evento imposible.
- [ ] $0{,}75$ :: $0{,}75$ está entre $0$ y $1$, así que puede ser una probabilidad.
- [x] $1{,}2$
solucion: Toda probabilidad está entre $0$ y $1$.
:::

:::interactivo
{
  "kind": "simulation",
  "statement": "Se lanzan dos dados. Estima la probabilidad de que la suma sea $7$ y compárala con una simulación.",
  "model": {
    "kind": "dice",
    "count": 2,
    "event": {
      "op": "=",
      "value": 7
    }
  },
  "tolerance": 0.005,
  "mistakes": [
    {
      "answer": "1/11",
      "why": "Hay $11$ sumas posibles (de $2$ a $12$), pero no son igual de probables: el $7$ se forma de más maneras que el $2$."
    },
    {
      "answer": "1/36",
      "why": "Contaste una sola forma de sumar $7$. Hay seis: $(1,6), (2,5), (3,4), (4,3), (5,2)$ y $(6,1)$."
    },
    {
      "answer": "1/12",
      "why": "Hay seis parejas que suman $7$, no tres: $(3,4)$ y $(4,3)$ son resultados distintos."
    }
  ],
  "hints": [
    "Hay $6 \\cdot 6 = 36$ resultados igual de probables.",
    "Cuenta las parejas ordenadas que suman $7$."
  ],
  "solution": "De los $36$ resultados, seis suman $7$: $P = \\frac{6}{36} = \\frac{1}{6} \\approx 0{,}167$. Con muchos lanzamientos, la frecuencia se acerca a ese valor."
}
:::
