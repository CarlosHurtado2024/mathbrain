# Probar Zuka en tu celular Android

Guía para Windows 11 y un celular Android (por ejemplo, Motorola Moto G). Zuka es una app web: **no necesitas Android Studio, Kotlin ni emuladores**. Basta con el navegador Chrome del celular.

## 1. Qué instalar

### En el computador

| Programa | Para qué | Cómo instalarlo |
| --- | --- | --- |
| **Node.js LTS** (20 o superior) | Compilar y servir la app | `winget install OpenJS.NodeJS.LTS` |
| **Git** | Guardar versiones y subir a GitHub | `winget install Git.Git` (ya lo tienes) |
| **Google Chrome** | Depurar el celular desde el PC | [google.com/chrome](https://www.google.com/chrome/) |
| **Android Platform Tools** (`adb`) | Conectar el celular por USB | `winget install Google.PlatformTools` |
| **scrcpy** *(opcional)* | Ver y controlar el celular en la pantalla del PC | `winget install Genymobile.scrcpy` |
| **Visual Studio Code** *(opcional)* | Editar el proyecto | `winget install Microsoft.VisualStudioCode` |

Los comandos `winget` se escriben en PowerShell o en la Terminal de Windows. **Después de instalar, cierra y vuelve a abrir la terminal** para que reconozca los programas nuevos. Comprueba que todo quedó bien:

```bash
node -v
```

```bash
git --version
```

```bash
adb version
```

### En el celular

1. Actualiza **Google Chrome** desde Play Store.
2. Activa las **opciones de desarrollador**: *Ajustes → Acerca del teléfono* y toca 7 veces **Número de compilación** hasta que aparezca «Ahora eres desarrollador». Si pide el PIN, escríbelo.
3. Activa la **depuración USB**: *Ajustes → Sistema → Opciones para desarrolladores → Depuración por USB*.
4. Usa un **cable USB que transmita datos** (algunos cables solo cargan).

## 2. Tres formas de probar

| Forma | Cuándo usarla | ¿Se puede instalar? | ¿Funciona sin conexión? |
| --- | --- | --- | --- |
| **A. Cable USB** (recomendada) | Mientras desarrollas | Sí | Sí |
| **B. Wi-Fi** | Un vistazo rápido sin cable | No | No |
| **C. Vercel** | La versión real, publicada | Sí | Sí |

Instalar la app y usarla sin conexión exige una dirección segura: **HTTPS** o `localhost`. Por eso la forma B solo sirve para mirar.

### A. Por cable USB con `adb reverse` (recomendada)

El celular abre `localhost:4173` y `adb` lo redirige a tu computador. Chrome lo trata como dirección segura: puedes instalar la app, probar el modo sin conexión y depurar.

1. En la carpeta del proyecto, compila y arranca el servidor (deja esa terminal abierta):

   ```bash
   npm run dev
   ```

2. Conecta el celular por USB. En el celular aparece **«¿Permitir la depuración por USB?»**: marca *Permitir siempre desde este equipo* y acepta.
3. En otra terminal, comprueba que el PC ve el celular:

   ```bash
   adb devices
   ```

   Debe mostrar una línea con un código y la palabra `device`.
4. Redirige el puerto:

   ```bash
   adb reverse tcp:4173 tcp:4173
   ```

5. En Chrome del celular, abre **`http://localhost:4173`**.

Cada vez que desconectes el cable, repite el paso 4.

**Ver la consola y depurar:** en Chrome del computador, abre `chrome://inspect/#devices`. Aparece tu celular con la pestaña de Zuka; pulsa **Inspect** para usar las herramientas de desarrollo (consola, red, elementos, almacenamiento) sobre lo que pasa en el celular.

**Ver el celular en el PC** *(opcional)*: con el cable conectado, ejecuta `scrcpy`. Se abre una ventana con la pantalla del celular que puedes controlar con el mouse y el teclado, y que sirve para grabar o hacer capturas.

### B. Por Wi-Fi (vistazo rápido)

1. El computador y el celular deben estar en la **misma red Wi-Fi**.
2. Ejecuta:

   ```bash
   npm run dev:movil
   ```

3. La terminal muestra una dirección como `http://192.168.1.25:4173`. Ábrela en Chrome del celular.
4. Si Windows pregunta por el **Firewall**, permite el acceso **solo en redes privadas**.

Por Wi-Fi la dirección no es HTTPS: la app se ve y se navega, pero no se instala ni guarda el modo sin conexión.

### C. La versión publicada en Vercel

1. Guarda y sube los cambios (ver «Rutina de trabajo»).
2. Vercel publica en uno o dos minutos. Abre la dirección de tu proyecto en Vercel desde Chrome del celular.
3. Para probar algo sin tocar la versión principal, súbelo a una **rama** (`git switch -c prueba-perfil` y `git push -u origin prueba-perfil`). Vercel crea una **vista previa** con su propia dirección HTTPS, que aparece en el panel de Vercel y en GitHub.

## 3. Instalar Zuka en el celular

1. Abre Zuka en Chrome (por la forma A o C).
2. Pulsa el botón **Instalar Zuka** de la cabecera, o en el menú **⋮** de Chrome elige **Instalar app** («Agregar a la pantalla principal → Instalar» en algunas versiones).
3. Zuka aparece en el cajón de aplicaciones con el icono morado y verde de Zuka y se abre a pantalla completa, sin la barra del navegador.

Cuando publiques una versión nueva, la app muestra **«Hay una nueva versión de Zuka»** con el botón *Actualizar*.

Comprueba que la confirmación de instalación y el acceso del dispositivo muestren **Zuka** y su logo morado y verde. El build versiona las imágenes para que el navegador detecte los cambios de icono. Si ya estaba instalada con otra identidad, acepta la revisión del nombre o icono cuando el navegador la ofrezca; actualizar el contenido y actualizar el icono son procesos distintos. No borres los datos del sitio para cambiar el icono: allí se conserva el progreso local.

La app instalada desde `localhost` y la instalada desde Vercel son **dos apps distintas**, cada una con su propio progreso. Al terminar de desarrollar, desinstala la de `localhost` para no confundirlas. Para pasar el progreso de una a otra, usa **Perfil → Descargar copia** y **Restaurar copia**.

## 4. Qué revisar en cada prueba

- [ ] La portada y el inicio cargan sin desplazamiento horizontal.
- [ ] La barra inferior lleva a Inicio, Explorar, Simulaciones, Mi biblioteca y Perfil.
- [ ] Un curso abre su camino de niveles y una lección avanza paso a paso.
- [ ] Los retos aceptan respuestas con el teclado del celular (coma o punto decimal) y el teclado no tapa el botón.
- [ ] Las fórmulas se leen bien y las anchas se desplazan dentro de su caja.
- [ ] El video de la lección 1.1 de Fundamentos se reproduce.
- [ ] Al terminar una lección suben los XP y la racha, y se ven en el Perfil.
- [ ] Girar el celular no rompe el diseño.
- [ ] Tema oscuro y claro desde el selector de la cabecera.
- [ ] Instalada, la app abre con su icono y funciona en **modo avión** (excepto los videos).
- [ ] Con el texto grande del sistema (*Ajustes → Pantalla → Tamaño de fuente*) todo sigue siendo legible.
- [ ] El botón Atrás de Android vuelve a la pantalla anterior.

## 5. Problemas frecuentes

| Problema | Solución |
| --- | --- |
| `adb` no se reconoce | Cierra y abre la terminal. Si sigue, reinstala con `winget install Google.PlatformTools`. |
| `adb devices` no muestra nada | Prueba otro cable o puerto USB, revisa que la depuración USB esté activa y, en la notificación USB del celular, elige *Transferencia de archivos*. Si persiste, instala el controlador de Motorola (*Motorola Device Manager*) o el *Google USB Driver*. |
| Aparece `unauthorized` | Desbloquea el celular y acepta «¿Permitir la depuración por USB?». Si no aparece, en Opciones para desarrolladores pulsa *Revocar autorizaciones de depuración USB* y reconecta. |
| `localhost` no abre en el celular | Comprueba que `npm run dev` siga abierto y repite `adb reverse tcp:4173 tcp:4173`. |
| Por Wi-Fi no carga | Ambos en la misma red, sin «aislamiento de clientes» (redes de invitados o universidades lo suelen tener) y el Firewall permitiendo Node.js en redes privadas. |
| No aparece «Instalar app» | Hace falta HTTPS o `localhost`. Si ya está instalada, Chrome no lo vuelve a ofrecer. |
| Sigues viendo la versión anterior | Acepta el aviso *Actualizar*, o cierra la app por completo y ábrela de nuevo. En último caso: Chrome → ⋮ → *Configuración → Configuración de sitios → Todos los sitios* → elige el sitio → *Borrar y restablecer* (esto borra el progreso de ese sitio). |

## 6. Rutina de trabajo

1. `npm run dev` y abre la app en el celular (forma A).
2. Haz un cambio pequeño en `src/` o `content/`.
3. Detén el servidor (`Ctrl + C`) y vuelve a ejecutar `npm run dev` para recompilar. En el celular, recarga la página.
4. Si funciona, ejecuta las pruebas:

   ```bash
   npm test
   ```

5. Guarda un punto de control en Git:

   ```bash
   git add -A
   ```

   ```bash
   git commit -m "Describe el cambio en una frase"
   ```

6. Cuando quieras publicarlo:

   ```bash
   git push
   ```

   Vercel publica la nueva versión y la app instalada ofrece actualizarse.

Si algo se rompe, `git status` muestra qué cambió y `git restore <archivo>` deshace los cambios de un archivo que aún no guardaste en un commit.
