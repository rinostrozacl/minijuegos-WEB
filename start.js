#!/usr/bin/env node

/**
 * Script de inicio para la aplicación en Cloud Run
 * Este script sirve como punto de entrada y se asegura de que la aplicación
 * pueda encontrar el archivo principal en la ubicación correcta.
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Opciones de rutas donde buscar el archivo index.mjs
const possiblePaths = [
  "./output/server/index.mjs",
  "./.output/server/index.mjs",
  "/app/output/server/index.mjs",
  "/app/.output/server/index.mjs",
  "./server/index.mjs",
  "/workspace/output/server/index.mjs",
  "/workspace/.output/server/index.mjs",
];

// Función para verificar si un archivo existe
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Buscar un archivo válido para ejecutar
let validPath = null;
for (const p of possiblePaths) {
  console.log(`Verificando ruta: ${p}`);
  if (fileExists(p)) {
    console.log(`Archivo encontrado en: ${p}`);
    validPath = p;
    break;
  }
}

if (!validPath) {
  console.error(
    "No se pudo encontrar el archivo index.mjs en ninguna ubicación conocida."
  );
  console.log("Contenido del directorio actual:");
  console.log(fs.readdirSync("."));

  if (fileExists("/app")) {
    console.log("Contenido de /app:");
    console.log(fs.readdirSync("/app"));
  }

  if (fileExists("/workspace")) {
    console.log("Contenido de /workspace:");
    console.log(fs.readdirSync("/workspace"));
  }

  process.exit(1);
}

// Iniciar la aplicación usando el archivo encontrado
console.log(`Iniciando aplicación desde ${validPath}`);
const nodeProcess = spawn("node", [validPath], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: process.env.PORT || 8080,
    HOST: process.env.HOST || "0.0.0.0",
  },
});

nodeProcess.on("close", (code) => {
  console.log(`El proceso Node.js terminó con código: ${code}`);
  process.exit(code);
});
