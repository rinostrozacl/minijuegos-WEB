#!/usr/bin/env node

/**
 * Script de inicio para la aplicación en Cloud Run
 * Este script sirve como punto de entrada y se asegura de que la aplicación
 * pueda encontrar el archivo principal en la ubicación correcta.
 */

const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");

console.log("Iniciando script de ayuda para la aplicación");
console.log(`Directorio actual: ${process.cwd()}`);
console.log(
  `Variables de entorno: PORT=${process.env.PORT}, HOST=${process.env.HOST}`
);

// Si estamos en el directorio /workspace, intentamos crear enlaces simbólicos
try {
  if (fs.existsSync("/workspace") && fs.existsSync("/workspace/.output")) {
    console.log("Creando enlaces simbólicos para asegurar compatibilidad...");

    // Crear directorio output si no existe
    if (!fs.existsSync("/workspace/output")) {
      fs.mkdirSync("/workspace/output", { recursive: true });
    }

    // Crear enlace simbólico de .output/server a output/server
    if (!fs.existsSync("/workspace/output/server")) {
      console.log(
        "Enlazando /workspace/.output/server a /workspace/output/server"
      );
      execSync("ln -sf /workspace/.output/server /workspace/output/server");
    }

    // Verificar que el enlace se creó correctamente
    console.log("Contenido de /workspace/output:");
    execSync("ls -la /workspace/output", { stdio: "inherit" });
  }
} catch (error) {
  console.error("Error al crear enlaces simbólicos:", error);
}

// Opciones de rutas donde buscar el archivo index.mjs
const possiblePaths = [
  "./output/server/index.mjs",
  "./.output/server/index.mjs",
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
