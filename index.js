// Esta es una solución para el problema con Firebase App Hosting
// que busca el archivo en una ubicación específica

// Importamos módulos usando sintaxis de ES modules
import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Obtener directorio actual con ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Iniciando aplicación desde index.js en la raíz");
console.log(`Directorio actual: ${process.cwd()}`);

// Función principal para iniciar la aplicación
async function startApp() {
  try {
    // Verificar si existe .output y .output/server
    if ((await fileExists(".output")) && (await fileExists(".output/server"))) {
      // Si estamos en el directorio raíz y existe .output
      console.log("Detectado directorio .output/server");

      // Crear directorio output sin el punto si no existe
      if (!(await fileExists("output"))) {
        console.log("Creando directorio output/");
        await fs.mkdir("output", { recursive: true });
      }

      if (!(await fileExists("output/server"))) {
        console.log("Creando directorio output/server/");
        await fs.mkdir("output/server", { recursive: true });

        // Copiar archivos de .output/server a output/server
        console.log("Copiando archivos de .output/server a output/server");
        const files = await fs.readdir(".output/server");

        for (const file of files) {
          const sourcePath = path.join(".output/server", file);
          const destPath = path.join("output/server", file);

          const stats = await fs.stat(sourcePath);
          if (stats.isDirectory()) {
            // Si es un directorio, copiarlo recursivamente
            execSync(`cp -r "${sourcePath}" "${destPath}"`);
          } else {
            // Si es un archivo, copiarlo directamente
            await fs.copyFile(sourcePath, destPath);
          }
        }
      }
    }

    // Verificar qué path existe
    const possiblePaths = [
      "./output/server/index.mjs",
      "./.output/server/index.mjs",
    ];

    let serverPath = null;
    for (const p of possiblePaths) {
      console.log(`Verificando si existe: ${p}`);
      if (await fileExists(p)) {
        serverPath = p;
        console.log(`¡Encontrado en ${p}!`);
        break;
      }
    }

    if (!serverPath) {
      console.error("No se pudo encontrar el archivo del servidor");
      process.exit(1);
    }

    // Cargar el módulo del servidor
    console.log(`Cargando aplicación desde ${serverPath}`);

    // Importar y ejecutar el módulo del servidor
    const serverModule = await import(serverPath);
    console.log("Módulo del servidor cargado correctamente");

    // Exportar las propiedades necesarias
    return serverModule.default || serverModule;
  } catch (error) {
    console.error("Error al preparar los archivos:", error);
    process.exit(1);
  }
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

// Ejecutar la aplicación
const app = await startApp();

// Exportar el módulo
export default app;
