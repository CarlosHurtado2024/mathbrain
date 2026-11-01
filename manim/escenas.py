"""Animaciones de Zuka con Manim Community.

Cada escena se escribe como una lista de tramos. Un tramo tiene su subtítulo y su duración exacta, así que
los subtítulos (WebVTT) salen del mismo guion que la animación y siempre quedan sincronizados.
Se usa Text (no MathTex) para no depender de una instalación de LaTeX.

Renderizar: python manim/render.py   (ver manim/README.md)
"""
from manim import (
    Axes, Create, DashedLine, Dot, FadeIn, FadeOut, Line, Scene, Text, Transform, ValueTracker, VGroup,
    Write, always_redraw, config, linear, smooth, DOWN, UP, LEFT, RIGHT, UR, UL,
)

FONDO = "#050807"
MENTA = "#59f7bd"
TINTA = "#f0f7f2"
NIEBLA = "#b7c9bd"
ARENA = "#e2ce94"
LINEA = "#345540"
FUENTE = "Arial"

config.background_color = FONDO


def texto(contenido, tamano=30, color=TINTA, **opciones):
    return Text(contenido, font=FUENTE, font_size=tamano, color=color, **opciones)


def numero(valor, decimales=2):
    return f"{valor:.{decimales}f}".replace(".", ",")


class EscenaConGuion(Scene):
    """Ejecuta los tramos y guarda el guion para los subtítulos."""

    guion = []

    def tramo(self, subtitulo, duracion, *animaciones, run_time=None):
        inicio = self.renderer.time
        if animaciones:
            self.play(*animaciones, run_time=run_time or min(duracion, 2))
        restante = duracion - (self.renderer.time - inicio)
        if restante > 0.01:
            self.wait(restante)
        type(self).guion.append((inicio, self.renderer.time, subtitulo))

    def ejes(self, x_rango, y_rango, ancho=10, alto=5.6):
        return Axes(x_range=x_rango, y_range=y_rango, x_length=ancho, y_length=alto, tips=False,
                    axis_config={"color": LINEA, "stroke_width": 2, "include_ticks": True}).shift(DOWN * 0.4)


class DerivadaSecantes(EscenaConGuion):
    """De la secante a la tangente: la derivada como límite de pendientes (unos 50 s)."""

    guion = []

    def construct(self):
        titulo = texto("De la secante a la tangente", 40).to_edge(UP)
        ejes = self.ejes([-1, 4, 1], [-1, 6, 1]).shift(RIGHT * 1.4)
        f = lambda x: 0.35 * x ** 2 + 0.6
        df = lambda x: 0.7 * x
        curva = ejes.plot(f, x_range=[-0.8, 3.7], color=TINTA, stroke_width=4)
        x0 = 1.2
        h = ValueTracker(2.2)
        p = Dot(ejes.c2p(x0, f(x0)), color=MENTA, radius=0.09)
        q = always_redraw(lambda: Dot(ejes.c2p(x0 + h.get_value(), f(x0 + h.get_value())), color=ARENA, radius=0.08))

        def secante():
            x1 = x0 + h.get_value()
            m = (f(x1) - f(x0)) / (x1 - x0)
            return Line(ejes.c2p(-0.8, f(x0) + m * (-0.8 - x0)), ejes.c2p(3.7, f(x0) + m * (3.7 - x0)), color=ARENA, stroke_width=4)

        recta = always_redraw(secante)
        lectura = always_redraw(lambda: texto(
            f"h = {numero(h.get_value())}    pendiente = {numero((f(x0 + h.get_value()) - f(x0)) / h.get_value())}", 28, NIEBLA
        ).to_corner(UL).shift(DOWN * 0.9))
        etiqueta_p = texto("P", 28, MENTA).next_to(p, UL, buff=0.1)

        self.tramo("La derivada mide qué tan rápido cambia una función en un punto.", 4, Write(titulo))
        self.tramo("Partimos de una curva y de un punto P sobre ella.", 4, Create(ejes), Create(curva), FadeIn(p), FadeIn(etiqueta_p))
        self.tramo("Tomamos otro punto Q, a una distancia h hacia la derecha.", 4, FadeIn(q))
        self.tramo("La recta que pasa por P y por Q es una secante. Su pendiente es el cambio medio.", 6, Create(recta), FadeIn(lectura))
        self.tramo("Ahora acercamos Q a P: h se hace cada vez más pequeña.", 9, h.animate.set_value(0.6), run_time=8)
        self.tramo("La secante gira y su pendiente se estabiliza.", 7, h.animate.set_value(0.05), run_time=6)
        tangente = Line(ejes.c2p(-0.8, f(x0) + df(x0) * (-0.8 - x0)), ejes.c2p(3.7, f(x0) + df(x0) * (3.7 - x0)), color=MENTA, stroke_width=6)
        self.tramo("La recta límite es la tangente en P.", 4, Create(tangente))
        conclusion = texto(f"Derivada en P = {numero(df(x0))}", 34, MENTA).to_corner(UR).shift(DOWN * 0.9)
        self.tramo(f"Su pendiente, {numero(df(x0))}, es la derivada: el límite de las pendientes de las secantes.", 7, Write(conclusion))
        self.tramo("Esa es la idea: la derivada es el cambio instantáneo.", 4, FadeOut(recta), FadeOut(q), FadeOut(lectura))


