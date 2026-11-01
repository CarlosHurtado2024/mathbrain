# Animaciones de Manim

Las animaciones de Zuka se escriben con [Manim Community](https://www.manim.community/) en `escenas.py` y se publican como video MP4 en `src/assets/videos/`, con subtítulos WebVTT y una portada JPG. **No se convierten en simulaciones**: en la lección son bloques de video (`:::visual` con `"engine": "manim"`).

## Renderizar

```bash
python -m venv .manim
.manim/Scripts/python -m pip install manim
.manim/Scripts/python manim/render.py            # todas
.manim/Scripts/python manim/render.py suma-riemann
```

`render.py` produce por escena `nombre.mp4` (720p, 30 cuadros), `nombre.vtt` y `nombre.jpg`, e informa la duración y el peso. No hace falta LaTeX: las escenas usan `Text`.

## Escribir una escena

- Hereda de `EscenaConGuion` y arma la animación con `self.tramo(subtítulo, duración, *animaciones)`. Cada tramo dura exactamente lo indicado, así que los subtítulos salen del mismo guion y quedan sincronizados.
- Duración: entre 30 y 90 segundos. Una idea por video.
- Colores de la identidad: fondo `#050807`, menta `#59f7bd`, tinta `#f0f7f2`, arena `#e2ce94`.
- Deja libre la franja inferior: ahí aparecen los subtítulos.
- Registra la escena en `ESCENAS` con el nombre del archivo.

## Usarla en una lección

```
:::visual
{ "engine": "manim", "src": "assets/videos/suma-riemann.mp4", "captions": "assets/videos/suma-riemann.vtt", "poster": "assets/videos/suma-riemann.jpg", "title": "Sumar rectángulos para medir un área" }
:::
```

Los videos se reproducen en línea (`playsinline`) en el celular y no se guardan para usar sin conexión.
