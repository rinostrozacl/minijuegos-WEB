# testjuego — build WebGL para GitHub Pages

Carpeta de publicación del juego HTML5/WebGL para GameCraft.

## Pasos

1. Exporta tu juego desde Unity como **WebGL**.
2. Copia el contenido del build aquí (debe existir `index.html` en la raíz de esta carpeta).
3. Haz commit y push a la rama `main`.
4. El workflow `.github/workflows/deploy-testjuego-pages.yml` publica esta carpeta en **GitHub Pages**.
5. En el repositorio de GitHub: **Settings → Pages → Build and deployment → GitHub Actions**.
6. Tu URL será algo como:
   `https://TU-USUARIO.github.io/NOMBRE-REPO/`
7. Pega esa URL en GameCraft → **/mis-juegos** → Probar enlace → Guardar.

## itch.io (opcional)

Puedes publicar también en itch.io y pegar ese enlace en GameCraft como **información anexa**; el juego embebido en la plataforma usará GitHub Pages.

## Notas

- El archivo `.nojekyll` evita que Jekyll ignore archivos con `_`.
- Builds grandes: valora el límite de tamaño del repositorio (~1 GB recomendado).
