---
titulo: Combinaciones y permutaciones
descripcion: Principios de conteo, permutaciones y combinaciones.
video: 
etiquetas: conteo contar combinaciones permutaciones factorial
---

## Primero, la intuición

El principio multiplicativo conecta decisiones sucesivas. Si hay 3 camisetas y 2 pantalones, puedes formar 3·2 = 6 combinaciones de ropa.

Cuando eliges elementos distintos sin repetir, pregunta si importa el orden. Para ordenar r de n elementos hay n!/(n − r)! posibilidades. Si el orden no importa, divide además entre r!: obtienes las combinaciones.

:::idea
Si hay n opciones para una etapa y m para otra, hay n·m pares de opciones. Las combinaciones cuentan selecciones sin considerar el orden.
:::

:::ejemplo
Para elegir 2 personas entre 5 sin asignar cargos, C(5,2) = 5!/(2!·3!) = 10. Si una será presidenta y la otra secretaria, hay 5·4 = 20 opciones.
:::
