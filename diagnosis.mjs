// Servidor de diagnóstico para Firebase App Hosting
// Muestra información de depuración para entender por qué no funciona correctamente

import http from "http";
import { promises as fs } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para verificar si existe un archivo o directorio
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Función para ejecutar comandos y capturar la salida
function runCommand(command) {
  try {
    return execSync(command, { encoding: "utf8" });
  } catch (error) {
    return `Error ejecutando '${command}': ${error.message}`;
  }
}

// Crear servidor HTTP
const server = http.createServer(async (req, res) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);

  try {
    // Recopilar información de diagnóstico
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || "no definido",
        PORT: process.env.PORT || "no definido",
        HOST: process.env.HOST || "no definido",
        DEBUG: process.env.DEBUG || "no definido",
        NITRO_DEBUG: process.env.NITRO_DEBUG || "no definido",
        PATH: process.env.PATH || "no definido",
      },
      locations: {
        cwd: process.cwd(),
        dirname: __dirname,
        exists: {
          ".output": await fileExists(".output"),
          ".output/server": await fileExists(".output/server"),
          ".output/public": await fileExists(".output/public"),
          output: await fileExists("output"),
          "output/server": await fileExists("output/server"),
          "output/public": await fileExists("output/public"),
          node_modules: await fileExists("node_modules"),
        },
      },
      directories: {},
    };

    // Capturar listados de directorios
    if (await fileExists(".")) {
      diagnosticInfo.directories["."] = runCommand("ls -la");
    }

    if (await fileExists(".output")) {
      diagnosticInfo.directories[".output"] = runCommand("ls -la .output");

      if (await fileExists(".output/server")) {
        diagnosticInfo.directories[".output/server"] = runCommand(
          "ls -la .output/server"
        );
      }

      if (await fileExists(".output/public")) {
        diagnosticInfo.directories[".output/public"] = runCommand(
          "ls -la .output/public"
        );
      }
    }

    if (await fileExists("output")) {
      diagnosticInfo.directories["output"] = runCommand("ls -la output");

      if (await fileExists("output/server")) {
        diagnosticInfo.directories["output/server"] = runCommand(
          "ls -la output/server"
        );
      }
    }

    // Enviar respuesta HTML
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Diagnóstico Firebase App Hosting</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; padding: 20px; max-width: 1200px; margin: 0 auto; }
          h1 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          h2 { color: #0066cc; margin-top: 30px; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; white-space: pre-wrap; font-size: 14px; }
          .section { margin-bottom: 30px; }
          .info { color: #2c5282; background: #ebf8ff; padding: 10px; border-radius: 5px; }
          .warning { color: #744210; background: #fffff0; padding: 10px; border-radius: 5px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Información de Diagnóstico - Firebase App Hosting</h1>
        <div class="info">Este es un servidor de diagnóstico para ayudar a resolver problemas con App Hosting</div>
        
        <div class="section">
          <h2>Timestamp</h2>
          <pre>${diagnosticInfo.timestamp}</pre>
        </div>

        <div class="section">
          <h2>Variables de Entorno</h2>
          <table>
            <tr><th>Variable</th><th>Valor</th></tr>
            ${Object.entries(diagnosticInfo.environment)
              .map(
                ([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`
              )
              .join("")}
          </table>
        </div>

        <div class="section">
          <h2>Ubicaciones</h2>
          <pre>Directorio actual: ${diagnosticInfo.locations.cwd}
__dirname: ${diagnosticInfo.locations.dirname}</pre>
          
          <h3>Verificación de existencia</h3>
          <table>
            <tr><th>Ruta</th><th>Existe</th></tr>
            ${Object.entries(diagnosticInfo.locations.exists)
              .map(
                ([path, exists]) =>
                  `<tr><td>${path}</td><td>${
                    exists ? "✅ Sí" : "❌ No"
                  }</td></tr>`
              )
              .join("")}
          </table>
        </div>

        <div class="section">
          <h2>Contenido de Directorios</h2>
          ${Object.entries(diagnosticInfo.directories)
            .map(
              ([dir, content]) => `
            <h3>Directorio: ${dir}</h3>
            <pre>${content}</pre>
          `
            )
            .join("")}
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error generando diagnóstico:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(
      `Error en el servidor de diagnóstico: ${error.message}\n${error.stack}`
    );
  }
});

const port = process.env.PORT || 8080;
const host = process.env.HOST || "0.0.0.0";

server.listen(port, host, () => {
  console.log(`Servidor de diagnóstico escuchando en http://${host}:${port}`);
});

export default server;
