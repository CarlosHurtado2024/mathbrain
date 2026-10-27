---
titulo: Funciones exponenciales y logarítmicas
descripcion: Crecimiento exponencial, el número e, logaritmos, sus leyes y ecuaciones.
unidad: Unidad 3 · Funciones
modulo: 3.7
video:
etiquetas: exponencial exponenciales logaritmo logaritmos numero e ln cambio de base crecimiento decaimiento vida media interes continuo funciones
---

## Primero, la intuición

En el crecimiento lineal se **suma** lo mismo en cada periodo; en el exponencial se **multiplica** por lo mismo. Por eso una población, una inversión o una muestra radiactiva se describen con $f(x) = a^x$, con $a > 0$ y $a \ne 1$.

El logaritmo responde a la pregunta inversa: ¿a qué exponente hay que elevar $a$ para obtener $x$?

$$\log_a x = y \iff a^y = x \qquad (x > 0).$$

## Leyes y modelos

$$\log_a(xy) = \log_a x + \log_a y, \qquad \log_a \frac{x}{y} = \log_a x - \log_a y, \qquad \log_a x^r = r \log_a x, \qquad \log_a x = \frac{\ln x}{\ln a}.$$

El número $e = \lim_{n \to \infty}\left(1 + \frac{1}{n}\right)^n \approx 2{,}71828$ aparece con la capitalización continua:

$$A = P\left(1 + \frac{r}{n}\right)^{nt}, \qquad A = Pe^{rt}, \qquad m(t) = m_0\, 2^{-t/h} \;\text{(vida media } h\text{)}.$$

:::idea
El logaritmo es la función inversa de la exponencial: $\log_a x = y \iff a^y = x$. Sus leyes convierten productos en sumas y potencias en productos, lo que permite despejar exponentes.
:::

:::ejemplo
Para resolver $\log_2 x + \log_2(x - 2) = 3$, combina: $\log_2[x(x - 2)] = 3$, así que $x^2 - 2x = 8$ y $(x - 4)(x + 2) = 0$. El candidato $-2$ no está en el dominio del logaritmo, así que la única solución es $x = 4$.
:::

## Practica

:::ejercicio
Resuelve $2^{x+1} = 3^x$ con dos cifras decimales.
respuesta: 1,71
tolerancia: 0,01
pista: Toma logaritmo natural en ambos lados: $(x + 1)\ln 2 = x \ln 3$.
solucion: $x = \dfrac{\ln 2}{\ln 3 - \ln 2} \approx \dfrac{0{,}6931}{0{,}4055} \approx 1{,}71$.
:::

:::ejercicio
Un isótopo tiene vida media de $30$ años. ¿Qué fracción de la muestra queda después de $90$ años?
respuesta: 1/8
pista: $90$ años son $3$ vidas medias.
solucion: $m(90) = m_0 \cdot 2^{-90/30} = m_0 \cdot 2^{-3} = \tfrac{1}{8}m_0$.
:::

:::ejercicio
Con capitalización continua al $6\,\%$ anual, ¿en cuántos años se duplica una inversión? Usa dos decimales.
respuesta: 11,55
tolerancia: 0,02
pista: $2P = Pe^{0{,}06\,t}$, así que $t = \dfrac{\ln 2}{0{,}06}$.
solucion: $t = \dfrac{0{,}6931}{0{,}06} \approx 11{,}55$ años.
:::
