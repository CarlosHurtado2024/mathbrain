---
titulo: Probabilidad condicional e independencia
descripcion: Probabilidad condicional e independencia.
unidad: Módulo 2 · Información, evidencia y variables
video: 
etiquetas: condicional independencia eventos interseccion
---

## Primero, la intuición

La probabilidad condicional cambia el universo de referencia. Si sabes que ocurrió B, solo consideras los resultados dentro de B; de ellos, cuentas los que también pertenecen a A.

Dos eventos son independientes si conocer uno no cambia la probabilidad del otro. No confundas independencia con eventos incompatibles: dos eventos incompatibles de probabilidad positiva no son independientes.

:::idea
Si P(B) > 0, P(A|B) = P(A ∩ B) / P(B). Si A y B son independientes, P(A ∩ B) = P(A)·P(B).
:::

:::ejemplo
En un dado equilibrado, dado que salió un número par, los posibles resultados son {2,4,6}. Solo {6} es mayor que 4. Por tanto, P(mayor que 4 | par) = 1/3.
:::

## Practica

:::ejercicio
Si $P(A \cap B) = 0{,}12$ y $P(B) = 0{,}4$, ¿cuánto vale $P(A \mid B)$?
respuesta: 0,3
pista: $P(A \mid B) = \dfrac{P(A \cap B)}{P(B)}$.
solucion: $\dfrac{0{,}12}{0{,}4} = 0{,}3$.
:::

:::ejercicio
$A$ y $B$ son independientes, con $P(A) = 0{,}5$ y $P(B) = 0{,}3$. ¿Cuánto vale $P(A \cap B)$?
respuesta: 0,15
pista: Para eventos independientes, $P(A \cap B) = P(A) \cdot P(B)$.
solucion: $0{,}5 \cdot 0{,}3 = 0{,}15$.
:::

:::ejercicio
$A$ y $B$ son incompatibles y ambos tienen probabilidad positiva. ¿Son independientes?
- [x] No: si ocurre $B$, $A$ ya no puede ocurrir.
- [ ] Sí, siempre.
- [ ] Solo si $P(A) = P(B)$.
solucion: Si son incompatibles, $P(A \mid B) = 0 \ne P(A)$: saber que ocurrió $B$ cambia la probabilidad de $A$.
:::
