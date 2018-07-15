const WebSocketServer = require('ws').Server
const http = require('http')
const path = require('path')
const express = require('express')
const ws = require('ws')
const url = require('url')

const app = express()
app.use(express.static(path.join(__dirname, '/public')))

const server = http.createServer(app)

let subhosts = {}
let clients = {}

server.listen(process.env.PORT || 8080)

const wss = new WebSocketServer({
  server: server
})

function broadcast (data, ws, sendToAll) {
  wss.clients.forEach((client) => {
    if (client && client.send) {
      if (sendToAll) {
        client.send(JSON.stringify(data))
      } else if (client.id === ws.id) {
        client.send(JSON.stringify(data))
      }
    }
  })
}

wss.on('connection', (ws, req) => {

  ws.on('message', (data) => {
    data = JSON.parse(data)
    
    switch (data.type) {
      case 'pad.connect':
        data.message = subhosts[data.id]
        broadcast(data, ws)
      case 'pad.update':
        subhosts[data.id] = data.message
        ws.id = req.url.replace('/', '')
        broadcast(data, ws)
        break
      default:
        break
    }
  })
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.get('/:id', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})
