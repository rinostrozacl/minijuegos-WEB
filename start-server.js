const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("[StartServer] Iniciando servidores duales HTTP + HTTPS...");

// Verificar que existen los certificados
const certPath = path.join(__dirname, "certs", "localhost-cert.pem");
const keyPath = path.join(__dirname, "certs", "localhost-key.pem");

let hasSSLCerts = false;
try {
  fs.accessSync(certPath, fs.constants.F_OK);
  fs.accessSync(keyPath, fs.constants.F_OK);
  hasSSLCerts = true;
  console.log("[StartServer] ✅ Certificados SSL encontrados");
} catch (error) {
  console.log("[StartServer] ⚠️ Certificados SSL no encontrados, solo HTTP");
}

// Iniciar servidor HTTP principal (puerto 3000)
console.log("[StartServer] 🚀 Iniciando servidor HTTP en puerto 3000...");
const httpServer = spawn("node", [".output/server/index.mjs"], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: "3000",
    HOST: "0.0.0.0",
    NUXT_PORT: "3000",
    NUXT_HOST: "0.0.0.0",
  },
});

// Iniciar servidor HTTPS para uploads (puerto 3443) si hay certificados
if (hasSSLCerts) {
  console.log("[StartServer] 🔒 Iniciando servidor HTTPS en puerto 3443...");

  const httpsServer = spawn("node", [".output/server/index.mjs"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: "3443",
      HOST: "0.0.0.0",
      NUXT_PORT: "3443",
      NUXT_HOST: "0.0.0.0",
      NUXT_SSL_CERT: certPath,
      NUXT_SSL_KEY: keyPath,
      NUXT_SSL_ENABLED: "true",
    },
  });

  httpsServer.on("error", (error) => {
    console.error("[StartServer] ❌ Error en servidor HTTPS:", error);
  });

  httpsServer.on("exit", (code) => {
    console.log(`[StartServer] Servidor HTTPS terminado con código: ${code}`);
  });
} else {
  console.log(
    "[StartServer] 📝 Para habilitar HTTPS, genera certificados SSL en ./certs/"
  );
}

// Manejar errores del servidor HTTP
httpServer.on("error", (error) => {
  console.error("[StartServer] ❌ Error en servidor HTTP:", error);
});

httpServer.on("exit", (code) => {
  console.log(`[StartServer] Servidor HTTP terminado con código: ${code}`);
  process.exit(code);
});

// Manejar señales de terminación
process.on("SIGTERM", () => {
  console.log(
    "[StartServer] 🛑 Recibida señal SIGTERM, cerrando servidores..."
  );
  httpServer.kill("SIGTERM");
  if (hasSSLCerts && httpsServer) {
    httpsServer.kill("SIGTERM");
  }
});

process.on("SIGINT", () => {
  console.log("[StartServer] 🛑 Recibida señal SIGINT, cerrando servidores...");
  httpServer.kill("SIGINT");
  if (hasSSLCerts && httpsServer) {
    httpsServer.kill("SIGINT");
  }
});

console.log("[StartServer] ✅ Configuración completa:");
console.log("[StartServer]   📡 HTTP:  http://0.0.0.0:3000 (via nginx-proxy)");
if (hasSSLCerts) {
  console.log(
    "[StartServer]   🔒 HTTPS: https://0.0.0.0:3443 (directo para uploads)"
  );
} else {
  console.log(
    "[StartServer]   ⚠️  HTTPS: Deshabilitado (certificados no encontrados)"
  );
}
