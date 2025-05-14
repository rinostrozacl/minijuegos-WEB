#!/bin/bash
# Script para facilitar el despliegue a Google Cloud Run

# Asegúrate de estar en la carpeta del proyecto
echo "Construyendo la aplicación para despliegue..."
npm run build

# Construir la imagen de Docker
echo "Construyendo imagen Docker..."
gcloud builds submit --tag gcr.io/minijuegos-1012b/gamecraft

# Desplegar a Cloud Run
echo "Desplegando a Cloud Run..."
gcloud run deploy gamecraft \
  --image gcr.io/minijuegos-1012b/gamecraft \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --port 8080 \
  --set-env-vars="NODE_ENV=production,HOST=0.0.0.0,PORT=8080"

echo "¡Despliegue completado!" 