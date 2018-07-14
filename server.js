const WebSocketServer = require('ws').Server
const http = require('http')
const path = require('path')
const express = require('express')
const ws = require('ws')

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
        clients[ws.id].send(JSON.stringify(data))
      }
    }
  })
}

wss.on('connection', (ws) => {
  console.log(ws)
  ws.open = function (data) {
    console.log('open', data)
  }
  ws.on('message', (data) => {
    data = JSON.parse(data)
    
    if (ws.id && !clients[ws.id]) {
      clients[ws.id] = ws  
    }
    
    switch (data.type) {
      case 'pad.update':
        subhosts[ws] = data.message
        ws.id = data.id
        broadcast(data, ws.id)
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
