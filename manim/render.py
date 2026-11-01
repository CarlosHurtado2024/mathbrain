"""Renderiza las animaciones de Manim y deja en src/assets/videos/ el MP4, los subtítulos (.vtt) y la portada (.jpg).

Uso:  python manim/render.py [nombre ...]      (sin nombres, renderiza todas)
Requiere: pip install manim   (ver manim/README.md)
"""
import shutil
import sys
import tempfile
from pathlib import Path

import av
from manim import config, tempconfig

sys.path.insert(0, str(Path(__file__).parent))
from escenas import ESCENAS  # noqa: E402

DESTINO = Path(__file__).resolve().parent.parent / "src" / "assets" / "videos"


def marca(segundos):
    horas, resto = divmod(segundos, 3600)
    minutos, segundos = divmod(resto, 60)
    return f"{int(horas):02d}:{int(minutos):02d}:{segundos:06.3f}"


def subtitulos(guion):
    lineas = ["WEBVTT", ""]
    for numero, (inicio, fin, frase) in enumerate(guion, 1):
        lineas += [str(numero), f"{marca(inicio)} --> {marca(fin)}", frase, ""]
    return "\n".join(lineas)


def portada(video, destino, segundo):
    with av.open(str(video)) as contenedor:
        flujo = contenedor.streams.video[0]
        for cuadro in contenedor.decode(flujo):
            if cuadro.time is not None and cuadro.time >= segundo:
                cuadro.to_image().save(destino, quality=82)
                return


def renderizar(nombre):
    escena = ESCENAS[nombre]
    escena.guion = []
    with tempfile.TemporaryDirectory() as carpeta:
        # 720p a 30 cuadros: buena lectura en el celular con un archivo liviano.
        with tempconfig({"quality": "medium_quality", "media_dir": carpeta, "output_file": nombre, "disable_caching": True, "verbosity": "WARNING"}):
            escena().render()
            video = next(Path(carpeta).rglob(f"{nombre}.mp4"))
            DESTINO.mkdir(parents=True, exist_ok=True)
            shutil.copy(video, DESTINO / f"{nombre}.mp4")
    (DESTINO / f"{nombre}.vtt").write_text(subtitulos(escena.guion), encoding="utf-8")
    duracion = escena.guion[-1][1]
    portada(DESTINO / f"{nombre}.mp4", DESTINO / f"{nombre}.jpg", duracion - 1.5)
    tamano = (DESTINO / f"{nombre}.mp4").stat().st_size / 1e6
    print(f"{nombre}: {duracion:.1f} s, {tamano:.1f} MB, {len(escena.guion)} subtítulos")


if __name__ == "__main__":
    for nombre in sys.argv[1:] or ESCENAS:
        renderizar(nombre)
