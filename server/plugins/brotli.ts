export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', async (response, { event }) => {
    const url = event.node.req.url || ''
    
    // Solo procesar archivos .br
    if (!url.endsWith('.br')) {
      return
    }

    // Configurar headers para archivos Brotli
    response.headers = response.headers || {}
    response.headers['content-encoding'] = 'br'
    response.headers['cache-control'] = 'public, max-age=31536000, immutable'

    // Determinar el content-type basado en la extensión
    if (url.endsWith('.js.br')) {
      response.headers['content-type'] = 'application/javascript'
    } else if (url.endsWith('.wasm.br')) {
      response.headers['content-type'] = 'application/wasm'
    } else if (url.endsWith('.data.br')) {
      response.headers['content-type'] = 'application/octet-stream'
    } else {
      response.headers['content-type'] = 'application/javascript'
    }
  })
})
