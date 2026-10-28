---
titulo: Máximos y mínimos con derivadas
descripcion: Usa las derivadas para interpretar y optimizar.
unidad: Módulo 2 · La derivada y sus aplicaciones
video: 
etiquetas: optimizacion maximos minimos derivadas extremos
---

## Primero, la intuición

Los extremos interiores de una función derivable pueden aparecer donde la derivada vale cero. También hay que revisar los puntos donde la derivada no existe y, si el intervalo es cerrado, sus extremos.

Para clasificar un punto crítico, observa el signo de la derivada a ambos lados: de negativo a positivo indica un mínimo; de positivo a negativo, un máximo. Una derivada cero sin cambio de signo puede no ser un extremo.

:::idea
En un extremo local interior de una función derivable, la derivada es cero. Una derivada igual a cero no garantiza por sí sola un extremo.
:::

:::ejemplo
Para f(x) = x² − 4x + 5, f′(x) = 2x − 4 se anula en x = 2. La derivada pasa de negativa a positiva, así que hay un mínimo: f(2) = 1.
:::

## Practica

:::ejercicio
Para $f(x) = x^2 - 6x + 2$, ¿en qué valor de $x$ está su punto crítico?
respuesta: 3
pista: Resuelve $f'(x) = 2x - 6 = 0$.
solucion: $2x - 6 = 0$ da $x = 3$.
:::

:::ejercicio
¿Cuál es el valor mínimo de $f(x) = x^2 - 6x + 2$?
respuesta: -7
pista: Evalúa la función en su punto crítico, $x = 3$.
solucion: $f(3) = 9 - 18 + 2 = -7$. La derivada pasa de negativa a positiva, así que es un mínimo.
:::

:::ejercicio
En $x = a$ se cumple $f'(a) = 0$ y la derivada pasa de positiva a negativa. ¿Qué hay en $a$?
- [x] Un máximo local.
- [ ] Un mínimo local.
- [ ] No se puede saber nada.
solucion: La función sube antes de $a$ y baja después: alcanza un máximo local.
:::
