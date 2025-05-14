#!/bin/sh
set -e

# Imprimir variables de entorno para debug (sin mostrar valores sensibles)
echo "Starting application with PORT=$PORT"
echo "Host set to $HOST"
echo "Node environment: $NODE_ENV"

# Verificar que las variables requeridas estén configuradas
if [ -z "$PORT" ]; then
  echo "PORT environment variable is not set. Using default port 8080."
  export PORT=8080
fi

if [ -z "$HOST" ]; then
  echo "HOST environment variable is not set. Using default host 0.0.0.0."
  export HOST=0.0.0.0
fi

# Iniciar la aplicación directamente con node
echo "Starting server..."
exec node .output/server/index.mjs 