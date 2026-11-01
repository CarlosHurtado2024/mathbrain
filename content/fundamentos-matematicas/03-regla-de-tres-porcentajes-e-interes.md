---
titulo: Regla de tres, porcentajes e interés
descripcion: Resuelve problemas de proporcionalidad, variaciones porcentuales e interés simple y compuesto.
unidad: Unidad 1 · Números reales y aritmética
modulo: 1.3
video:
etiquetas: regla de tres porcentaje porcentajes descuento aumento interes simple compuesto aritmetica
---

## Primero, la intuición

La regla de tres es una proporción con una incógnita. Antes de calcular, pregunta: si una magnitud aumenta, ¿la otra aumenta (directa) o disminuye (inversa)? Por ejemplo, si $8$ obreros construyen un muro en $15$ días, más obreros tardan **menos** días: es una relación inversa.

Un **porcentaje** es una razón de consecuente $100$. El $p\,\%$ de una base $B$ es $\dfrac{p}{100}B$. Aumentar un $r$ por uno multiplica por $(1 + r)$ y descontar multiplica por $(1 - r)$.

## Variaciones sucesivas e interés

Dos descuentos sucesivos no se suman: se multiplican sus factores.

$$1 - r_{\text{eq}} = (1 - r_1)(1 - r_2).$$

En el **interés simple** los intereses se calculan siempre sobre el capital inicial. En el **compuesto**, cada periodo genera intereses sobre el monto acumulado:

$$\text{Simple: } M = C(1 + rt), \qquad \text{Compuesto: } M = C(1 + r)^n.$$

:::idea
Un aumento del $r$ por uno multiplica por $(1 + r)$ y un descuento por $(1 - r)$. Las variaciones sucesivas se encadenan multiplicando factores, y el interés compuesto es $M = C(1 + r)^n$.
:::

:::ejemplo
Dos descuentos sucesivos del $30\,\%$ y el $20\,\%$ equivalen a multiplicar por $(0{,}7)(0{,}8) = 0{,}56$. El descuento único equivalente es $1 - 0{,}56 = 0{,}44$, es decir, el $44\,\%$, no el $50\,\%$.
:::

:::nota
«¿De qué número es $756$ el $26\,\%$ más?» pide la base: $1{,}26\,x = 756$, así que $x = 600$. Calcular el $26\,\%$ de $756$ responde a otra pregunta.
:::

## Practica

:::ejercicio
Ocho obreros construyen un muro en $15$ días. ¿Cuántos días tardarán $12$ obreros trabajando al mismo ritmo?
respuesta: 10
pista: Es inversa: el producto obreros × días es constante.
solucion: $8 \cdot 15 = 120$ obreros-día, y $120/12 = 10$ días.
:::

:::ejercicio
¿Qué descuento único equivale a dos descuentos sucesivos del $25\,\%$ y el $20\,\%$?
respuesta: 40%
pista: Multiplica $(1 - 0{,}25)(1 - 0{,}20)$.
solucion: $(0{,}75)(0{,}80) = 0{,}60$, así que el descuento equivalente es $1 - 0{,}60 = 0{,}40$: un $40\,\%$.
:::

:::ejercicio
Se invierten $2\,000\,000$ al $1{,}5\,\%$ mensual durante $12$ meses con interés simple. ¿Cuál es el monto final, en millones?
respuesta: 2,36
pista: $M = C(1 + rt)$ con $r = 0{,}015$ y $t = 12$.
solucion: $M = 2\,000\,000\,(1 + 0{,}015 \cdot 12) = 2\,000\,000 \cdot 1{,}18 = 2\,360\,000$. Con interés compuesto serían unos $2\,391\,236$.
:::

:::interactivo
{
  "kind": "context",
  "context": "Una tienda sube el precio de un audífono de \\$50.000 un $20\\ \\%$ en diciembre. En enero lo rebaja un $20\\ \\%$ sobre el precio de diciembre.",
  "ask": {
    "kind": "numeric",
    "statement": "¿Cuál es el precio en enero, en miles de pesos?",
    "answer": "48",
    "label": "Precio en miles de pesos",
    "unit": "mil",
    "mistakes": [
      {
        "answer": "50",
        "why": "Subir y bajar el mismo porcentaje no se cancela: el $20\\ \\%$ de enero se calcula sobre un precio mayor."
      },
      {
        "answer": "60",
        "why": "Ese es el precio de diciembre. Falta aplicar la rebaja de enero."
      },
      {
        "answer": "40",
        "why": "Aplicaste la rebaja sobre el precio original. En enero se descuenta sobre el precio de diciembre."
      }
    ]
  },
  "hints": [
    "Calcula primero el precio de diciembre: $50 \\cdot 1{,}2$.",
    "Rebajar un $20\\ \\%$ es multiplicar por $0{,}8$."
  ],
  "solution": "$50 \\cdot 1{,}2 = 60$ y $60 \\cdot 0{,}8 = 48$: el precio final es \\$48.000. Las variaciones sucesivas se multiplican: $1{,}2 \\cdot 0{,}8 = 0{,}96$, es decir, una baja del $4\\ \\%$."
}
:::
