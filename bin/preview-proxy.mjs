#!/usr/bin/env node
import path from 'path'
import process from 'process'
import { startServer } from '../src/server.mjs'

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : def
}

const dist = path.resolve(arg('dist', 'dist'))
const apiTarget = arg('api')
const port = Number(arg('port', 4173))


if (!apiTarget) {
  console.error('❌ Missing --api http://backend')
  process.exit(1)
}

const basePath = arg('base', '/')
const apiPrefix = arg('api-prefix', '/api')

startServer({
  dist,
  basePath,
  apiTarget,
  apiPrefix,
  port
})

