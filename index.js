// Punto de entrada simplificado para Firebase App Hosting

import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import * as path from "path";
import { execSync } from "child_process";

// Obtener directorio actual con ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("============= INICIO DE LA APLICACIÓN =============");
console.log("Iniciando aplicación desde index.js en la raíz");
console.log(`Directorio actual: ${process.cwd()}`);
console.log(`Valor de __dirname: ${__dirname}`);
console.log(
  `Variables de entorno: PORT=${process.env.PORT}, HOST=${process.env.HOST}, NODE_ENV=${process.env.NODE_ENV}`
);

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  if (!(await fileExists(dir))) {
    console.log(`Creando directorio: ${dir}`);
    await fs.mkdir(dir, { recursive: true });
    return true;
  }
  return false;
}

async function findServerFile() {
  // Posibles ubicaciones del archivo del servidor
  const possiblePaths = [
    path.join(process.cwd(), "output", "server", "index.mjs"),
    path.join(process.cwd(), ".output", "server", "index.mjs"),
    "/workspace/output/server/index.mjs",
    "/workspace/.output/server/index.mjs",
    // Opciones adicionales
    path.join(__dirname, ".output", "server", "index.mjs"),
    path.join(__dirname, "output", "server", "index.mjs"),
  ];

  console.log("Buscando archivo del servidor en las siguientes rutas:");

  // Verificar ubicaciones
  for (const p of possiblePaths) {
    try {
      console.log(`Verificando si existe: ${p}`);
      if (await fileExists(p)) {
        console.log(`¡SERVIDOR ENCONTRADO EN: ${p}!`);
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
    // Listar contenido del directorio actual para diagnóstico
    console.log("Contenido del directorio actual:");
    execSync("ls -la", { stdio: "inherit" });

    // Verificar si existen directorios clave
    console.log("Verificando directorios clave:");
    console.log(`.output existe: ${await fileExists(".output")}`);
    console.log(`.output/server existe: ${await fileExists(".output/server")}`);
    console.log(`.output/public existe: ${await fileExists(".output/public")}`);
    console.log(`output existe: ${await fileExists("output")}`);
    console.log(`output/server existe: ${await fileExists("output/server")}`);
    console.log(`output/public existe: ${await fileExists("output/public")}`);

    // Crear estructura de directorios si no existe
    await ensureDir("output");
    await ensureDir("output/server");
    await ensureDir("output/public");

    // Copiar archivos desde .output si existe
    if (await fileExists(".output/server")) {
      console.log("Copiando archivos de .output/server a output/server");
      execSync("cp -r .output/server/* output/server/ || true", {
        stdio: "inherit",
      });
      console.log("Copia de server completada");
    } else {
      console.log(
        "ADVERTENCIA: No se encontró el directorio .output/server para copiar"
      );
    }

    // Copiar archivos públicos si existen
    if (await fileExists(".output/public")) {
      console.log("Copiando archivos de .output/public a output/public");
      execSync("cp -r .output/public/* output/public/ || true", {
        stdio: "inherit",
      });
      console.log("Copia de public completada");
    } else {
      console.log(
        "ADVERTENCIA: No se encontró el directorio .output/public para copiar"
      );
    }

    // Verificar nodos node_modules relevantes para los iconos
    console.log("Verificando módulos de iconos:");
    if (await fileExists("node_modules/@iconify-json")) {
      console.log("Copiando módulos de iconos a la carpeta de salida");
      await ensureDir("output/node_modules");
      await ensureDir("output/node_modules/@iconify-json");
      execSync(
        "cp -r node_modules/@iconify-json output/node_modules/ || true",
        {
          stdio: "inherit",
        }
      );
    }

    // Verificar contenido después de la copia
    if (await fileExists("output/server")) {
      console.log("Contenido de output/server después de la copia:");
      execSync("ls -la output/server", { stdio: "inherit" });
    }

    if (await fileExists("output/public")) {
      console.log("Contenido de output/public después de la copia:");
      execSync("ls -la output/public", { stdio: "inherit" });
    }

    if (await fileExists(".output/server")) {
      console.log("Contenido de .output/server:");
      execSync("ls -la .output/server", { stdio: "inherit" });
    }

    if (await fileExists(".output/public")) {
      console.log("Contenido de .output/public:");
      execSync("ls -la .output/public", { stdio: "inherit" });
    }

    // Buscar archivo de servidor
    const serverPath = await findServerFile();

    if (!serverPath) {
      throw new Error(
        "No se pudo encontrar el archivo del servidor en ninguna ubicación"
      );
    }

    // Cargar módulo del servidor
    console.log(`Importando servidor desde ${serverPath}`);
    const serverModule = await import(serverPath);
    console.log("Módulo del servidor cargado correctamente");
    return serverModule;
  } catch (error) {
    console.error("=== ERROR AL INICIAR LA APLICACIÓN ===");
    console.error(error);
    console.error(error.stack);

    // Crear un servidor HTTP mínimo para responder
    const http = await import("http");
    const server = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head>
            <title>Error de Inicio</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              .error { color: red; background: #ffeeee; padding: 15px; border-radius: 5px; }
              pre { background: #f4f4f4; padding: 10px; border-radius: 3px; overflow: auto; }
            </style>
          </head>
          <body>
            <h1>Error al iniciar la aplicación</h1>
            <div class="error">${error.message}</div>
            <h2>Detalles técnicos:</h2>
            <pre>${error.stack}</pre>
          </body>
        </html>
      `);
    });

    const port = process.env.PORT || 8080;
    const host = process.env.HOST || "0.0.0.0";

    server.listen(port, host, () => {
      console.log(
        `Servidor de emergencia escuchando en http://${host}:${port}`
      );
    });

    return { default: server };
  }
}

// Ejecutar y exportar
console.log("Iniciando función principal...");
const appModule = await main();
console.log("Función principal completada, exportando módulo...");
export default appModule.default || appModule;
