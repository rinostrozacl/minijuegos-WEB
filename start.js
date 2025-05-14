#!/usr/bin/env node

/**
 * Script de inicio para la aplicación en Cloud Run
 * Este script sirve como punto de entrada y se asegura de que la aplicación
 * pueda encontrar el archivo principal en la ubicación correcta.
 */

import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { spawn, execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Iniciando script de ayuda para la aplicación");
console.log(`Directorio actual: ${process.cwd()}`);
console.log(
  `Variables de entorno: PORT=${process.env.PORT}, HOST=${process.env.HOST}`
);

// Crear estructura de directorios si estamos en modo producción en Firebase
async function setupEnvironment() {
  try {
    // Crear directorios necesarios
    const directories = ["/workspace/output", "/workspace/output/server"];

    for (const dir of directories) {
      if (!(await fileExists(dir))) {
        console.log(`Creando directorio: ${dir}`);
        await fs.mkdir(dir, { recursive: true });
      }
    }

    // Si existe .output/server, copiar archivos a output/server
    if (await fileExists(".output/server")) {
      console.log("Copiando archivos de .output/server a output/server");
      execSync("cp -r .output/server/* output/server/ || true");
    }

    // Verificar directorios
    console.log("Contenido del directorio actual:");
    execSync("ls -la", { stdio: "inherit" });

    if (await fileExists("output/server")) {
      console.log("Contenido de output/server:");
      execSync("ls -la output/server", { stdio: "inherit" });
    }

    if (await fileExists(".output/server")) {
      console.log("Contenido de .output/server:");
      execSync("ls -la .output/server", { stdio: "inherit" });
    }
  } catch (error) {
    console.error("Error al configurar entorno:", error);
  }
}

// Opciones de rutas donde buscar el archivo index.mjs
const possiblePaths = [
  "./output/server/index.mjs",
  "./.output/server/index.mjs",
  "/workspace/output/server/index.mjs",
  "/workspace/.output/server/index.mjs",
  path.join(__dirname, ".output", "server", "index.mjs"),
  path.join(__dirname, "output", "server", "index.mjs"),
];

// Función principal que inicializa el entorno y busca el archivo correcto
async function main() {
  await setupEnvironment();

  // Buscar un archivo válido para ejecutar
  let validPath = null;
  for (const p of possiblePaths) {
    console.log(`Verificando ruta: ${p}`);
    if (await fileExists(p)) {
      console.log(`Archivo encontrado en: ${p}`);
      validPath = p;
      break;
    }
  }

  if (!validPath) {
    console.error(
      "No se pudo encontrar el archivo index.mjs en ninguna ubicación conocida."
    );
    console.log("Creando un archivo temporal para depuración");

    // Crear un archivo de servidor mínimo para depuración
    const tempServerPath = path.join(
      process.cwd(),
      "output",
      "server",
      "index.mjs"
    );
    const tempServerDir = path.dirname(tempServerPath);

    await fs.mkdir(tempServerDir, { recursive: true });
    await fs.writeFile(
      tempServerPath,
      `
      import http from 'http';
      
      const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Servidor temporal funcionando en modo de depuración\\n');
      });
      
      const port = process.env.PORT || 8080;
      server.listen(port, () => {
        console.log(\`Servidor temporal escuchando en el puerto \${port}\`);
      });
      
      export default server;
    `
    );

    validPath = tempServerPath;
    console.log(`Creado servidor temporal en ${validPath}`);
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
}

// Función auxiliar para verificar si existe un archivo
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Ejecutar la función principal
main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
