const WebSocketServer = require('ws').Server
const http = require('http')
const path = require('path')
const express = require('express')
const ws = require('ws')

const app = express()
app.use(express.static(path.join(__dirname, '/public')))

const server = http.createServer(app)

let subhosts = {}

server.listen(process.env.PORT || 8080)

const wss = new WebSocketServer({
  server: server
})

function broadcast (data, ws, sendToAll) {
  wss.clients.forEach((client) => {
    if (client && client.send) {
      if (sendToAll) {
        client.send(JSON.stringify(data))
      } else if (client === ws) {
        console.log('>>> sending to clients')
        client.send(JSON.stringify(data))
      }
    }
  })
}

wss.on('connection', (ws) => {
  ws.onopen = function (data) {
    console.log('open', data)
  }
  ws.on('message', (data) => {
    data = JSON.parse(data)
    
    switch (data.type) {
      case 'pad.update':
        subhosts[ws] = data.message
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
  console.log(req.params)
  ws.
  res.sendFile(__dirname + '/views/index.html')
})