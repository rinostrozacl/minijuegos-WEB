// Esta es una solución para el problema con Firebase App Hosting
// que busca el archivo en una ubicación específica

// Importamos el módulo fs para operaciones de archivo
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("Iniciando aplicación desde index.js en la raíz");
console.log(`Directorio actual: ${process.cwd()}`);

// Intentamos crear los directorios necesarios
try {
  if (fs.existsSync(".output") && fs.existsSync(".output/server")) {
    // Si estamos en el directorio raíz y existe .output
    console.log("Detectado directorio .output/server");

    // Crear directorio output sin el punto si no existe
    if (!fs.existsSync("output")) {
      console.log("Creando directorio output/");
      fs.mkdirSync("output", { recursive: true });
    }

    if (!fs.existsSync("output/server")) {
      console.log("Creando directorio output/server/");
      fs.mkdirSync("output/server", { recursive: true });

      // Copiar archivos de .output/server a output/server
      console.log("Copiando archivos de .output/server a output/server");
      const files = fs.readdirSync(".output/server");
      files.forEach((file) => {
        const sourcePath = path.join(".output/server", file);
        const destPath = path.join("output/server", file);

        if (fs.statSync(sourcePath).isDirectory()) {
          // Si es un directorio, copiarlo recursivamente
          execSync(`cp -r "${sourcePath}" "${destPath}"`);
        } else {
          // Si es un archivo, copiarlo directamente
          fs.copyFileSync(sourcePath, destPath);
        }
      });
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
    if (fs.existsSync(p)) {
      serverPath = p;
      console.log(`¡Encontrado en ${p}!`);
      break;
    }
  }

  if (!serverPath) {
    console.error("No se pudo encontrar el archivo del servidor");
    process.exit(1);
  }

  // Exportar el manejador de la aplicación
  console.log(`Cargando aplicación desde ${serverPath}`);

  // Cargar el módulo del servidor
  import(serverPath)
    .then((module) => {
      console.log("Módulo del servidor cargado correctamente");
      module.default = module.default || module;
      Object.assign(exports, module);
    })
    .catch((err) => {
      console.error("Error al cargar el módulo del servidor:", err);
      process.exit(1);
    });
} catch (error) {
  console.error("Error al preparar los archivos:", error);
  process.exit(1);
}
