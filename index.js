// Punto de entrada simplificado para Firebase App Hosting

import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import * as path from "path";
import { execSync } from "child_process";

// Obtener directorio actual con ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Iniciando aplicación desde index.js en la raíz");
console.log(`Directorio actual: ${process.cwd()}`);

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findServerFile() {
  // Posibles ubicaciones del archivo del servidor
  const possiblePaths = [
    path.join(process.cwd(), "output", "server", "index.mjs"),
    path.join(process.cwd(), ".output", "server", "index.mjs"),
    "/workspace/output/server/index.mjs",
    "/workspace/.output/server/index.mjs",
  ];

  // Verificar ubicaciones
  for (const p of possiblePaths) {
    try {
      console.log(`Verificando si existe: ${p}`);
      if (await fileExists(p)) {
        console.log(`Servidor encontrado en: ${p}`);
        return p;
      }
    } catch (error) {
      console.error(`Error verificando ${p}:`, error);
    }
  }

  console.error("No se pudo encontrar el archivo del servidor.");
  return null;
}

// Función principal
async function main() {
  try {
    // Si no existe output/server, crear directorios
    if (!(await fileExists("output/server"))) {
      console.log("Creando estructura de directorios para App Hosting");
      await fs.mkdir("output/server", { recursive: true });

      // Copiar contenido desde .output/server si existe
      if (await fileExists(".output/server")) {
        console.log("Copiando archivos de .output/server a output/server");
        execSync("cp -r .output/server/* output/server/ || true");
      }
    }

    // Verificar contenido
    console.log("Listando directorios:");
    execSync("ls -la", { stdio: "inherit" });
    execSync("ls -la output/server || true", { stdio: "inherit" });

    // Buscar archivo de servidor
    const serverPath = await findServerFile();

    if (!serverPath) {
      throw new Error("No se pudo encontrar el archivo del servidor");
    }

    // Cargar módulo del servidor
    console.log(`Importando servidor desde ${serverPath}`);
    return await import(serverPath);
  } catch (error) {
    console.error("Error al iniciar la aplicación:", error);

    // Crear un servidor HTTP mínimo para responder
    const http = await import("http");
    const server = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`Error al iniciar la aplicación: ${error.message}\n`);
    });

    const port = process.env.PORT || 8080;
    server.listen(port, () => {
      console.log(`Servidor de emergencia escuchando en puerto ${port}`);
    });

    return { default: server };
  }
}

// Ejecutar y exportar
const appModule = await main();
export default appModule.default || appModule;
