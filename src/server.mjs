import http from 'http'
import fs from 'fs'
import path from 'path'
import httpProxy from 'http-proxy'

export function startServer({
  dist,
  basePath = '/',
  apiTarget,
  apiPrefix = '/api',
  port = 4173
}) {
  const normalize = (p) => p.replace(/\/$/, '')
  basePath = normalize(basePath)
  apiPrefix = normalize(apiPrefix)

  const proxy = httpProxy.createProxyServer({
    target: apiTarget,
    changeOrigin: true,
    ws: true
  })

  proxy.on('error', (err, req, res) => {
    console.error('[proxy error]', err.message)
    if (!res.headersSent) res.writeHead(502)
    res.end('Bad Gateway')
  })

  http.createServer((req, res) => {
    const url = req.url

    // ===== 必须先校验 basePath =====
    if (!url.startsWith(basePath)) {
      res.writeHead(404)
      res.end('Not Found')
      return
    }

    // 去掉 basePath
    const relPath = url.slice(basePath.length) || '/'

    // ===== API 判断（在去 basePath 之后）=====
    if (relPath.startsWith(apiPrefix)) {
      proxy.web(req, res)
      return
    }

    // ===== 静态资源 / SPA fallback =====
    let filePath = path.join(
      dist,
      relPath === '/' ? 'index.html' : relPath
    )

    if (!fs.existsSync(filePath)) {
      filePath = path.join(dist, 'index.html')
    }

    fs.createReadStream(filePath).pipe(res)
  }).listen(port, () => {
    console.log(`
🚀 preview-proxy running

URL      : http://localhost:${port}${basePath}/
Frontend : ${dist}
API      : ${apiTarget}
`)
  })
}
