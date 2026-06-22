#!/usr/bin/env bash
# Descomprime un build Unity WebGL exportado con Brotli (.br) para GitHub Pages.
# Requiere: brotli (macOS: brew install brotli)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="${1:-$ROOT/testjuego/Build}"
INDEX_HTML="${2:-$ROOT/testjuego/index.html}"

if ! command -v brotli >/dev/null 2>&1; then
  echo "Error: instala brotli (brew install brotli)" >&2
  exit 1
fi

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Error: no existe $BUILD_DIR" >&2
  exit 1
fi

shopt -s nullglob
files=("$BUILD_DIR"/*.br)
if [[ ${#files[@]} -eq 0 ]]; then
  echo "No hay archivos .br en $BUILD_DIR"
  exit 0
fi

for f in "${files[@]}"; do
  out="${f%.br}"
  echo "Descomprimiendo $(basename "$f") → $(basename "$out")"
  brotli -d -f "$f" -o "$out"
done

if [[ -f "$INDEX_HTML" ]]; then
  if grep -q '\.br"' "$INDEX_HTML"; then
    sed -i '' \
      -e 's/\.data\.br"/.data"/g' \
      -e 's/\.framework\.js\.br"/.framework.js"/g' \
      -e 's/\.wasm\.br"/.wasm"/g' \
      "$INDEX_HTML"
    echo "Actualizado: $INDEX_HTML (referencias sin .br)"
  else
    echo "index.html ya no referencia archivos .br"
  fi
fi

echo ""
echo "Listo. Sube testjuego/ (incluye web.data, web.framework.js, web.wasm) y haz push."
echo "Opcional: borra los .br del repo para reducir tamaño (git rm testjuego/Build/*.br)"
