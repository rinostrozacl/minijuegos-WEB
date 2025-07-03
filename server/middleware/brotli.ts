export default defineEventHandler(async (event) => {
  const url = event.node.req.url || "";

  // Solo procesar archivos .br
  if (!url.endsWith(".br")) {
    return;
  }

  // Configurar headers para archivos Brotli
  setHeader(event, "Content-Encoding", "br");
  setHeader(event, "Cache-Control", "public, max-age=31536000, immutable");

  // Determinar el content-type basado en la extensión
  if (url.endsWith(".js.br")) {
    setHeader(event, "Content-Type", "application/javascript");
  } else if (url.endsWith(".wasm.br")) {
    setHeader(event, "Content-Type", "application/wasm");
  } else if (url.endsWith(".data.br")) {
    setHeader(event, "Content-Type", "application/octet-stream");
  } else {
    setHeader(event, "Content-Type", "application/javascript");
  }
});
