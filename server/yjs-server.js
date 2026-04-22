import http from 'http'
import { WebSocketServer } from 'ws'
import yWebsocketUtils from 'y-websocket/bin/utils'

const { setupWSConnection } = yWebsocketUtils

const PORT = Number(process.env.YJS_PORT || 1234)

const server = http.createServer((_, res) => {
	res.writeHead(200, { 'Content-Type': 'text/plain' })
	res.end('Yjs server is running')
})

const wss = new WebSocketServer({ server })

wss.on('connection', (conn, req) => {
	setupWSConnection(conn, req)
})

server.listen(PORT, () => {
	console.log(`Yjs WebSocket server running on ws://localhost:${PORT}`)
})