class SumaRiemann(EscenaConGuion):
    """Rectángulos cada vez más delgados se acercan al área bajo la curva (unos 45 s)."""

    guion = []

    def construct(self):
        titulo = texto("Sumar rectángulos para medir un área", 38).to_edge(UP)
        ejes = self.ejes([-0.5, 4.5, 1], [-0.5, 7.5, 1], alto=5.2)
        f = lambda x: 0.25 * x ** 2 + 1
        curva = ejes.plot(f, x_range=[-0.2, 4.3], color=TINTA, stroke_width=4)
        exacta = 28 / 3

        def rectangulos(n):
            return ejes.get_riemann_rectangles(curva, x_range=[0, 4], dx=4 / n, input_sample_type="left",
                                              stroke_width=1, stroke_color=FONDO, fill_opacity=0.75, color=[MENTA, MENTA])

        def suma(n):
            dx = 4 / n
            return sum(f(i * dx) * dx for i in range(n))

        def lectura(n):
            return texto(f"{n} rectángulos: suma = {numero(suma(n), 3)}", 30, NIEBLA).to_corner(UL).shift(DOWN * 0.9)

        self.tramo("¿Cuánto mide el área bajo esta curva, entre 0 y 4?", 5, Write(titulo), Create(ejes), Create(curva))
        barras = rectangulos(4)
        texto_suma = lectura(4)
        self.tramo("Una forma de aproximarla: cubrirla con cuatro rectángulos y sumar sus áreas.", 6, Create(barras), FadeIn(texto_suma))
        self.tramo("Los rectángulos dejan huecos: la suma se queda corta.", 4)
        for n, mensaje in [(8, "Con ocho rectángulos más delgados, los huecos se reducen."),
                           (16, "Con dieciséis, la suma se acerca todavía más."),
                           (64, "Con sesenta y cuatro, casi no se distinguen de la curva.")]:
            self.tramo(mensaje, 5, Transform(barras, rectangulos(n)), Transform(texto_suma, lectura(n)), run_time=2)
        area = texto(f"Área exacta = 28/3 ≈ {numero(exacta, 3)}", 34, MENTA).to_corner(UR).shift(DOWN * 0.9)
        self.tramo("Si seguimos sin límite, las sumas se acercan a un único número: la integral.", 7, Write(area))
        self.tramo("La integral definida es el límite de las sumas de Riemann.", 5)


ESCENAS = {"derivada-secantes": DerivadaSecantes, "suma-riemann": SumaRiemann}
