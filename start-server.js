import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Posibles ubicaciones del archivo index.mjs
const possiblePaths = [
  ".output/server/index.mjs",
  "server/index.mjs",
  "./.output/server/index.mjs",
  "./server/index.mjs",
  "../.output/server/index.mjs",
  "../server/index.mjs",
];

// Función para comprobar si un archivo existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Buscar el archivo index.mjs
let serverPath = null;
for (const p of possiblePaths) {
  console.log(`Checking path: ${p}`);
  if (fileExists(p)) {
    serverPath = p;
    break;
  }
}

if (serverPath) {
  console.log(`Found server file at: ${serverPath}`);
  try {
    // Intentar ejecutar el servidor
    console.log(`Starting server with: node ${serverPath}`);
    execSync(`node ${serverPath}`, { stdio: "inherit" });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
} else {
  // Si no encontramos el archivo, listar el contenido del directorio para depuración
  console.error("Could not find server index.mjs file.");
  console.log("Current directory:", process.cwd());
  console.log("Directory contents:");

  try {
    const contents = fs.readdirSync(".");
    console.log(contents);

    if (fileExists(".output")) {
      console.log(".output directory contents:");
      console.log(fs.readdirSync(".output"));

      if (fileExists(".output/server")) {
        console.log(".output/server directory contents:");
        console.log(fs.readdirSync(".output/server"));
      }
    }
  } catch (err) {
    console.error("Error listing directory contents:", err);
  }

  process.exit(1);
}
