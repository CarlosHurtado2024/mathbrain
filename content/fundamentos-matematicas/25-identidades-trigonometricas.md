---
titulo: Identidades trigonométricas
descripcion: Distingue identidades de ecuaciones, simplifica expresiones y demuestra identidades paso a paso.
unidad: Unidad 4 · Trigonometría
modulo: 4.7
video:
etiquetas: identidades trigonometricas identidad pitagorica seno coseno cofuncion simplificar demostrar trigonometria
---

## Primero, la intuición

Una **identidad** es una igualdad que se cumple para todos los valores donde ambos lados están definidos. Una **ecuación condicional** solo se cumple para algunos. Para refutar una falsa identidad basta un contraejemplo; para demostrarla hay que transformar un lado hasta obtener el otro.

## Las identidades fundamentales

$$\sen^2 x + \cos^2 x = 1, \qquad 1 + \tan^2 x = \sec^2 x, \qquad 1 + \cot^2 x = \csc^2 x,$$

$$\sen\left(\tfrac{\pi}{2} - x\right) = \cos x, \qquad \tan\left(\tfrac{\pi}{2} - x\right) = \cot x, \qquad \sec\left(\tfrac{\pi}{2} - x\right) = \csc x.$$

Estrategias para demostrar:

1. Empieza por el lado más complejo.
2. Escribe todo en senos y cosenos.
3. Factoriza, combina fracciones o multiplica por el conjugado.

:::idea
Una identidad se cumple para todos los valores admisibles. La identidad pitagórica $\sen^2 x + \cos^2 x = 1$ sale directamente de la circunferencia unitaria y genera las demás.
:::

:::ejemplo
Para verificar $\dfrac{\sen x}{1 - \cos x} = \dfrac{1 + \cos x}{\sen x}$, multiplica el lado izquierdo por el conjugado $1 + \cos x$: $\dfrac{\sen x(1 + \cos x)}{1 - \cos^2 x} = \dfrac{\sen x(1 + \cos x)}{\sen^2 x} = \dfrac{1 + \cos x}{\sen x}$.
:::

## Practica

:::ejercicio
Simplifica $(1 - \sen^2 x)(1 + \tan^2 x)$.
respuesta: 1
pista: $1 - \sen^2 x = \cos^2 x$ y $1 + \tan^2 x = \sec^2 x$.
solucion: $\cos^2 x \cdot \sec^2 x = 1$.
:::

:::ejercicio
¿A qué es igual $\dfrac{\sec x - \cos x}{\tan x}$?
- [x] $\sen x$
- [ ] $\cos x$ :: Escribe todo con senos y cosenos: $\frac{\sec x - \cos x}{\tan x} = \frac{\sen^2 x / \cos x}{\sen x / \cos x} = \sen x$.
- [ ] $\tan x$ :: Al simplificar, el $\cos x$ del numerador y del denominador se cancela y queda $\sen x$.
solucion: $\dfrac{\frac{1}{\cos x} - \cos x}{\frac{\sen x}{\cos x}} = \dfrac{1 - \cos^2 x}{\sen x} = \dfrac{\sen^2 x}{\sen x} = \sen x$.
:::

:::ejercicio
Para mostrar que $\sen(x + y) = \sen x + \sen y$ no es una identidad, toma $x = y = \tfrac{\pi}{2}$. ¿Cuánto vale el lado derecho?
respuesta: 2
pista: $\sen\tfrac{\pi}{2} = 1$.
solucion: El lado derecho vale $1 + 1 = 2$, pero el izquierdo vale $\sen\pi = 0$. Un solo contraejemplo basta.
:::

:::interactivo
{
  "kind": "proof",
  "statement": "Demuestra que $1 + \\tan^2 x = \\sec^2 x$ eligiendo la justificación de cada paso.",
  "reasons": [
    {
      "id": "tan",
      "label": "Definición de tangente"
    },
    {
      "id": "suma",
      "label": "Suma de fracciones con el mismo denominador"
    },
    {
      "id": "pitagoras",
      "label": "Identidad pitagórica"
    },
    {
      "id": "sec",
      "label": "Definición de secante"
    }
  ],
  "steps": [
    {
      "text": "$1 + \\tan^2 x = 1 + \\frac{\\sen^2 x}{\\cos^2 x}$",
      "reason": "tan",
      "why": "Aquí se reemplazó $\\tan x$ por $\\frac{\\sen x}{\\cos x}$: es su definición."
    },
    {
      "text": "$= \\frac{\\cos^2 x + \\sen^2 x}{\\cos^2 x}$",
      "reason": "suma",
      "why": "Se escribió $1 = \\frac{\\cos^2 x}{\\cos^2 x}$ y se sumaron dos fracciones con el mismo denominador."
    },
    {
      "text": "$= \\frac{1}{\\cos^2 x}$",
      "reason": "pitagoras",
      "why": "El numerador cambió por $1$ gracias a $\\sen^2 x + \\cos^2 x = 1$."
    },
    {
      "text": "$= \\sec^2 x$",
      "reason": "sec",
      "why": "Por definición, $\\sec x = \\frac{1}{\\cos x}$."
    }
  ],
  "hints": [
    "Mira qué cambió de una línea a la siguiente."
  ],
  "solution": "Tangente como cociente, suma con denominador común, identidad pitagórica y definición de secante."
}
:::
